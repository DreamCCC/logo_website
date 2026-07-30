import type { Locale } from "@/lib/i18n";

export type LocalizedText = {
  de: string;
  en: string;
};

export type ProductFamily =
  | "letters"
  | "lightboxes"
  | "neon"
  | "infinity_mirror"
  | "custom_concept";

export type ProductVariant = {
  value: string;
  label: LocalizedText;
  image?: string;
  effect?: "front-lit" | "side-lit" | "back-lit" | "full-lit" | "non-lit";
};

export type ProductDefinition = {
  id: ProductFamily;
  label: LocalizedText;
  description: LocalizedText;
  variants: ProductVariant[];
};

export const projectCards = [
  {
    image: "/lumasign/projects/popmart-storefront.jpg",
    title: { de: "Pop Mart-Ladenfront", en: "Pop Mart storefront" },
    subtitle: { de: "Frontbeleuchtete Ladenbeschriftung", en: "Front-lit retail signage" },
  },
  {
    image: "/lumasign/projects/xpeng-blade-sign.jpg",
    title: { de: "Xpeng Seitenwerbung", en: "Xpeng blade sign" },
    subtitle: { de: "Projektierender Leuchtkasten", en: "Projecting illuminated lightbox" },
  },
  {
    image: "/lumasign/projects/insta360-3d-letters.jpg",
    title: { de: "Insta360", en: "Insta360" },
    subtitle: { de: "Freistehende 3D-Buchstaben im Innenraum", en: "Freestanding indoor 3D letters" },
  },
  {
    image: "/lumasign/projects/ref-prada-facade.jpeg",
    title: { de: "Luxusfassade", en: "Luxury facade" },
    subtitle: {
      de: "Hochwertige, frontbeleuchtete Logobuchstaben",
      en: "Premium front-lit logo letters",
    },
  },
  {
    image: "/lumasign/projects/ref-orange-blade-sign.jpeg",
    title: { de: "Acryl-Fahnenschild", en: "Acrylic blade sign" },
    subtitle: { de: "Farbiger Wegweiser für den Einzelhandel", en: "Colourful retail wayfinding" },
  },
  {
    image: "/lumasign/projects/ref-warm-acrylic-cube.jpeg",
    title: { de: "Kreativer Leuchtkasten", en: "Creative lightbox" },
    subtitle: { de: "Transparente Objektpräsentation", en: "Transparent product presentation" },
  },
  {
    image: "/lumasign/projects/ref-blue-column-letters.jpeg",
    title: { de: "Vertikale Buchstaben", en: "Vertical letters" },
    subtitle: { de: "Aufgesetzte Beschilderung ohne Beleuchtung", en: "Applied non-lit signage" },
  },
  {
    image: "/lumasign/projects/ref-pink-round-blade.jpeg",
    title: { de: "Rundes Fahnenschild", en: "Round blade sign" },
    subtitle: { de: "Kräftige Farben und hohe Sichtbarkeit", en: "Bold colour and high visibility" },
  },
  {
    image: "/lumasign/projects/ref-shadow-shelter.jpeg",
    title: { de: "Schattenschrift", en: "Shadow lettering" },
    subtitle: { de: "Licht, Tiefe und Wandstruktur", en: "Light, depth and wall texture" },
  },
  {
    image: "/lumasign/projects/ref-cups-display-box.jpeg",
    title: { de: "Objektvitrine", en: "Object display box" },
    subtitle: { de: "Werbeschild als Produktinszenierung", en: "Signage as product staging" },
  },
  {
    image: "/lumasign/projects/ref-shadow-number-sign.jpeg",
    title: { de: "Zahlen-Beschilderung", en: "Number signage" },
    subtitle: {
      de: "Architektonisches Spiel mit Licht und Schatten",
      en: "Architectural light and shadow",
    },
  },
  {
    image: "/lumasign/projects/ref-museum-corner-sign.jpeg",
    title: { de: "Eckbeschilderung", en: "Corner signage" },
    subtitle: { de: "Übersichtliche Wegführung", en: "Clear wayfinding" },
  },
  {
    image: "/lumasign/projects/ref-lotus-shadow.jpeg",
    title: { de: "Schattenprojektion", en: "Shadow projection" },
    subtitle: { de: "Stimmungsvolle Beleuchtung für Gastronomie", en: "Atmospheric hospitality lighting" },
  },
  {
    image: "/lumasign/projects/ref-ark-halo.jpeg",
    title: { de: "Logo-Wand", en: "Logo wall" },
    subtitle: { de: "Sanftes Halo-Licht für Innenräume", en: "Soft halo light for interiors" },
  },
  {
    image: "/lumasign/projects/ref-mono-facade.jpeg",
    title: { de: "Fachgeschäftsfassade", en: "Specialist retail facade" },
    subtitle: {
      de: "Minimalistische frontbeleuchtete Beschilderung",
      en: "Minimal front-lit signage",
    },
  },
  {
    image: "/lumasign/projects/ref-number-halo.webp",
    title: { de: "Adressbeschilderung", en: "Address signage" },
    subtitle: { de: "Hochwertige Nummern und Details", en: "Premium numbers and details" },
  },
  {
    image: "/lumasign/projects/aiko-event-letters.jpg",
    title: { de: "AIKO Event", en: "AIKO event" },
    subtitle: { de: "Große Ausstellungsschriftzüge in 3D", en: "Large 3D exhibition lettering" },
  },
] satisfies Array<{ image: string; title: LocalizedText; subtitle: LocalizedText }>;

