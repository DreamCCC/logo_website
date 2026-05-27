from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import GalleryItem, Product
from app.schemas import GalleryItemPublic, ProductPublic

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/products", response_model=list[ProductPublic])
def list_products(db: Session = Depends(get_db)) -> list[ProductPublic]:
    products = db.scalars(
        select(Product)
        .where(Product.active.is_(True))
        .order_by(Product.sort_order.asc(), Product.id.asc())
    ).all()
    return [ProductPublic.model_validate(product) for product in products]


@router.get("/gallery", response_model=list[GalleryItemPublic])
def list_gallery(db: Session = Depends(get_db)) -> list[GalleryItemPublic]:
    items = db.scalars(
        select(GalleryItem)
        .where(GalleryItem.published.is_(True))
        .order_by(GalleryItem.sort_order.asc(), GalleryItem.id.asc())
    ).all()
    return [GalleryItemPublic.model_validate(item) for item in items]
