"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

type QuoteResponse = {
  quote_number: string;
  indicative_price_label: string;
};

type Locale = "en" | "de";
type ApplicationType = "non_illuminated_logo" | "illuminated_logo" | "lightbox" | "side_mounted_logo";
type StepId = "project" | "size" | "material" | "lighting" | "logo" | "installation" | "confirm";

type QuoteForm = {
  application_type: ApplicationType;
  width_mm: string;
  height_mm: string;
  depth_mm: string;
  quantity: string;
  material: string;
  main_material: string;
  edge_material: string;
  front_cover_material: string;
  lighting_type: string;
  color_temp: string;
  brightness: string;
  need_installation: string;
  installation_scene: string;
  installation_method: string;
  country: string;
  postal_code: string;
  city: string;
  reference_url: string;
  customer_notes: string;
};

type LocalizedText = Record<Locale, string>;
type Choice = {
  value: string;
  label: LocalizedText;
  description: LocalizedText;
  image: string;
};
type ChoiceSection = {
  field: keyof QuoteForm;
  title: LocalizedText;
  description?: LocalizedText;
  choices: Choice[];
};
type ProductConfig = {
  materialSections: ChoiceSection[];
  lightingSections: ChoiceSection[];
  installationMethods: Choice[];
};

const quoteCopy = {
  en: {
    sidebarEyebrow: "Logo request",
    steps: {
      project: "Project",
      size: "Size",
      material: "Material",
      lighting: "Lighting",
      logo: "Logo",
      installation: "Installation",
      confirm: "Confirm",
    },
    projectType: "Project type",
    application: "Application",
    nonIlluminatedLogo: "Non-illuminated logo",
    illuminatedLogo: "Illuminated logo",
    lightbox: "Lightbox",
    sideMountedLogo: "Side-mounted logo",
    dimensions: "Dimensions",
    width: "Width (mm)",
    height: "Height (mm)",
    depth: "Depth (mm)",
    quantity: "Quantity",
    material: "Material",
    mainMaterial: "Logo body material",
    edgeMaterial: "Edge / side material",
    frontCoverMaterial: "Front cover material",
    acrylic: "Acrylic",
    aluminiumComposite: "Aluminium composite panel",
    stainless: "Stainless steel",
    paintedWood: "Painted wood",
    textile: "Fabric",
    lighting: "Lighting",
    lightingType: "Lighting type",
    backlit: "Backlit",
    frontlit: "Frontlit",
    sideLit: "Side lit",
    none: "Non-illuminated",
    colorTemperature: "Color temperature",
    brightness: "Brightness",
    lowBrightness: "Low",
    mediumBrightness: "Medium",
    highBrightness: "High",
    logoFiles: "Logo files",
    upload: "Upload logo, reference image or PDF",
    fileSelected: "file(s) selected",
    referenceUrl: "Reference URL",
    installationDelivery: "Installation and delivery",
    installationNeeded: "Installation needed",
    yes: "Yes",
    no: "No",
    installationScene: "Installation scene",
    outdoorInstallation: "Outdoor installation",
    indoorInstallation: "Indoor installation",
    installationMethod: "Installation method",
    individualLetters: "Individual letters mounted separately",
    lettersOnMetalBeam: "Letters mounted on a support bar",
    logoBackboard: "Logo mounted on a back panel",
    metalRodSupport: "Metal rod support installation",
    wallMountedSideLogo: "Full side sign mounted against the wall",
    country: "Country",
    postalCode: "Postal code",
    city: "City",
    confirmRequest: "Confirm request",
    notes: "Notes",
    selectedSummary: "Selected configuration",
  },
  de: {
    sidebarEyebrow: "Logo-Anfrage",
    steps: {
      project: "Projekt",
      size: "Größe",
      material: "Material",
      lighting: "Beleuchtung",
      logo: "Logo",
      installation: "Montage",
      confirm: "Bestätigung",
    },
    projectType: "Projektart",
    application: "Anwendung",
    nonIlluminatedLogo: "Nicht beleuchtetes Logo",
    illuminatedLogo: "Beleuchtetes Logo",
    lightbox: "Leuchtkasten",
    sideMountedLogo: "Seitlich montiertes Logo",
    dimensions: "Abmessungen",
    width: "Breite (mm)",
    height: "Höhe (mm)",
    depth: "Tiefe (mm)",
    quantity: "Menge",
    material: "Material",
    mainMaterial: "Logo-Hauptmaterial",
    edgeMaterial: "Kanten- / Seitenmaterial",
    frontCoverMaterial: "Frontabdeckung",
    acrylic: "Acryl",
    aluminiumComposite: "Aluminium-Verbundplatte",
    stainless: "Edelstahl",
    paintedWood: "Lackiertes Holz",
    textile: "Textil",
    lighting: "Beleuchtung",
    lightingType: "Lichtart",
    backlit: "Hinterleuchtet",
    frontlit: "Frontbeleuchtet",
    sideLit: "Seitlich beleuchtet",
    none: "Nicht beleuchtet",
    colorTemperature: "Farbtemperatur",
    brightness: "Helligkeit",
    lowBrightness: "Niedrig",
    mediumBrightness: "Mittel",
    highBrightness: "Hoch",
    logoFiles: "Logo-Dateien",
    upload: "Logo, Referenzbild oder PDF hochladen",
    fileSelected: "Datei(en) ausgewählt",
    referenceUrl: "Referenz-URL",
    installationDelivery: "Montage und Lieferung",
    installationNeeded: "Montage benötigt",
    yes: "Ja",
    no: "Nein",
    installationScene: "Montageort",
    outdoorInstallation: "Außenmontage",
    indoorInstallation: "Innenmontage",
    installationMethod: "Montageart",
    individualLetters: "Einzelne Buchstaben separat montieren",
    lettersOnMetalBeam: "Buchstaben auf Trägerleiste montieren",
    logoBackboard: "Logo auf Rückwand montieren",
    metalRodSupport: "Montage mit Metallstangen",
    wallMountedSideLogo: "Seitenschild vollflächig an der Wand",
    country: "Land",
    postalCode: "Postleitzahl",
    city: "Stadt",
    confirmRequest: "Anfrage bestätigen",
    notes: "Notizen",
    selectedSummary: "Ausgewählte Konfiguration",
  },
} as const;

