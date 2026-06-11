from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    DECIMAL,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str | None] = mapped_column(String(255))
    contact_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    preferred_locale: Mapped[str] = mapped_column(String(8), nullable=False, default="en")
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime)

    quotes: Mapped[list["Quote"]] = relationship(back_populates="user")


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    quote_number: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="submitted")
    project_type: Mapped[str | None] = mapped_column(String(64))
    indicative_price: Mapped[float | None] = mapped_column(DECIMAL(12, 2))
    indicative_price_label: Mapped[str | None] = mapped_column(String(64))
    locale: Mapped[str] = mapped_column(String(8), nullable=False, default="en")
    customer_notes: Mapped[str | None] = mapped_column(Text)
    form_payload: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
    quoted_at: Mapped[datetime | None] = mapped_column(DateTime)

    user: Mapped[User] = relationship(back_populates="quotes")
    files: Mapped[list["QuoteFile"]] = relationship(
        back_populates="quote", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_quotes_user_created", "user_id", "created_at"),
        Index("idx_quotes_status_created", "status", "created_at"),
    )


class QuoteFile(Base):
    __tablename__ = "quote_files"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    quote_id: Mapped[int] = mapped_column(
        ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    original_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(128), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_role: Mapped[str] = mapped_column(String(32), nullable=False, default="other")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    quote: Mapped[Quote] = relationship(back_populates="files")

    __table_args__ = (Index("idx_quote_files_quote", "quote_id"),)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    name_de: Mapped[str] = mapped_column(String(255), nullable=False)
    description_en: Mapped[str | None] = mapped_column(Text)
    description_de: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    material: Mapped[str | None] = mapped_column(String(128))
    base_price: Mapped[float | None] = mapped_column(DECIMAL(12, 2))
    image_url: Mapped[str | None] = mapped_column(String(512))
    specs_json: Mapped[dict | None] = mapped_column(JSON)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("idx_products_category_active", "category", "active"),
        Index("idx_products_sort", "sort_order"),
    )


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title_en: Mapped[str] = mapped_column(String(255), nullable=False)
    title_de: Mapped[str] = mapped_column(String(255), nullable=False)
    description_en: Mapped[str | None] = mapped_column(Text)
    description_de: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str] = mapped_column(String(512), nullable=False)
    category: Mapped[str | None] = mapped_column(String(64))
    published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("idx_gallery_category_published", "category", "published"),
        Index("idx_gallery_sort", "sort_order"),
    )


class StartingPriceRule(Base):
    __tablename__ = "starting_price_rules"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    project_type: Mapped[str | None] = mapped_column(String(64))
    material: Mapped[str | None] = mapped_column(String(128))
    min_width_mm: Mapped[int | None] = mapped_column(Integer)
    max_width_mm: Mapped[int | None] = mapped_column(Integer)
    min_height_mm: Mapped[int | None] = mapped_column(Integer)
    max_height_mm: Mapped[int | None] = mapped_column(Integer)
    starting_price: Mapped[float] = mapped_column(DECIMAL(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="EUR")
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("idx_spr_lookup", "active", "project_type", "material", "sort_order"),
    )
