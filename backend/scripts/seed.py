from decimal import Decimal

from app.db import SessionLocal
from app.models import GalleryItem, Product, StartingPriceRule


PRODUCTS = [
    {
        "slug": "non-illuminated-logo",
        "name_en": "Non-illuminated Logo",
        "name_de": "Nicht beleuchtetes Logo",
        "description_en": "Clean acrylic, aluminium or stainless logo elements without internal illumination.",
        "description_de": "Saubere Acryl-, Aluminium- oder Edelstahl-Logo-Elemente ohne interne Beleuchtung.",
        "category": "non_illuminated_logo",
        "material": "acrylic",
        "base_price": Decimal("299.00"),
        "image_url": "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1600&auto=format&fit=crop",
        "specs_json": {"lighting": "none", "application": "indoor/facade"},
        "sort_order": 10,
    },
    {
        "slug": "illuminated-logo",
        "name_en": "Illuminated Logo",
        "name_de": "Beleuchtetes Logo",
        "description_en": "Frontlit, backlit or halo-lit logo systems with LED modules.",
        "description_de": "Frontbeleuchtete, hinterleuchtete oder Halo-beleuchtete Logo-Systeme mit LED-Modulen.",
        "category": "illuminated_logo",
        "material": "acrylic",
        "base_price": Decimal("450.00"),
        "image_url": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop",
        "specs_json": {"lighting": "frontlit/backlit", "temperature": "4000K"},
        "sort_order": 20,
    },
    {
        "slug": "lightbox",
        "name_en": "Lightbox",
        "name_de": "Lightbox",
        "description_en": "Large-format LED lightbox for campaigns, logo walls and showrooms.",
        "description_de": "Großformatiger LED-Leuchtkasten für Kampagnen, Logo-Wände und Showrooms.",
        "category": "lightbox",
        "material": "textile",
        "base_price": Decimal("650.00"),
        "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
        "specs_json": {"graphic": "replaceable textile", "lighting": "LED"},
        "sort_order": 30,
    },
    {
        "slug": "side-mounted-logo",
        "name_en": "Side-mounted Logo",
        "name_de": "Seitlich montiertes Logo",
        "description_en": "Projecting side-mounted logo structures for special facade visibility.",
        "description_de": "Auskragende, seitlich montierte Logo-Konstruktionen für besondere Fassadensichtbarkeit.",
        "category": "side_mounted_logo",
        "material": "aluminium",
        "base_price": None,
        "image_url": "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1600&auto=format&fit=crop",
        "specs_json": {"mounting": "side-mounted", "application": "facade projection"},
        "sort_order": 40,
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
        "name": "Non-illuminated logo starting price",
        "project_type": "non_illuminated_logo",
        "material": "acrylic",
        "max_width_mm": 1000,
        "starting_price": Decimal("299.00"),
        "sort_order": 10,
    },
    {
        "name": "Illuminated logo starting price",
        "project_type": "illuminated_logo",
        "material": "acrylic",
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
    {
        "name": "Side-mounted logo starting price",
        "project_type": "side_mounted_logo",
        "material": "aluminium",
        "starting_price": Decimal("750.00"),
        "sort_order": 40,
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
