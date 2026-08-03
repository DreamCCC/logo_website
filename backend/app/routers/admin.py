from datetime import datetime
from pathlib import Path
from shutil import rmtree
from typing import Any, TypeVar

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, selectinload

from app.config import Settings, get_settings
from app.db import get_db
from app.models import GalleryItem, Product, Quote, QuoteFile, StartingPriceRule, User
from app.schemas import (
    AdminGalleryItemPublic,
    AdminProductPublic,
    AdminQuoteFilePublic,
    AdminQuotePublic,
    AdminQuoteStatusUpdate,
    AdminStartingPriceRulePublic,
    AdminSummary,
    AdminUserPublic,
    AdminUserRoleUpdate,
)
from app.security import get_current_admin_user, get_super_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])

ModelT = TypeVar("ModelT")
SchemaT = TypeVar("SchemaT", bound=BaseModel)

QUOTE_STATUSES = {"new", "in_progress", "completed"}
LEGACY_STATUS_MAP = {"submitted": "new"}


@router.get("/summary", response_model=AdminSummary)
def summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> AdminSummary:
    return AdminSummary(
        users=_count(db, User),
        admins=db.scalar(select(func.count()).select_from(User).where(User.is_admin.is_(True))) or 0,
        quotes=_count(db, Quote),
        quote_files=_count(db, QuoteFile),
        products=_count(db, Product),
        gallery_items=_count(db, GalleryItem),
        starting_price_rules=_count(db, StartingPriceRule),
    )


@router.get("/users")
def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict[str, Any]:
    return _page(
        db,
        select(User).order_by(User.created_at.desc(), User.id.desc()),
        User,
        AdminUserPublic,
        page,
        page_size,
    )


@router.patch("/users/{user_id}/admin", response_model=AdminUserPublic)
def update_user_admin_role(
    user_id: int,
    payload: AdminUserRoleUpdate,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    _: User = Depends(get_super_admin_user),
) -> AdminUserPublic:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.email.lower() == settings.admin_email.lower() and not payload.is_admin:
        raise HTTPException(status_code=400, detail="Primary admin cannot be demoted")

    user.is_admin = payload.is_admin
    db.commit()
    db.refresh(user)
    return AdminUserPublic.model_validate(user)


@router.get("/quotes")
def list_quotes(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict[str, Any]:
    payload = _page(
        db,
        select(Quote)
        .options(selectinload(Quote.user), selectinload(Quote.files))
        .order_by(Quote.created_at.desc(), Quote.id.desc()),
        Quote,
        AdminQuotePublic,
        page,
        page_size,
    )
    for item in payload["items"]:
        normalized = _normalize_quote_status(item.status)
        if normalized != item.status:
            item.status = normalized
    return payload


@router.patch("/quotes/{quote_id}/status", response_model=AdminQuotePublic)
def update_quote_status(
    quote_id: int,
    payload: AdminQuoteStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> AdminQuotePublic:
    quote = db.scalar(
        select(Quote)
        .where(Quote.id == quote_id)
        .options(selectinload(Quote.user), selectinload(Quote.files))
    )
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")

    next_status = _normalize_quote_status(payload.status)
    if next_status not in QUOTE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Status must be one of: new, in_progress, completed",
        )

    quote.status = next_status
    if next_status == "completed" and quote.quoted_at is None:
        quote.quoted_at = datetime.utcnow()
    db.commit()
    db.refresh(quote)
    result = AdminQuotePublic.model_validate(quote)
    result.status = _normalize_quote_status(result.status)
    return result


@router.delete("/quotes/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    _: User = Depends(get_current_admin_user),
) -> None:
    quote = db.scalar(
        select(Quote)
        .where(Quote.id == quote_id)
        .options(selectinload(Quote.files))
    )
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found")

    current_status = _normalize_quote_status(quote.status)
    if current_status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Only completed quotes can be deleted",
        )

    upload_dir = Path(settings.upload_dir) / str(quote.id)
    db.delete(quote)
    db.commit()
    if upload_dir.exists():
        rmtree(upload_dir, ignore_errors=True)


@router.get("/quote-files")
def list_quote_files(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict[str, Any]:
    return _page(
        db,
        select(QuoteFile).order_by(QuoteFile.created_at.desc(), QuoteFile.id.desc()),
        QuoteFile,
        AdminQuoteFilePublic,
        page,
        page_size,
    )


@router.get("/products")
def list_products(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict[str, Any]:
    return _page(
        db,
        select(Product).order_by(Product.sort_order.asc(), Product.id.desc()),
        Product,
        AdminProductPublic,
        page,
        page_size,
    )


@router.get("/gallery-items")
def list_gallery_items(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict[str, Any]:
    return _page(
        db,
        select(GalleryItem).order_by(GalleryItem.sort_order.asc(), GalleryItem.id.desc()),
        GalleryItem,
        AdminGalleryItemPublic,
        page,
        page_size,
    )


@router.get("/starting-price-rules")
def list_starting_price_rules(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> dict[str, Any]:
    return _page(
        db,
        select(StartingPriceRule).order_by(StartingPriceRule.sort_order.asc(), StartingPriceRule.id.desc()),
        StartingPriceRule,
        AdminStartingPriceRulePublic,
        page,
        page_size,
    )


def _count(db: Session, model: type[ModelT]) -> int:
    return db.scalar(select(func.count()).select_from(model)) or 0


def _normalize_quote_status(value: str | None) -> str:
    status_value = (value or "new").strip().lower()
    return LEGACY_STATUS_MAP.get(status_value, status_value)


def _page(
    db: Session,
    query: Select[tuple[ModelT]],
    model: type[ModelT],
    schema: type[SchemaT],
    page: int,
    page_size: int,
) -> dict[str, Any]:
    total = _count(db, model)
    rows = db.scalars(query.offset((page - 1) * page_size).limit(page_size)).all()
    return {
        "items": [schema.model_validate(row) for row in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, (total + page_size - 1) // page_size),
    }
