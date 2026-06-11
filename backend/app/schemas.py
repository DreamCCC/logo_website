from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    company_name: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    preferred_locale: str = "en"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    company_name: str | None
    contact_name: str | None
    phone: str | None
    preferred_locale: str
    is_admin: bool

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserPublic


class QuoteFilePublic(BaseModel):
    id: int
    original_name: str
    mime_type: str
    file_size: int
    file_role: str
    created_at: datetime

    class Config:
        from_attributes = True


class QuotePublic(BaseModel):
    id: int
    quote_number: str
    status: str
    project_type: str | None
    indicative_price: float | None
    indicative_price_label: str | None
    locale: str
    customer_notes: str | None
    form_payload: dict[str, Any] | None
    created_at: datetime
    files: list[QuoteFilePublic] = []

    class Config:
        from_attributes = True


class StartingPriceResponse(BaseModel):
    indicative_price: float
    indicative_price_label: str


class ProductPublic(BaseModel):
    id: int
    slug: str
    name_en: str
    name_de: str
    description_en: str | None
    description_de: str | None
    category: str
    material: str | None
    base_price: float | None
    image_url: str | None
    specs_json: dict[str, Any] | None

    class Config:
        from_attributes = True


class GalleryItemPublic(BaseModel):
    id: int
    title_en: str
    title_de: str
    description_en: str | None
    description_de: str | None
    image_url: str
    category: str | None

    class Config:
        from_attributes = True


class AdminUserPublic(UserPublic):
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None


class AdminUserRoleUpdate(BaseModel):
    is_admin: bool


class AdminQuoteUser(BaseModel):
    id: int
    email: EmailStr
    company_name: str | None
    contact_name: str | None

    class Config:
        from_attributes = True


class AdminQuotePublic(QuotePublic):
    updated_at: datetime
    quoted_at: datetime | None
    user: AdminQuoteUser


class AdminQuoteFilePublic(QuoteFilePublic):
    quote_id: int
    file_name: str
    file_path: str


class AdminProductPublic(ProductPublic):
    active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


class AdminGalleryItemPublic(GalleryItemPublic):
    published: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


class AdminStartingPriceRulePublic(BaseModel):
    id: int
    name: str
    project_type: str | None
    material: str | None
    min_width_mm: int | None
    max_width_mm: int | None
    min_height_mm: int | None
    max_height_mm: int | None
    starting_price: float
    currency: str
    active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminSummary(BaseModel):
    users: int
    admins: int
    quotes: int
    quote_files: int
    products: int
    gallery_items: int
    starting_price_rules: int