type QuoteCopy = (typeof quoteCopy)[keyof typeof quoteCopy];

const referenceImages = {
  nonIlluminatedIndoor: "/references/non-illuminated-interior-logo.jpg",
  nonIlluminatedOutdoor: "/references/non-illuminated-outdoor-06.jpg",
  illuminatedInterior: "/references/illuminated-indoor-06.jpg",
  illuminatedOutdoor: "/references/illuminated-outdoor-03.jpg",
  lightbox: "/references/illuminated-interior-logo-2.jpg",
  sideMounted: "/references/side-mounted-logo-2.jpg",
};

const optionImages = {
  acrylic:
    "https://images.unsplash.com/photo-1744056996022-c33f1cc49030?q=80&w=1200&auto=format&fit=crop",
  aluminiumComposite:
    "https://images.unsplash.com/photo-1777441054084-fe302f5e2187?q=80&w=1200&auto=format&fit=crop",
  paintedWood:
    "https://images.unsplash.com/photo-1737093861200-245fde29f419?q=80&w=1200&auto=format&fit=crop",
  stainlessSteel:
    "https://images.unsplash.com/photo-1501166222995-ff31c7e93cef?q=80&w=1200&auto=format&fit=crop",
  textile:
    "https://images.unsplash.com/photo-1637004732258-4b792ce8f474?q=80&w=1200&auto=format&fit=crop",
  indoorInstallation:
    "https://images.unsplash.com/photo-1709130271230-9e26ea5f8023?q=80&w=1200&auto=format&fit=crop",
  outdoorInstallation:
    "https://images.unsplash.com/photo-1770259406469-b83c307b2dca?q=80&w=1200&auto=format&fit=crop",
  noInstallation:
    "https://images.unsplash.com/photo-1744056996022-c33f1cc49030?q=80&w=1200&auto=format&fit=crop",
  individualLetters:
    "https://images.unsplash.com/photo-1709130271230-9e26ea5f8023?q=80&w=1200&auto=format&fit=crop",
  supportBar:
    "https://images.unsplash.com/photo-1509731444445-095e85378cc9?q=80&w=1200&auto=format&fit=crop",
  logoBackboard:
    "https://images.unsplash.com/photo-1695048168808-4bbfa1efdfa7?q=80&w=1200&auto=format&fit=crop",
  metalRodSupport:
    "https://images.unsplash.com/photo-1671545644823-048a4e181de7?q=80&w=1200&auto=format&fit=crop",
  wallMountedSideLogo:
    "https://images.unsplash.com/photo-1695048168808-4bbfa1efdfa7?q=80&w=1200&auto=format&fit=crop",
  backlit:
    "https://images.unsplash.com/photo-1755805875004-6c719f2a5e2b?q=80&w=1200&auto=format&fit=crop",
  frontlit:
    "https://images.unsplash.com/photo-1654860535404-aa828d051761?q=80&w=1200&auto=format&fit=crop",
  sideLit:
    "https://images.unsplash.com/photo-1659066019874-7a15628cea60?q=80&w=1200&auto=format&fit=crop",
  warmWhite:
    "https://images.unsplash.com/photo-1770085140346-9a2cfca85178?q=80&w=1200&auto=format&fit=crop",
  neutralWhite:
    "https://images.unsplash.com/photo-1563647214-2bedb91e306a?q=80&w=1200&auto=format&fit=crop",
  coolWhite:
    "https://images.unsplash.com/photo-1480603509257-c0bfc8135e13?q=80&w=1200&auto=format&fit=crop",
  lowBrightness:
    "https://images.unsplash.com/photo-1763718476503-8d0b81eb1746?q=80&w=1200&auto=format&fit=crop",
  mediumBrightness:
    "https://images.unsplash.com/photo-1563647214-2bedb91e306a?q=80&w=1200&auto=format&fit=crop",
  highBrightness:
    "https://images.unsplash.com/photo-1659066019874-7a15628cea60?q=80&w=1200&auto=format&fit=crop",
};

