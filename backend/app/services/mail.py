from __future__ import annotations

import logging
import re
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

from app.config import Settings
from app.models import Quote

logger = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def try_send_quote_notification(quote: Quote, settings: Settings) -> None:
    try:
        send_internal_quote_notification(quote, settings)
    except Exception:
        logger.exception("Failed to send internal quote notification for %s", quote.quote_number)

    customer_email = _customer_email(quote)
    if not customer_email:
        logger.info(
            "No customer email for %s; skip confirmation",
            quote.quote_number,
        )
        return

    try:
        send_customer_confirmation(quote, settings, customer_email)
    except Exception:
        logger.exception(
            "Failed to send customer confirmation for %s to %s",
            quote.quote_number,
            customer_email,
        )


def send_internal_quote_notification(quote: Quote, settings: Settings) -> bool:
    if not _smtp_ready(settings):
        return False

    payload = quote.form_payload if isinstance(quote.form_payload, dict) else {}
    product = payload.get("product") if isinstance(payload.get("product"), dict) else {}
    delivery = payload.get("delivery") if isinstance(payload.get("delivery"), dict) else {}

    admin_url = f"{settings.frontend_origin.rstrip('/')}/admin"
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
        ]
    )

    message = EmailMessage()
    message["Subject"] = f"[LumaSign] Neue Anfrage {quote.quote_number}"
    message["From"] = formataddr(("LumaSign Europe", settings.smtp_from))
    message["To"] = settings.project_email
    message.set_content(body)

    _send_message(message, settings)
    logger.info("Internal quote notification sent for %s", quote.quote_number)
    return True


def send_customer_confirmation(quote: Quote, settings: Settings, customer_email: str) -> bool:
    if not _smtp_ready(settings):
        return False

    payload = quote.form_payload if isinstance(quote.form_payload, dict) else {}
    product = payload.get("product") if isinstance(payload.get("product"), dict) else {}
    delivery = payload.get("delivery") if isinstance(payload.get("delivery"), dict) else {}

    body = "\n".join(
        [
            "Wir haben Ihre Anfrage erhalten. Der zuständige Kundenbetreuer wird sich innerhalb von 24 Stunden mit Ihnen in Verbindung setzen. Sollten Sie Fragen haben, können Sie uns über die folgenden Kontaktdaten erreichen:",
            "E-Mail: projects@lumasign.eu",
            "Telefon: 0211 9846 3093",
            "",
            f"Vorgangsnummer: {quote.quote_number}",
            f"Produkt: {product.get('family') or quote.project_type or '—'}",
            f"Variante: {product.get('variant') or '—'}",
            f"Kontakt: {delivery.get('contact') or '—'}",
            f"Firma: {delivery.get('company') or '—'}",
            f"Ort: {delivery.get('cityPostal') or delivery.get('country') or '—'}",
            f"Richtpreis: {quote.indicative_price_label or '—'}",
        ]
    )

    message = EmailMessage()
    message["Subject"] = f"Wir haben Ihre Anfrage erhalten – {quote.quote_number}"
    message["From"] = formataddr(("LumaSign Europe", settings.project_email))
    message["To"] = customer_email
    message["Reply-To"] = settings.project_email
    message.set_content(body)

    _send_message(
        message,
        settings,
        username=settings.project_email,
        password=settings.smtp_password,
    )
    logger.info("Customer confirmation sent for %s to %s", quote.quote_number, customer_email)
    return True


def _customer_email(quote: Quote) -> str | None:
    payload = quote.form_payload if isinstance(quote.form_payload, dict) else {}
    delivery = payload.get("delivery") if isinstance(payload.get("delivery"), dict) else {}
    contact = str(delivery.get("contact") or "").strip()
    if EMAIL_RE.fullmatch(contact):
        return contact.lower()
    return None


def _smtp_ready(settings: Settings) -> bool:
    if not settings.smtp_enabled:
        logger.info("SMTP disabled; skip mail for %s", "quote")
        return False
    if not settings.smtp_password:
        logger.warning("SMTP password missing; skip mail send")
        return False
    return True


def _send_message(
    message: EmailMessage,
    settings: Settings,
    *,
    username: str | None = None,
    password: str | None = None,
) -> None:
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(
        settings.smtp_host,
        settings.smtp_port,
        context=context,
        timeout=30,
    ) as server:
        server.login(username or settings.smtp_user, password or settings.smtp_password)
        server.send_message(message)
