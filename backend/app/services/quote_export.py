from __future__ import annotations

from io import BytesIO
from typing import Any

from openpyxl import Workbook


def build_quote_excel(quote: Any) -> bytes:
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Quote Request"

    payload = quote.form_payload if isinstance(quote.form_payload, dict) else {}
    product = _as_dict(payload.get("product"))
    dimensions = _as_dict(payload.get("dimensions"))
    lighting = _as_dict(payload.get("lighting"))
    installation = _as_dict(payload.get("installation"))
    delivery = _as_dict(payload.get("delivery"))
    design = _as_dict(payload.get("design"))
    materials = _as_dict(payload.get("materials"))

    rows = [
        ("Quote number", quote.quote_number),
        ("Status", quote.status),
        ("Submitted at", quote.created_at.isoformat(sep=" ", timespec="seconds") if quote.created_at else ""),
        ("Locale", quote.locale),
        ("Indicative price", quote.indicative_price_label or ""),
        ("Product family", product.get("family") or quote.project_type or ""),
        ("Variant", product.get("variant") or ""),
        ("Usage", product.get("usage") or installation.get("scene") or ""),
        ("Width value", dimensions.get("widthValue") or ""),
        ("Unit", dimensions.get("unit") or ""),
        ("Width mm", dimensions.get("widthMm") or ""),
        ("Height mm", dimensions.get("heightMm") or ""),
        ("Depth mm", dimensions.get("depthMm") or ""),
        ("Quantity", payload.get("quantity") or ""),
        ("Material", payload.get("material") or ""),
        ("Main material", materials.get("mainMaterial") or ""),
        ("Edge material", materials.get("edgeMaterial") or ""),
        ("Front cover material", materials.get("frontCoverMaterial") or ""),
        ("Light colour", lighting.get("color") or ""),
        ("Lighting type", lighting.get("type") or ""),
        ("Color temperature", lighting.get("colorTemperature") or ""),
        ("Brightness", lighting.get("brightness") or ""),
        ("Installation needed", installation.get("needed")),
        ("Installation service", installation.get("service") or ""),
        ("Installation method", installation.get("method") or ""),
        ("Deadline", payload.get("deadline") or ""),
        ("Design style", design.get("style") or ""),
        ("Delivery country", delivery.get("country") or installation.get("country") or ""),
        ("Delivery city / postcode", delivery.get("cityPostal") or installation.get("city") or ""),
        ("Delivery company", delivery.get("company") or ""),
        ("Delivery contact", delivery.get("contact") or ""),
        ("Customer notes", quote.customer_notes or ""),
        ("Reference URL", payload.get("referenceUrl") or ""),
        ("Uploaded files", ", ".join(file.original_name for file in quote.files) if quote.files else ""),
    ]

    sheet.append(["Field", "Value"])
    for label, value in rows:
        sheet.append([label, _stringify(value)])

    sheet.column_dimensions["A"].width = 28
    sheet.column_dimensions["B"].width = 70

    buffer = BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _stringify(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "Yes" if value else "No"
    return str(value)