const productChoices: Choice[] = [
  {
    value: "non_illuminated_logo",
    label: { en: "Non-illuminated logo", de: "Nicht beleuchtetes Logo" },
    description: {
      en: "Painted, acrylic or aluminium composite logo elements without lighting.",
      de: "Lackierte, Acryl- oder Alu-Verbund-Logos ohne Beleuchtung.",
    },
    image: referenceImages.nonIlluminatedIndoor,
  },
  {
    value: "illuminated_logo",
    label: { en: "Illuminated logo", de: "Beleuchtetes Logo" },
    description: {
      en: "Acrylic body with selectable edge material, lighting direction and brightness.",
      de: "Acrylkörper mit wählbarem Kantenmaterial, Lichtart und Helligkeit.",
    },
    image: referenceImages.illuminatedOutdoor,
  },
  {
    value: "lightbox",
    label: { en: "Lightbox", de: "Leuchtkasten" },
    description: {
      en: "Box construction with selectable side material and textile or acrylic front.",
      de: "Kastenaufbau mit wählbarem Seitenmaterial und Textil- oder Acrylfront.",
    },
    image: referenceImages.lightbox,
  },
  {
    value: "side_mounted_logo",
    label: { en: "Side-mounted logo", de: "Seitlich montiertes Logo" },
    description: {
      en: "Projecting side sign with wall or rod-supported mounting.",
      de: "Auskragendes Seitenschild mit Wand- oder Stangenmontage.",
    },
    image: referenceImages.sideMounted,
  },
];

const sceneChoices: Choice[] = [
  {
    value: "indoor",
    label: { en: "Indoor installation", de: "Innenmontage" },
    description: {
      en: "For stores, reception walls, counters and interior customer areas.",
      de: "Für Stores, Empfangswände, Kassenbereiche und Innenflächen.",
    },
    image: optionImages.indoorInstallation,
  },
  {
    value: "outdoor",
    label: { en: "Outdoor installation", de: "Außenmontage" },
    description: {
      en: "For facades, entrances and exterior brand visibility.",
      de: "Für Fassaden, Eingänge und Außenwirkung.",
    },
    image: optionImages.outdoorInstallation,
  },
];

const installationNeededChoices: Choice[] = [
  {
    value: "true",
    label: { en: "Installation needed", de: "Montage benötigt" },
    description: {
      en: "Our team should include installation details in the formal quote.",
      de: "Unser Team soll Montagedetails im verbindlichen Angebot berücksichtigen.",
    },
    image: optionImages.outdoorInstallation,
  },
  {
    value: "false",
    label: { en: "No installation needed", de: "Keine Montage benötigt" },
    description: {
      en: "Production and delivery only. You will organize installation separately.",
      de: "Nur Produktion und Lieferung. Die Montage organisieren Sie separat.",
    },
    image: optionImages.noInstallation,
  },
];

const sharedLogoInstallationMethods: Choice[] = [
  {
    value: "individual_letters",
    label: { en: "Individual letters", de: "Einzelbuchstaben" },
    description: {
      en: "Each letter or logo element is mounted separately on the surface.",
      de: "Jeder Buchstabe oder jedes Logo-Element wird separat montiert.",
    },
    image: optionImages.individualLetters,
  },
  {
    value: "letters_on_metal_beam",
    label: { en: "Support bar", de: "Trägerleiste" },
    description: {
      en: "Letters are pre-fixed on a straight support bar for easier installation.",
      de: "Buchstaben werden auf einer geraden Trägerleiste vormontiert.",
    },
    image: optionImages.supportBar,
  },
  {
    value: "logo_backboard",
    label: { en: "Logo back panel", de: "Logo-Rückwand" },
    description: {
      en: "The logo is mounted as a complete unit on a back panel.",
      de: "Das Logo wird als komplette Einheit auf einer Rückwand montiert.",
    },
    image: optionImages.logoBackboard,
  },
];

