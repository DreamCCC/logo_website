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
    {
        "slug": "lumasign-letters",
        "name_en": "Letters",
        "name_de": "Buchstaben",
        "description_en": "Custom illuminated or non-illuminated 2D and 3D logo letters.",
        "description_de": "Individuelle beleuchtete oder unbeleuchtete 2D- und 3D-Logobuchstaben.",
        "category": "letters",
        "material": "acrylic",
        "base_price": Decimal("450.00"),
        "image_url": "/lumasign/projects/letters-backlit-number.webp",
        "specs_json": {"variants": ["front_lit", "side_lit", "back_lit", "full_lit", "non_lit"]},
        "sort_order": 100,
    },
    {
        "slug": "lumasign-lightboxes",
        "name_en": "Lightboxes",
        "name_de": "Leuchtkästen",
        "description_en": "Illuminated displays for retail, facades, events and projecting signs.",
        "description_de": "Leuchtdisplays für Retail, Fassaden, Events und Ausleger.",
        "category": "lightboxes",
        "material": "lightbox",
        "base_price": Decimal("650.00"),
        "image_url": "/lumasign/projects/lightbox-fabric-retail.jpeg",
        "specs_json": {"application": "indoor/outdoor"},
        "sort_order": 110,
    },
    {
        "slug": "lumasign-neon",
        "name_en": "LED Neon",
        "name_de": "LED Neon",
        "description_en": "Custom LED neon lettering, characters and brand logos.",
        "description_de": "Individuelle LED-Neon-Schriftzüge, Figuren und Markenlogos.",
        "category": "neon",
        "material": "acrylic",
        "base_price": Decimal("450.00"),
        "image_url": "/lumasign/projects/neon-custom-color-sign.jpg",
        "specs_json": {"lighting": "LED neon"},
        "sort_order": 120,
    },
    {
        "slug": "lumasign-infinity-mirror",
        "name_en": "Infinity Mirror",
        "name_de": "Infinity Mirror",
        "description_en": "Mirrored LED displays with a deep tunnel effect.",
        "description_de": "Verspiegelte LED-Displays mit räumlichem Tiefeneffekt.",
        "category": "infinity_mirror",
        "material": "acrylic",
        "base_price": Decimal("650.00"),
        "image_url": "/lumasign/projects/neon-infinity-mirror.jpg",
        "specs_json": {"lighting": "LED mirror"},
        "sort_order": 130,
    },
    {
        "slug": "lumasign-custom-concept",
        "name_en": "Custom concept",
        "name_de": "Nach individuellem Konzept",
        "description_en": "Complete signage concepts for facades, events, pylons and interiors.",
        "description_de": "Komplette Beschilderungskonzepte für Fassaden, Events, Pylone und Innenräume.",
        "category": "custom_concept",
        "material": "custom",
        "base_price": Decimal("750.00"),
        "image_url": "/lumasign/projects/xpeng-mitsubishi-facade.jpg",
        "specs_json": {"scope": "custom"},
        "sort_order": 140,
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
    {
        "name": "LumaSign non-illuminated letters starting price",
        "project_type": "letters_non_lit",
        "material": "acrylic",
        "starting_price": Decimal("299.00"),
        "sort_order": 100,
    },
    {
        "name": "LumaSign illuminated letters starting price",
        "project_type": "letters",
        "material": "acrylic",
        "starting_price": Decimal("450.00"),
        "sort_order": 110,
    },
    {
        "name": "LumaSign lightboxes starting price",
        "project_type": "lightboxes",
        "material": "lightbox",
        "starting_price": Decimal("650.00"),
        "sort_order": 120,
    },
    {
        "name": "LumaSign neon starting price",
        "project_type": "neon",
        "material": "acrylic",
        "starting_price": Decimal("450.00"),
        "sort_order": 130,
    },
    {
        "name": "LumaSign infinity mirror starting price",
        "project_type": "infinity_mirror",
        "material": "acrylic",
        "starting_price": Decimal("650.00"),
        "sort_order": 140,
    },
    {
        "name": "LumaSign custom concept starting price",
        "project_type": "custom_concept",
        "material": "custom",
        "starting_price": Decimal("750.00"),
        "sort_order": 150,
    },
]


def main() -> None:
    with SessionLocal() as db:
        for item in PRODUCTS:
            if not db.query(Product).filter(Product.slug == item["slug"]).first():
                db.add(Product(**item))
        if not db.query(GalleryItem).first():
            db.add_all(GalleryItem(**item) for item in GALLERY)
        for item in STARTING_RULES:
            if not db.query(StartingPriceRule).filter(StartingPriceRule.name == item["name"]).first():
                db.add(StartingPriceRule(**item))
        db.commit()
    print("Seed data inserted.")


if __name__ == "__main__":
    main()
