from __future__ import annotations

import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.config import Settings
from app.models import Quote
from app.services.quote_export import build_quote_excel

logger = logging.getLogger(__name__)


def send_quote_notification(quote: Quote, settings: Settings) -> bool:
    if not settings.smtp_enabled:
        logger.info("SMTP disabled; skip quote notification for %s", quote.quote_number)
        return False
    if not settings.smtp_password:
        logger.warning("SMTP password missing; skip quote notification for %s", quote.quote_number)
        return False

    payload = quote.form_payload if isinstance(quote.form_payload, dict) else {}
    product = payload.get("product") if isinstance(payload.get("product"), dict) else {}
    delivery = payload.get("delivery") if isinstance(payload.get("delivery"), dict) else {}

    admin_url = f"{settings.frontend_origin.rstrip('/')}/admin"
    subject = f"[LumaSign] Neue Anfrage {quote.quote_number}"
    body = "\n".join(
        [
            "Eine neue Kundenanfrage ist eingegangen.",
            "",
            f"Vorgangsnummer: {quote.quote_number}",
            f"Produkt: {product.get('family') or quote.project_type or '—'}",
            f"Variante: {product.get('variant') or '—'}",
            f"Kontakt: {delivery.get('contact') or '—'}",
            f"Firma: {delivery.get('company') or '—'}",
            f"Ort: {delivery.get('cityPostal') or delivery.get('country') or '—'}",
            f"Richtpreis: {quote.indicative_price_label or '—'}",
            "",
            f"Admin: {admin_url}",
            "",
            "Die Excel-Datei im Anhang enthält die vollständigen Formulardaten.",
        ]
    )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from
    message["To"] = settings.project_email
    message.set_content(body)

    excel_bytes = build_quote_excel(quote)
    message.add_attachment(
        excel_bytes,
        maintype="application",
        subtype="vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"{quote.quote_number}.xlsx",
    )

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(
        settings.smtp_host,
        settings.smtp_port,
        context=context,
        timeout=30,
    ) as server:
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(message)

    logger.info("Quote notification sent for %s to %s", quote.quote_number, settings.project_email)
    return True


def try_send_quote_notification(quote: Quote, settings: Settings) -> None:
    try:
        send_quote_notification(quote, settings)
    except Exception:
        logger.exception("Failed to send quote notification for %s", quote.quote_number)
