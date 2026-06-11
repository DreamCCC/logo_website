from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import Settings, get_settings
from app.db import get_db
from app.models import Quote, QuoteFile, User
from app.schemas import QuotePublic, StartingPriceResponse
from app.security import get_current_user
from app.services.pricing import calculate_starting_price

router = APIRouter(prefix="/quotes", tags=["quotes"])

ALLOWED_MIME_PREFIXES = ("image/", "application/pdf")


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
    material: str | None = Form(default=None),
    width_mm: int | None = Form(default=None),
    height_mm: int | None = Form(default=None),
    locale: str = Form(default="en"),
    db: Session = Depends(get_db),
) -> StartingPriceResponse:
    price, label = calculate_starting_price(
        db,
        project_type=project_type,
        material=material,
        width_mm=width_mm,
        height_mm=height_mm,
        locale=locale,
    )
    return StartingPriceResponse(indicative_price=float(price), indicative_price_label=label)


@router.post("", response_model=QuotePublic, status_code=status.HTTP_201_CREATED)
async def create_quote(
    application_type: str = Form(...),
    width_mm: int = Form(...),
    height_mm: int = Form(...),
    depth_mm: int | None = Form(default=None),
    quantity: int = Form(default=1),
    material: str = Form(...),
    main_material: str | None = Form(default=None),
    edge_material: str | None = Form(default=None),
    front_cover_material: str | None = Form(default=None),
    lighting_type: str | None = Form(default=None),
    color_temp: str | None = Form(default=None),
    brightness: str | None = Form(default=None),
    need_installation: bool = Form(default=False),
    installation_scene: str | None = Form(default=None),
    installation_method: str | None = Form(default=None),
    country: str | None = Form(default=None),
    postal_code: str | None = Form(default=None),
    city: str | None = Form(default=None),
    reference_url: str | None = Form(default=None),
    customer_notes: str | None = Form(default=None),
    locale: str = Form(default="en"),
    files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    current_user: User = Depends(get_current_user),
) -> QuotePublic:
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    price, label = calculate_starting_price(
        db,
        project_type=application_type,
        material=material,
        width_mm=width_mm,
        height_mm=height_mm,
        locale=locale,
    )

    form_payload = {
        "applicationType": application_type,
        "dimensions": {
            "widthMm": width_mm,
            "heightMm": height_mm,
            "depthMm": depth_mm,
        },
        "quantity": quantity,
        "material": material,
        "materials": {
            "mainMaterial": main_material,
            "edgeMaterial": edge_material,
            "frontCoverMaterial": front_cover_material,
        },
        "lightingType": lighting_type,
        "colorTemperature": color_temp,
        "brightness": brightness,
        "installation": {
            "needed": need_installation,
            "scene": installation_scene,
            "method": installation_method,
            "country": country,
            "postalCode": postal_code,
            "city": city,
        },
        "referenceUrl": reference_url,
        "submittedFields": {
            "application_type": application_type,
            "width_mm": width_mm,
            "height_mm": height_mm,
            "depth_mm": depth_mm,
            "quantity": quantity,
            "material": material,
            "main_material": main_material,
            "edge_material": edge_material,
            "front_cover_material": front_cover_material,
            "lighting_type": lighting_type,
            "color_temp": color_temp,
            "brightness": brightness,
            "need_installation": need_installation,
            "installation_scene": installation_scene,
            "installation_method": installation_method,
            "country": country,
            "postal_code": postal_code,
            "city": city,
            "reference_url": reference_url,
            "locale": locale,
        },
    }

    quote = Quote(
        quote_number=f"TEMP-{uuid4().hex[:12]}",
        user_id=current_user.id,
        status="submitted",
        project_type=application_type,
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


async def _store_upload(upload: UploadFile, quote_id: int, settings: Settings) -> QuoteFile:
    if not any((upload.content_type or "").startswith(prefix) for prefix in ALLOWED_MIME_PREFIXES):
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {upload.content_type}")

    content = await upload.read()
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="File is too large")

    extension = Path(upload.filename).suffix.lower()
    safe_name = f"{uuid4().hex}{extension}"
    quote_dir = settings.upload_dir / str(quote_id)
    quote_dir.mkdir(parents=True, exist_ok=True)
    target = quote_dir / safe_name
    target.write_bytes(content)

    return QuoteFile(
        quote_id=quote_id,
        file_name=safe_name,
        original_name=upload.filename,
        mime_type=upload.content_type or "application/octet-stream",
        file_size=len(content),
        file_path=str(target),
        file_role="logo",
    )
