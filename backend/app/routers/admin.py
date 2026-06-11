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
    AdminStartingPriceRulePublic,
    AdminSummary,
    AdminUserPublic,
    AdminUserRoleUpdate,
)
from app.security import get_current_admin_user, get_super_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])

ModelT = TypeVar("ModelT")
SchemaT = TypeVar("SchemaT", bound=BaseModel)


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
    return _page(
        db,
        select(Quote)
        .options(selectinload(Quote.user), selectinload(Quote.files))
        .order_by(Quote.created_at.desc(), Quote.id.desc()),
        Quote,
        AdminQuotePublic,
        page,
        page_size,
    )


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
