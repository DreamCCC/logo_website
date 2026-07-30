from datetime import datetime
from pathlib import Path
from secrets import token_urlsafe
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import Settings, get_settings
from app.db import get_db
from app.models import Quote, QuoteFile, User
from app.schemas import QuotePublic, StartingPriceResponse
from app.security import get_current_user, get_optional_user, hash_password
from app.services.pricing import calculate_starting_price

router = APIRouter(prefix="/quotes", tags=["quotes"])

ALLOWED_MIME_PREFIXES = ("image/", "application/pdf")
ALLOWED_DESIGN_MIME_TYPES = {
    "application/postscript",
    "application/illustrator",
    "application/vnd.adobe.illustrator",
    "application/eps",
    "application/x-eps",
    "image/x-eps",
    "application/octet-stream",
}
ALLOWED_EXTENSIONS = {
    ".svg",
    ".ai",
    ".eps",
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".jfif",
    ".webp",
    ".gif",
    ".bmp",
    ".tif",
    ".tiff",
    ".heic",
    ".heif",
}

GUEST_QUOTE_EMAIL = "guest-quotes@lumasign.eu"


@router.get("/my", response_model=list[QuotePublic])
def list_my_quotes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[QuotePublic]:
    quotes = db.scalars(
        select(Quote)
        .where(Quote.user_id == current_user.id)
        .options(selectinload(Quote.files))
        .order_by(Quote.created_at.desc())
    ).all()
    return [QuotePublic.model_validate(quote) for quote in quotes]


@router.post("/starting-price", response_model=StartingPriceResponse)
def preview_starting_price(
    project_type: str | None = Form(default=None),
    variant: str | None = Form(default=None),
    material: str | None = Form(default=None),
    width_mm: int | None = Form(default=None),
    height_mm: int | None = Form(default=None),
    locale: str = Form(default="en"),
    db: Session = Depends(get_db),
) -> StartingPriceResponse:
    price, label = calculate_starting_price(
        db,
        project_type=_pricing_project_type(project_type, variant),
        material=material,
        width_mm=width_mm,
        height_mm=height_mm,
        locale=locale,
    )
    return StartingPriceResponse(indicative_price=float(price), indicative_price_label=label)