const productConfigs: Record<ApplicationType, ProductConfig> = {
  non_illuminated_logo: {
    materialSections: [
      {
        field: "main_material",
        title: { en: "Logo body material", de: "Logo-Hauptmaterial" },
        choices: [
          {
            value: "painted_wood",
            label: { en: "Painted wood", de: "Lackiertes Holz" },
            description: {
              en: "Painted wooden body for warm interior or decorative logo effects.",
              de: "Lackierter Holzkörper für warme Innenraum- oder Dekorwirkung.",
            },
            image: optionImages.paintedWood,
          },
          {
            value: "acrylic",
            label: { en: "Acrylic", de: "Acryl" },
            description: {
              en: "Clean acrylic logo elements for crisp shapes and smooth surfaces.",
              de: "Saubere Acryl-Logoelemente mit klaren Konturen und glatter Oberfläche.",
            },
            image: optionImages.acrylic,
          },
          {
            value: "aluminium_composite",
            label: { en: "Aluminium composite panel", de: "Aluminium-Verbundplatte" },
            description: {
              en: "Rigid panel material for outdoor facades and larger logo bodies.",
              de: "Stabiles Plattenmaterial für Außenfassaden und größere Logoformen.",
            },
            image: optionImages.aluminiumComposite,
          },
        ],
      },
    ],
    lightingSections: [],
    installationMethods: sharedLogoInstallationMethods,
  },
  illuminated_logo: {
    materialSections: [
      {
        field: "main_material",
        title: { en: "Logo body material", de: "Logo-Hauptmaterial" },
        description: {
          en: "For illuminated logos, the body is acrylic by default.",
          de: "Bei beleuchteten Logos ist der Körper standardmäßig aus Acryl.",
        },
        choices: [
          {
            value: "acrylic",
            label: { en: "Acrylic body", de: "Acrylkörper" },
            description: {
              en: "Default translucent body material for reliable LED illumination.",
              de: "Standardmaterial für gleichmäßige und zuverlässige LED-Ausleuchtung.",
            },
            image: optionImages.acrylic,
          },
        ],
      },
      {
        field: "edge_material",
        title: { en: "Edge material", de: "Kantenmaterial" },
        choices: [
          {
            value: "acrylic",
            label: { en: "Acrylic", de: "Acryl" },
            description: {
              en: "Lightweight edge build for clean indoor and retail applications.",
              de: "Leichter Kantenaufbau für saubere Innen- und Retail-Anwendungen.",
            },
            image: optionImages.acrylic,
          },
          {
            value: "aluminium_composite",
            label: { en: "Aluminium composite panel", de: "Aluminium-Verbundplatte" },
            description: {
              en: "Stable side structure for larger logo bodies and facade use.",
              de: "Stabile Seitenstruktur für größere Logokörper und Fassadeneinsatz.",
            },
            image: optionImages.aluminiumComposite,
          },
          {
            value: "stainless_steel",
            label: { en: "Stainless steel", de: "Edelstahl" },
            description: {
              en: "Premium edge material with strong durability and clean finish.",
              de: "Hochwertiges Kantenmaterial mit robuster und sauberer Oberfläche.",
            },
            image: optionImages.stainlessSteel,
          },
        ],
      },
    ],
    lightingSections: [
      {
        field: "lighting_type",
        title: { en: "Lighting type", de: "Lichtart" },
        choices: [
          {
            value: "backlit",
            label: { en: "Backlit", de: "Hinterleuchtet" },
            description: {
              en: "Halo effect from the wall or back panel behind the logo.",
              de: "Halo-Effekt von Wand oder Rückfläche hinter dem Logo.",
            },
            image: optionImages.backlit,
          },
          {
            value: "frontlit",
            label: { en: "Frontlit", de: "Frontbeleuchtet" },
            description: {
              en: "The logo face itself lights up for maximum readability.",
              de: "Die Logofront leuchtet direkt für maximale Lesbarkeit.",
            },
            image: optionImages.frontlit,
          },
          {
            value: "side_lit",
            label: { en: "Side lit", de: "Seitlich beleuchtet" },
            description: {
              en: "Light escapes through the side edge for a dimensional effect.",
              de: "Licht tritt seitlich aus und erzeugt Tiefenwirkung.",
            },
            image: optionImages.sideLit,
          },
        ],
      },
    ],
    installationMethods: sharedLogoInstallationMethods,
  },
  lightbox: {
    materialSections: [
      {
        field: "edge_material",
        title: { en: "Side material", de: "Seitenmaterial" },
        choices: [
          {
            value: "stainless_steel",
            label: { en: "Stainless steel", de: "Edelstahl" },
            description: {
              en: "Robust premium side material for durable box construction.",
              de: "Robustes Premium-Seitenmaterial für langlebige Kastenbauweise.",
            },
            image: optionImages.stainlessSteel,
          },
          {
            value: "aluminium_composite",
            label: { en: "Aluminium composite panel", de: "Aluminium-Verbundplatte" },
            description: {
              en: "Lightweight, stable and suitable for larger lightbox sides.",
              de: "Leicht, stabil und geeignet für größere Leuchtkastenseiten.",
            },
            image: optionImages.aluminiumComposite,
          },
          {
            value: "acrylic",
            label: { en: "Acrylic", de: "Acryl" },
            description: {
              en: "Clean side material for compact indoor lightboxes.",
              de: "Sauberes Seitenmaterial für kompakte Indoor-Leuchtkästen.",
            },
            image: optionImages.acrylic,
          },
        ],
      },
      {
        field: "front_cover_material",
        title: { en: "Front cover material", de: "Frontabdeckung" },
        choices: [
          {
            value: "textile",
            label: { en: "Fabric", de: "Textil" },
            description: {
              en: "Textile front for larger illuminated graphics and soft light.",
              de: "Textilfront für größere Leuchtgrafiken und weiches Licht.",
            },
            image: optionImages.textile,
          },
          {
            value: "acrylic",
            label: { en: "Acrylic", de: "Acryl" },
            description: {
              en: "Acrylic front for crisp logo shapes and compact boxes.",
              de: "Acrylfront für klare Logoformen und kompakte Kästen.",
            },
            image: optionImages.acrylic,
          },
        ],
      },
    ],
    lightingSections: [],
    installationMethods: [],
  },
  side_mounted_logo: {
    materialSections: [
      {
        field: "edge_material",
        title: { en: "Side material", de: "Seitenmaterial" },
        choices: [
          {
            value: "stainless_steel",
            label: { en: "Stainless steel", de: "Edelstahl" },
            description: {
              en: "Strong side body for visible projecting signs.",
              de: "Starker Seitenkörper für gut sichtbare Ausleger.",
            },
            image: optionImages.stainlessSteel,
          },
          {
            value: "aluminium_composite",
            label: { en: "Aluminium composite panel", de: "Aluminium-Verbundplatte" },
            description: {
              en: "Stable and lightweight side construction.",
              de: "Stabile und leichte Seitenkonstruktion.",
            },
            image: optionImages.aluminiumComposite,
          },
          {
            value: "acrylic",
            label: { en: "Acrylic", de: "Acryl" },
            description: {
              en: "Clean compact build for smaller projecting logo signs.",
              de: "Sauberer kompakter Aufbau für kleinere Auslegerlogos.",
            },
            image: optionImages.acrylic,
          },
        ],
      },
      {
        field: "front_cover_material",
        title: { en: "Front cover material", de: "Frontabdeckung" },
        choices: [
          {
            value: "textile",
            label: { en: "Fabric", de: "Textil" },
            description: {
              en: "Fabric front for larger illuminated side signs.",
              de: "Textilfront für größere beleuchtete Seitenschilder.",
            },
            image: optionImages.textile,
          },
          {
            value: "acrylic",
            label: { en: "Acrylic", de: "Acryl" },
            description: {
              en: "Acrylic front for crisp logo readability.",
              de: "Acrylfront für klare Lesbarkeit des Logos.",
            },
            image: optionImages.acrylic,
          },
        ],
      },
    ],
    lightingSections: [],
    installationMethods: [
      {
        value: "metal_rod_support",
        label: { en: "Metal rod support", de: "Metallstangen" },
        description: {
          en: "The sign projects from the facade with visible metal supports.",
          de: "Das Schild kragt mit sichtbaren Metallstangen aus der Fassade.",
        },
        image: optionImages.metalRodSupport,
      },
      {
        value: "wall_mounted_side_logo",
        label: { en: "Mounted against wall", de: "Direkt an der Wand" },
        description: {
          en: "The complete side sign sits close to the wall or facade.",
          de: "Das komplette Seitenschild liegt nah an Wand oder Fassade.",
        },
        image: optionImages.wallMountedSideLogo,
      },
    ],
  },
};

