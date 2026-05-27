from decimal import Decimal

from app.db import SessionLocal
from app.models import GalleryItem, Product, StartingPriceRule


PRODUCTS = [
    {
        "slug": "acrylic-illuminated-logo",
        "name_en": "Acrylic Illuminated Logo",
        "name_de": "Acryl Leuchtlogo",
        "description_en": "Premium opal acrylic letters with low-consumption LED modules.",
        "description_de": "Hochwertige Opal-Acrylbuchstaben mit sparsamen LED-Modulen.",
        "category": "acrylic",
        "material": "acrylic",
        "base_price": Decimal("299.00"),
        "image_url": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1600&auto=format&fit=crop",
        "specs_json": {"lighting": "frontlit/backlit", "temperature": "4000K"},
        "sort_order": 10,
    },
    {
        "slug": "aluminium-profile-sign",
        "name_en": "Aluminium Profile Sign",
        "name_de": "Aluminium Profilbuchstaben",
        "description_en": "Durable aluminium profile signage for facades and retail spaces.",
        "description_de": "Robuste Aluminium-Profilwerbung für Fassaden und Verkaufsflächen.",
        "category": "aluminium",
        "material": "aluminium",
        "base_price": Decimal("450.00"),
        "image_url": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop",
        "specs_json": {"finish": "painted aluminium", "application": "facade"},
        "sort_order": 20,
    },
    {
        "slug": "textile-lightbox",
        "name_en": "Textile Lightbox",
        "name_de": "Textil-Leuchtkasten",
        "description_en": "Large-format LED lightbox for campaigns, logo walls and showrooms.",
        "description_de": "Großformatiger LED-Leuchtkasten für Kampagnen, Logo-Wände und Showrooms.",
        "category": "lightbox",
        "material": "textile",
        "base_price": Decimal("650.00"),
        "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
        "specs_json": {"graphic": "replaceable textile", "lighting": "LED"},
        "sort_order": 30,
    },
]

GALLERY = [
    {
        "title_en": "Facade logo for retail entrance",
        "title_de": "Fassadenlogo für Retail-Eingang",
        "description_en": "Backlit logo signage with clean aluminium tray.",
        "description_de": "Hinterleuchtete Logo-Werbung mit sauberer Aluminium-Trägerplatte.",
        "image_url": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1600&auto=format&fit=crop",
        "category": "facade",
        "sort_order": 10,
    },
    {
        "title_en": "Interior illuminated brand wall",
        "title_de": "Innenraum-Leuchtlogo an Markenwand",
        "description_en": "Indoor brand wall with warm white illumination.",
        "description_de": "Innenraum-Markenwand mit warmweißer Beleuchtung.",
        "image_url": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop",
        "category": "interior",
        "sort_order": 20,
    },
]

STARTING_RULES = [
    {
        "name": "Small acrylic logo",
        "project_type": "facade_logo",
        "material": "acrylic",
        "max_width_mm": 1000,
        "starting_price": Decimal("299.00"),
        "sort_order": 10,
    },
    {
        "name": "Aluminium profile logo",
        "project_type": "facade_logo",
        "material": "aluminium",
        "starting_price": Decimal("450.00"),
        "sort_order": 20,
    },
    {
        "name": "Lightbox starting price",
        "project_type": "lightbox",
        "material": "lightbox",
        "starting_price": Decimal("650.00"),
        "sort_order": 30,
    },
]


def main() -> None:
    with SessionLocal() as db:
        if not db.query(Product).first():
            db.add_all(Product(**item) for item in PRODUCTS)
        if not db.query(GalleryItem).first():
            db.add_all(GalleryItem(**item) for item in GALLERY)
        if not db.query(StartingPriceRule).first():
            db.add_all(StartingPriceRule(**item) for item in STARTING_RULES)
        db.commit()
    print("Seed data inserted.")


if __name__ == "__main__":
    main()