@router.post("", response_model=QuotePublic, status_code=status.HTTP_201_CREATED)
async def create_quote(
    application_type: str = Form(...),
    product_family: str | None = Form(default=None),
    variant: str | None = Form(default=None),
    usage: str | None = Form(default=None),
    design_style: str | None = Form(default=None),
    width_value: float | None = Form(default=None),
    unit: str | None = Form(default=None),
    width_mm: int | None = Form(default=None),
    height_mm: int | None = Form(default=None),
    depth_mm: int | None = Form(default=None),
    quantity: int = Form(default=1),
    material: str | None = Form(default=None),
    main_material: str | None = Form(default=None),
    edge_material: str | None = Form(default=None),
    front_cover_material: str | None = Form(default=None),
    lighting_type: str | None = Form(default=None),
    color_temp: str | None = Form(default=None),
    brightness: str | None = Form(default=None),
    light_color: str | None = Form(default=None),
    need_installation: bool = Form(default=False),
    installation_service: str | None = Form(default=None),
    installation_scene: str | None = Form(default=None),
    installation_method: str | None = Form(default=None),
    mounting: str | None = Form(default=None),
    deadline: str | None = Form(default=None),
    country: str | None = Form(default=None),
    postal_code: str | None = Form(default=None),
    city: str | None = Form(default=None),
    delivery_company: str | None = Form(default=None),
    delivery_contact: str | None = Form(default=None),
    reference_url: str | None = Form(default=None),
    customer_notes: str | None = Form(default=None),
    locale: str = Form(default="en"),
    files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    current_user: User | None = Depends(get_optional_user),
) -> QuotePublic:
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    if not (delivery_contact or "").strip():
        raise HTTPException(status_code=400, detail="Delivery contact is required")

    normalized_width_mm = width_mm or _to_millimetres(width_value, unit)
    if normalized_width_mm is None or normalized_width_mm < 1:
        raise HTTPException(status_code=400, detail="Width must be greater than zero")

    resolved_product_family = product_family or application_type
    resolved_usage = usage or installation_scene
    resolved_mounting = mounting or installation_method
    resolved_material = material or "custom"
    owner = current_user or _get_or_create_guest_user(db)

    price, label = calculate_starting_price(
        db,
        project_type=_pricing_project_type(resolved_product_family, variant),
        material=resolved_material,
        width_mm=normalized_width_mm,
        height_mm=height_mm,
        locale=locale,
    )

    form_payload = {
        "applicationType": application_type,
        "product": {
            "family": resolved_product_family,
            "variant": variant,
            "usage": resolved_usage,
        },
        "dimensions": {
            "widthValue": width_value,
            "unit": unit,
            "widthMm": normalized_width_mm,
            "heightMm": height_mm,
            "depthMm": depth_mm,
        },
        "quantity": quantity,
        "material": resolved_material,
        "materials": {
            "mainMaterial": main_material,
            "edgeMaterial": edge_material,
            "frontCoverMaterial": front_cover_material,
        },
        "design": {
            "style": design_style,
        },
        "lightingType": lighting_type or light_color,
        "colorTemperature": color_temp,
        "brightness": brightness,
        "lighting": {
            "type": lighting_type,
            "color": light_color,
            "colorTemperature": color_temp,
            "brightness": brightness,
        },
        "installation": {
            "needed": need_installation,
            "service": installation_service,
            "scene": resolved_usage,
            "method": resolved_mounting,
            "country": country,
            "postalCode": postal_code,
            "city": city,
        },
        "deadline": deadline,
        "delivery": {
            "country": country,
            "cityPostal": city,
            "company": delivery_company,
            "contact": delivery_contact,
        },
        "referenceUrl": reference_url,
        "submittedFields": {
            "application_type": application_type,
            "product_family": resolved_product_family,
            "variant": variant,
            "usage": resolved_usage,
            "design_style": design_style,
            "width_value": width_value,
            "unit": unit,
            "width_mm": normalized_width_mm,
            "height_mm": height_mm,
            "depth_mm": depth_mm,
            "quantity": quantity,
            "material": resolved_material,
            "main_material": main_material,
            "edge_material": edge_material,
            "front_cover_material": front_cover_material,
            "lighting_type": lighting_type,
            "color_temp": color_temp,
            "brightness": brightness,
            "light_color": light_color,
            "need_installation": need_installation,
            "installation_service": installation_service,
            "installation_scene": resolved_usage,
            "installation_method": resolved_mounting,
            "mounting": resolved_mounting,
            "deadline": deadline,
            "country": country,
            "postal_code": postal_code,
            "city": city,
            "delivery_company": delivery_company,
            "delivery_contact": delivery_contact,
            "reference_url": reference_url,
            "locale": locale,
        },
    }

    quote = Quote(
        quote_number=f"TEMP-{uuid4().hex[:12]}",
        user_id=owner.id,
        status="submitted",
        project_type=resolved_product_family,
        indicative_price=price,
        indicative_price_label=label,
        locale=locale if locale in {"en", "de"} else "en",
        customer_notes=customer_notes,
        form_payload=form_payload,
    )
    db.add(quote)
    db.flush()
    quote.quote_number = f"Q-{datetime.utcnow():%Y%m%d}-{quote.id:04d}"

    for upload in files:
        if not upload.filename:
            continue
        quote_file = await _store_upload(upload, quote.id, settings)
        db.add(quote_file)

    db.commit()
    db.refresh(quote)
    quote = db.scalar(
        select(Quote).where(Quote.id == quote.id).options(selectinload(Quote.files))
    )
    return QuotePublic.model_validate(quote)


def _get_or_create_guest_user(db: Session) -> User:
    guest = db.scalar(select(User).where(User.email == GUEST_QUOTE_EMAIL))
    if guest:
        return guest

    guest = User(
        email=GUEST_QUOTE_EMAIL,
        password_hash=hash_password(token_urlsafe(32)),
        company_name="Guest quote submissions",
        contact_name="Website guest",
        preferred_locale="de",
        is_admin=False,
    )
    db.add(guest)
    db.flush()
    return guest


async def _store_upload(upload: UploadFile, quote_id: int, settings: Settings) -> QuoteFile:
    extension = Path(upload.filename or "").suffix.lower()
    content_type = upload.content_type or "application/octet-stream"
    mime_allowed = any(content_type.startswith(prefix) for prefix in ALLOWED_MIME_PREFIXES)
    if content_type in ALLOWED_DESIGN_MIME_TYPES and extension in {".ai", ".eps"}:
        mime_allowed = True
    if not mime_allowed or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {upload.content_type}")

    content = await upload.read()
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="File is too large")

    safe_name = f"{uuid4().hex}{extension}"
    quote_dir = settings.upload_dir / str(quote_id)
    quote_dir.mkdir(parents=True, exist_ok=True)
    target = quote_dir / safe_name
    target.write_bytes(content)

    return QuoteFile(
        quote_id=quote_id,
        file_name=safe_name,
        original_name=upload.filename,
        mime_type=content_type,
        file_size=len(content),
        file_path=str(target),
        file_role="logo",
    )


def _to_millimetres(value: float | None, unit: str | None) -> int | None:
    if value is None:
        return None
    normalized_unit = (unit or "mm").lower()
    multiplier = {"mm": 1, "cm": 10, "m": 1000}.get(normalized_unit)
    if multiplier is None:
        raise HTTPException(status_code=400, detail="Unsupported dimension unit")
    return round(value * multiplier)


def _pricing_project_type(project_type: str | None, variant: str | None) -> str | None:
    if project_type == "letters" and variant == "non_lit":
        return "letters_non_lit"
    return project_type