const colorTemperatureSection: ChoiceSection = {
  field: "color_temp",
  title: { en: "Color temperature", de: "Farbtemperatur" },
  choices: [
    {
      value: "3000K",
      label: { en: "3000K warm white", de: "3000K warmweiß" },
      description: {
        en: "Warm tone for hospitality, boutiques and cozy interiors.",
        de: "Warmer Ton für Gastronomie, Boutiquen und gemütliche Innenräume.",
      },
      image: optionImages.warmWhite,
    },
    {
      value: "4500K",
      label: { en: "4500K neutral white", de: "4500K neutralweiß" },
      description: {
        en: "Balanced light for most retail and office environments.",
        de: "Ausgewogenes Licht für die meisten Retail- und Office-Umgebungen.",
      },
      image: optionImages.neutralWhite,
    },
    {
      value: "6000K",
      label: { en: "6000K cool white", de: "6000K kaltweiß" },
      description: {
        en: "Cool, crisp light for high-contrast facade visibility.",
        de: "Kühles, klares Licht für kontraststarke Fassadenwirkung.",
      },
      image: optionImages.coolWhite,
    },
  ],
};

const brightnessSection: ChoiceSection = {
  field: "brightness",
  title: { en: "Brightness", de: "Helligkeit" },
  choices: [
    {
      value: "low",
      label: { en: "Low", de: "Niedrig" },
      description: {
        en: "Subtle light for interiors and close viewing distances.",
        de: "Dezentes Licht für Innenräume und kurze Betrachtungsabstände.",
      },
      image: optionImages.lowBrightness,
    },
    {
      value: "medium",
      label: { en: "Medium", de: "Mittel" },
      description: {
        en: "Balanced default brightness for everyday retail visibility.",
        de: "Ausgewogene Standardhelligkeit für alltägliche Retail-Sichtbarkeit.",
      },
      image: optionImages.mediumBrightness,
    },
    {
      value: "high",
      label: { en: "High", de: "Hoch" },
      description: {
        en: "Stronger brightness for outdoor facades and longer distance viewing.",
        de: "Stärkere Helligkeit für Außenfassaden und größere Sichtweiten.",
      },
      image: optionImages.highBrightness,
    },
  ],
};

