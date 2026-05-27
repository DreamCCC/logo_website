from decimal import Decimal

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.models import StartingPriceRule


DEFAULT_BY_MATERIAL = {
    "acrylic": Decimal("299.00"),
    "aluminium": Decimal("450.00"),
    "stainless": Decimal("520.00"),
    "lightbox": Decimal("650.00"),
}


def _matches_range(value: int | None, min_value: int | None, max_value: int | None) -> bool:
    if value is None:
        return True
    if min_value is not None and value < min_value:
        return False
    if max_value is not None and value > max_value:
        return False
    return True


def calculate_starting_price(
    db: Session,
    *,
    project_type: str | None,
    material: str | None,
    width_mm: int | None,
    height_mm: int | None,
    locale: str,
) -> tuple[Decimal, str]:
    rules = db.scalars(
        select(StartingPriceRule)
        .where(
            StartingPriceRule.active.is_(True),
            or_(StartingPriceRule.project_type.is_(None), StartingPriceRule.project_type == project_type),
            or_(StartingPriceRule.material.is_(None), StartingPriceRule.material == material),
        )
        .order_by(StartingPriceRule.sort_order.asc(), StartingPriceRule.id.asc())
    ).all()

    for rule in rules:
        if _matches_range(width_mm, rule.min_width_mm, rule.max_width_mm) and _matches_range(
            height_mm, rule.min_height_mm, rule.max_height_mm
        ):
            price = Decimal(rule.starting_price)
            return price, _format_label(price, locale)

    price = DEFAULT_BY_MATERIAL.get((material or "").lower(), Decimal("350.00"))
    return price, _format_label(price, locale)


def _format_label(price: Decimal, locale: str) -> str:
    prefix = "ab" if locale == "de" else "from"
    return f"{prefix} EUR {price.quantize(Decimal('1'))}"