export const products: ProductDefinition[] = [
  {
    id: "letters",
    label: { de: "Buchstaben", en: "Letters" },
    description: {
      de: "Wand- und Fassadenbuchstaben für innen und außen: 2D Logos, 3D Logos, Schriftzüge, Zahlen und Markenformen aus Acryl, Aluminium oder Edelstahl.",
      en: "Interior and exterior wall or facade lettering: 2D and 3D logos, wordmarks, numbers and brand shapes in acrylic, aluminium or stainless steel.",
    },
    variants: [
      {
        value: "front_lit",
        label: { de: "Front-leuchtend", en: "Front-lit" },
        effect: "front-lit",
      },
      {
        value: "side_lit",
        label: { de: "Seitlich leuchtend", en: "Side-lit" },
        effect: "side-lit",
      },
      {
        value: "back_lit",
        label: { de: "Rückbeleuchtet", en: "Back-lit" },
        effect: "back-lit",
      },
      {
        value: "full_lit",
        label: { de: "Voll beleuchtet", en: "Fully illuminated" },
        effect: "full-lit",
      },
      {
        value: "non_lit",
        label: { de: "Ohne Beleuchtung", en: "Non-illuminated" },
        effect: "non-lit",
      },
    ],
  },
  {
    id: "lightboxes",
    label: { de: "Leuchtkästen", en: "Lightboxes" },
    description: {
      de: "Klare, stabile Lichtwerbung für Ausleger, Fassaden und Innenbereiche. Ideal für Cafés, Shops, Salons und gut sichtbare Markenauftritte.",
      en: "Clear, durable illuminated signage for blade signs, facades and interiors. Ideal for cafés, shops, salons and visible brand environments.",
    },
    variants: [
      {
        value: "fabric_lightbox",
        label: { de: "Textiler Leuchtkasten", en: "Fabric lightbox" },
        image: "/lumasign/projects/lightbox-fabric-retail.jpeg",
      },
      {
        value: "retail_column",
        label: { de: "Laden-Säule", en: "Retail column" },
        image: "/lumasign/projects/lightbox-nike-phantom.jpeg",
      },
      {
        value: "store_concept",
        label: { de: "Store Konzept", en: "Store concept" },
        image: "/lumasign/projects/lightbox-nike-store-concept.jpeg",
      },
      {
        value: "modular_cubes",
        label: { de: "Modulare Kuben", en: "Modular cubes" },
        image: "/lumasign/projects/lightbox-modular-nike.jpeg",
      },
      {
        value: "event_display",
        label: { de: "Event Display", en: "Event display" },
        image: "/lumasign/projects/lightbox-mini-event.jpeg",
      },
    ],
  },
  {
    id: "neon",
    label: { de: "Neon", en: "Neon" },
    description: {
      de: "Custom LED Neon für Schaufenster, Fotozonen, Bars, Restaurants und Beauty-Spaces. Flexible Lichtlinien und Acrylträger machen die Marke sofort sichtbar.",
      en: "Custom LED neon for shop windows, photo zones, bars, restaurants and beauty spaces. Flexible light lines and acrylic backings make brands instantly visible.",
    },
    variants: [
      {
        value: "character_neon",
        label: { de: "Figur-Neon", en: "Character neon" },
        image: "/lumasign/projects/neon-labubu-sign.jpg",
      },
      {
        value: "colour_lettering",
        label: { de: "Farbige Schriftzüge", en: "Colour lettering" },
        image: "/lumasign/projects/neon-custom-color-sign.jpg",
      },
      {
        value: "brand_logo_neon",
        label: { de: "Markenlogo-Neon", en: "Brand logo neon" },
        image: "/lumasign/projects/neon-branded-merch-sign.jpg",
      },
    ],
  },
  {
    id: "infinity_mirror",
    label: { de: "Infinity Mirror", en: "Infinity Mirror" },
    description: {
      de: "Spiegelnde LED-Displays mit Tiefeneffekt für Ladenflächen, Events, Pop-ups und aufmerksamkeitsstarke Markeninstallationen.",
      en: "Mirrored LED displays with a deep visual effect for retail spaces, events, pop-ups and high-impact brand installations.",
    },
    variants: [
      {
        value: "text_mirror_box",
        label: { de: "Text-Spiegelbox", en: "Text mirror box" },
        image: "/lumasign/projects/neon-infinity-mirror.jpg",
      },
      {
        value: "experience_installation",
        label: { de: "Erlebnisinstallation", en: "Experience installation" },
        image: "/lumasign/projects/infinity-nike-tech-pack.jpeg",
      },
      {
        value: "tunnel_wall",
        label: { de: "Tunnel-Wand", en: "Tunnel wall" },
        image: "/lumasign/projects/infinity-tunnel-wall.jpg",
      },
    ],
  },
  {
    id: "custom_concept",
    label: { de: "Nach individuellem Konzept", en: "Custom concept" },
    description: {
      de: "Für Storefronts, Messeflächen, Pylone und komplette Markenauftritte planen wir Material, Beleuchtung, Größe, Transport und Montage als Gesamtkonzept.",
      en: "For storefronts, exhibitions, pylons and complete brand environments, we plan materials, lighting, scale, transport and installation as one concept.",
    },
    variants: [
      {
        value: "facade_concept",
        label: { de: "Fassadenkonzept", en: "Facade concept" },
        image: "/lumasign/projects/xpeng-mitsubishi-facade.jpg",
      },
      {
        value: "pylon_landmark",
        label: { de: "Pylon & Orientierung", en: "Pylon & wayfinding" },
        image: "/lumasign/projects/xpeng-pylon.jpg",
      },
      {
        value: "exhibition_event",
        label: { de: "Messe & Event", en: "Exhibition & event" },
        image: "/lumasign/projects/aiko-event-letters.jpg",
      },
      {
        value: "interior_branding",
        label: { de: "Innenraum-Branding", en: "Interior branding" },
        image: "/lumasign/projects/insta360-3d-letters.jpg",
      },
      {
        value: "special_build",
        label: { de: "Sonderbau", en: "Special build" },
        image: "/lumasign/projects/ref-ovation-panel.jpeg",
      },
    ],
  },
];

export function localized(value: LocalizedText, locale: Locale): string {
  return value[locale];
}

export function getProduct(id: ProductFamily): ProductDefinition {
  return products.find((product) => product.id === id) ?? products[0];
}