function getLightingSections(type: ApplicationType) {
  const baseSections = productConfigs[type].lightingSections;
  if (type === "non_illuminated_logo") return [];
  return [...baseSections, colorTemperatureSection, brightnessSection];
}

function getSteps(type: ApplicationType): StepId[] {
  const steps: StepId[] = ["project", "size", "material"];
  if (getLightingSections(type).length > 0) steps.push("lighting");
  return [...steps, "logo", "installation", "confirm"];
}

function getDefaultsForType(type: ApplicationType): Partial<QuoteForm> {
  if (type === "illuminated_logo") {
    return {
      material: "acrylic",
      main_material: "acrylic",
      edge_material: "acrylic",
      front_cover_material: "",
      lighting_type: "backlit",
      color_temp: "4500K",
      brightness: "medium",
      installation_method: "individual_letters",
    };
  }
  if (type === "lightbox") {
    return {
      material: "stainless_steel",
      main_material: "",
      edge_material: "stainless_steel",
      front_cover_material: "textile",
      lighting_type: "lightbox",
      color_temp: "4500K",
      brightness: "medium",
      installation_method: "",
    };
  }
  if (type === "side_mounted_logo") {
    return {
      material: "stainless_steel",
      main_material: "",
      edge_material: "stainless_steel",
      front_cover_material: "textile",
      lighting_type: "lightbox",
      color_temp: "4500K",
      brightness: "medium",
      installation_method: "metal_rod_support",
    };
  }
  return {
    material: "acrylic",
    main_material: "acrylic",
    edge_material: "",
    front_cover_material: "",
    lighting_type: "none",
    color_temp: "",
    brightness: "",
    installation_method: "individual_letters",
  };
}

export default function QuotePage() {
  const { locale, t } = useLanguage();
  const q = quoteCopy[locale];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResponse | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [form, setForm] = useState<QuoteForm>({
    application_type: "non_illuminated_logo",
    width_mm: "1200",
    height_mm: "400",
    depth_mm: "80",
    quantity: "1",
    material: "acrylic",
    main_material: "acrylic",
    edge_material: "",
    front_cover_material: "",
    lighting_type: "none",
    color_temp: "",
    brightness: "",
    need_installation: "true",
    installation_scene: "outdoor",
    installation_method: "individual_letters",
    country: "DE",
    postal_code: "",
    city: "",
    reference_url: "",
    customer_notes: "",
  });

  const steps = getSteps(form.application_type);
  const safeStep = Math.min(step, steps.length - 1);
  const currentStep = steps[safeStep];
  const currentConfig = productConfigs[form.application_type];
  const lightingSections = getLightingSections(form.application_type);

  const indicative = useMemo(() => {
    if (form.application_type === "illuminated_logo") return locale === "de" ? "ab EUR 450" : "from EUR 450";
    if (form.application_type === "lightbox") return locale === "de" ? "ab EUR 650" : "from EUR 650";
    if (form.application_type === "side_mounted_logo") return locale === "de" ? "ab EUR 750" : "from EUR 750";
    if (form.material === "aluminium_composite") return locale === "de" ? "ab EUR 450" : "from EUR 450";
    return locale === "de" ? "ab EUR 299" : "from EUR 299";
  }, [form.application_type, form.material, locale]);

  function update(name: keyof QuoteForm, value: string) {
    setForm((current) => {
      if (name === "application_type") {
        return {
          ...current,
          application_type: value as ApplicationType,
          ...getDefaultsForType(value as ApplicationType),
        };
      }

      if (name === "main_material") {
        return { ...current, main_material: value, material: value };
      }

      if (
        name === "edge_material" &&
        (current.application_type === "lightbox" || current.application_type === "side_mounted_logo")
      ) {
        return { ...current, edge_material: value, material: value };
      }

      return { ...current, [name]: value };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    payload.append("locale", locale);
    if (files) {
      Array.from(files).forEach((file) => payload.append("files", file));
    }

    try {
      const created = await apiFetch<QuoteResponse>("/quotes", {
        method: "POST",
        body: payload,
      });
      setResult(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="min-h-screen bg-black px-6 pt-32 text-white">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-neutral-950 p-8">
          <div className="mb-3 text-sm uppercase tracking-[0.25em] text-neutral-500">
            {result.quote_number}
          </div>
          <h1 className="text-4xl font-light">{t.quote.success}</h1>
          <div className="mt-8 rounded-[24px] bg-white p-6 text-black">
            <div className="text-sm text-neutral-500">{t.quote.indicative}</div>
            <div className="mt-2 text-4xl font-light">{result.indicative_price_label}</div>
            <p className="mt-3 text-sm text-neutral-600">{t.quote.notBinding}</p>
          </div>
          <Link href="/account" className="mt-8 inline-flex rounded-2xl bg-white px-5 py-3 text-black">
            {t.nav.account}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 pt-32 text-white">
      <form onSubmit={handleSubmit} className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[32px] border border-white/10 bg-neutral-950 p-6">
          <div className="mb-4 text-sm uppercase tracking-[0.25em] text-neutral-500">
            {q.sidebarEyebrow}
          </div>
          <h1 className="text-3xl font-light">{t.quote.title}</h1>
          <p className="mt-4 text-sm leading-6 text-neutral-400">{t.quote.intro}</p>
          <div className="mt-8 grid gap-2">
            {steps.map((item, index) => (
              <button
                type="button"
                key={item}
                onClick={() => setStep(index)}
                className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                  safeStep === index ? "bg-white text-black" : "text-neutral-400 hover:bg-white/5"
                }`}
              >
                {String(index + 1).padStart(2, "0")} {q.steps[item]}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-[32px] border border-white/10 bg-neutral-950 p-8">
          {currentStep === "project" && (
            <Panel title={q.projectType}>
              <OptionGrid
                title={q.application}
                choices={productChoices}
                value={form.application_type}
                locale={locale}
                onChange={(value) => update("application_type", value)}
              />
            </Panel>
          )}

          {currentStep === "size" && (
            <Panel title={q.dimensions}>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label={q.width} name="width_mm" value={form.width_mm} onChange={update} required />
                <Input label={q.height} name="height_mm" value={form.height_mm} onChange={update} required />
                <Input label={q.depth} name="depth_mm" value={form.depth_mm} onChange={update} />
                <Input label={q.quantity} name="quantity" value={form.quantity} onChange={update} required />
              </div>
            </Panel>
          )}

          {currentStep === "material" && (
            <Panel title={q.material}>
              {currentConfig.materialSections.map((section) => (
                <OptionGrid
                  key={section.field}
                  title={section.title[locale]}
                  description={section.description?.[locale]}
                  choices={section.choices}
                  value={form[section.field]}
                  locale={locale}
                  onChange={(value) => update(section.field, value)}
                />
              ))}
            </Panel>
          )}

          {currentStep === "lighting" && (
            <Panel title={q.lighting}>
              {lightingSections.map((section) => (
                <OptionGrid
                  key={section.field}
                  title={section.title[locale]}
                  description={section.description?.[locale]}
                  choices={section.choices}
                  value={form[section.field]}
                  locale={locale}
                  onChange={(value) => update(section.field, value)}
                />
              ))}
            </Panel>
          )}

          {currentStep === "logo" && (
            <Panel title={q.logoFiles}>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-white/20 bg-black/40 p-10 text-center text-neutral-300">
                <UploadCloud className="mb-4 text-neutral-500" size={36} />
                {q.upload}
                <input
                  className="hidden"
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(event) => setFiles(event.target.files)}
                />
                {files && <span className="mt-3 text-sm text-white">{files.length} {q.fileSelected}</span>}
              </label>
              <Input label={q.referenceUrl} name="reference_url" value={form.reference_url} onChange={update} />
            </Panel>
          )}

          {currentStep === "installation" && (
            <Panel title={q.installationDelivery}>
              <OptionGrid
                title={q.installationNeeded}
                choices={installationNeededChoices}
                value={form.need_installation}
                locale={locale}
                onChange={(value) => update("need_installation", value)}
              />
              <OptionGrid
                title={q.installationScene}
                choices={sceneChoices}
                value={form.installation_scene}
                locale={locale}
                onChange={(value) => update("installation_scene", value)}
              />
              {currentConfig.installationMethods.length > 0 && (
                <OptionGrid
                  title={q.installationMethod}
                  choices={currentConfig.installationMethods}
                  value={form.installation_method}
                  locale={locale}
                  onChange={(value) => update("installation_method", value)}
                />
              )}
              <div className="grid gap-4 md:grid-cols-3">
                <Input label={q.country} name="country" value={form.country} onChange={update} />
                <Input label={q.postalCode} name="postal_code" value={form.postal_code} onChange={update} />
                <Input label={q.city} name="city" value={form.city} onChange={update} />
              </div>
            </Panel>
          )}

          {currentStep === "confirm" && (
            <Panel title={q.confirmRequest}>
              <div className="rounded-[24px] bg-white p-6 text-black">
                <div className="text-sm text-neutral-500">{t.quote.indicative}</div>
                <div className="mt-2 text-4xl font-light">{indicative}</div>
                <p className="mt-3 text-sm text-neutral-600">{t.quote.notBinding}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/40 p-5">
                <div className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-500">{q.selectedSummary}</div>
                <div className="grid gap-3 text-sm text-neutral-300 md:grid-cols-2">
                  {getSummaryRows(form, q, locale).map((row) => (
                    <div key={row.label} className="rounded-2xl bg-white/5 p-4">
                      <div className="text-neutral-500">{row.label}</div>
                      <div className="mt-1 text-white">{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <label className="grid gap-2 text-sm text-neutral-300">
                {q.notes}
                <textarea
                  className="min-h-28 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40"
                  value={form.customer_notes}
                  onChange={(event) => update("customer_notes", event.target.value)}
                />
              </label>
            </Panel>
          )}

          {error && <div className="mt-6 rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(0, Math.min(value, steps.length - 1) - 1))}
              className="rounded-2xl border border-white/15 px-5 py-3 text-sm text-white"
            >
              {t.quote.back}
            </button>
            {safeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((value) => Math.min(steps.length - 1, Math.min(value, steps.length - 1) + 1))}
                className="rounded-2xl bg-white px-5 py-3 text-sm text-black"
              >
                {t.quote.next}
              </button>
            ) : (
              <button disabled={loading} className="rounded-2xl bg-white px-5 py-3 text-sm text-black disabled:opacity-60">
                {loading ? "..." : t.quote.submit}
              </button>
            )}
          </div>
        </section>
      </form>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-6 text-3xl font-light">{title}</h2>
      <div className="grid gap-5">{children}</div>
    </div>
  );
}

function OptionGrid({
  title,
  description,
  choices,
  value,
  locale,
  onChange,
}: {
  title: string;
  description?: string;
  choices: Choice[];
  value: string;
  locale: Locale;
  onChange: (value: string) => void;
}) {
  return (
    <section className="grid gap-3">
      <div>
        <h3 className="text-lg font-light text-white">{title}</h3>
        {description && <p className="mt-1 text-sm leading-6 text-neutral-400">{description}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {choices.map((choice) => {
          const selected = value === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => onChange(choice.value)}
              className={`group overflow-hidden rounded-[26px] border text-left transition ${
                selected ? "border-white bg-white text-black" : "border-white/10 bg-black/40 text-white hover:border-white/40"
              }`}
            >
              <div className="h-40 overflow-hidden bg-neutral-900">
                <img
                  src={choice.image}
                  alt={choice.label[locale]}
                  className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className={`text-base font-light ${selected ? "text-black" : "text-white"}`}>
                  {choice.label[locale]}
                </div>
                <p className={`mt-2 text-sm leading-6 ${selected ? "text-neutral-700" : "text-neutral-400"}`}>
                  {choice.description[locale]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getSummaryRows(form: QuoteForm, q: QuoteCopy, locale: Locale) {
  const application = findChoiceLabel(productChoices, form.application_type, locale);
  const material = labelForFormValue(form, "material", locale);
  const lighting =
    form.application_type === "non_illuminated_logo"
      ? q.none
      : [
          labelForFormValue(form, "lighting_type", locale),
          labelForFormValue(form, "color_temp", locale),
          labelForFormValue(form, "brightness", locale),
        ]
          .filter(Boolean)
          .join(" / ");
  const installation = [
    findChoiceLabel(sceneChoices, form.installation_scene, locale),
    labelForFormValue(form, "installation_method", locale),
  ]
    .filter(Boolean)
    .join(" / ");

  return [
    { label: q.application, value: application },
    { label: q.dimensions, value: `${form.width_mm} × ${form.height_mm} × ${form.depth_mm || "-"} mm` },
    { label: q.quantity, value: form.quantity },
    { label: q.material, value: material },
    { label: q.lighting, value: lighting || q.none },
    { label: q.installationDelivery, value: installation || findChoiceLabel(sceneChoices, form.installation_scene, locale) },
  ];
}

function labelForFormValue(form: QuoteForm, field: keyof QuoteForm, locale: Locale) {
  const choices = [
    ...productChoices,
    ...sceneChoices,
    ...installationNeededChoices,
    ...sharedLogoInstallationMethods,
    ...productConfigs.non_illuminated_logo.materialSections.flatMap((section) => section.choices),
    ...productConfigs.illuminated_logo.materialSections.flatMap((section) => section.choices),
    ...productConfigs.illuminated_logo.lightingSections.flatMap((section) => section.choices),
    ...productConfigs.lightbox.materialSections.flatMap((section) => section.choices),
    ...productConfigs.side_mounted_logo.materialSections.flatMap((section) => section.choices),
    ...productConfigs.side_mounted_logo.installationMethods,
    ...colorTemperatureSection.choices,
    ...brightnessSection.choices,
  ];
  return findChoiceLabel(choices, form[field], locale) || formatRawValue(form[field]);
}

function findChoiceLabel(choices: Choice[], value: string, locale: Locale) {
  return choices.find((choice) => choice.value === value)?.label[locale] || "";
}

function formatRawValue(value: string) {
  return value ? value.replaceAll("_", " ") : "";
}

function Input({
  label,
  name,
  value,
  onChange,
  required,
}: {
  label: string;
  name: keyof QuoteForm;
  value: string;
  onChange: (name: keyof QuoteForm, value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm text-neutral-300">
      {label}
      <input
        className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40"
        name={name}
        value={value}
        required={required}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}

