"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Ruler } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const images = {
  hero: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2200&auto=format&fit=crop",
  acrylic: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1600&auto=format&fit=crop",
  aluminium: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop",
  lightbox: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  facade: "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1600&auto=format&fit=crop",
  workshop: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1600&auto=format&fit=crop",
  detail: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?q=80&w=1600&auto=format&fit=crop",
};

const systems = [
  {
    image: images.acrylic,
    title: "Nicht beleuchtetes Logo",
    text: "Clean acrylic, aluminium or stainless logo elements without internal illumination for indoor walls and facade applications.",
  },
  {
    image: images.facade,
    title: "Beleuchtetes Logo",
    text: "Frontlit, backlit or halo-lit logo systems with LED modules for premium brand visibility.",
  },
  {
    image: images.lightbox,
    title: "Lightbox",
    text: "Complete illuminated lightbox solutions for retail facades, brand walls and campaign graphics.",
  },
  {
    image: images.aluminium,
    title: "Seitlich montiertes Logo",
    text: "Side-mounted logo structures for projecting facade visibility and special mounting conditions.",
  },
];

const catalogue = [
  {
    id: "KS-01",
    name: "Non-illuminated Logo",
    tag: "from EUR 299",
    specs: ["Acrylic or metal finish", "No internal lighting", "Indoor or facade"],
    image: images.acrylic,
  },
  {
    id: "KS-02",
    name: "Illuminated Logo",
    tag: "from EUR 450",
    specs: ["Frontlit or backlit", "LED modules", "Facade-ready"],
    image: images.facade,
  },
  {
    id: "KS-03",
    name: "Lightbox",
    tag: "from EUR 650",
    specs: ["Replaceable textile", "LED illumination", "Retail graphics"],
    image: images.lightbox,
  },
  {
    id: "KS-04",
    name: "Side-mounted Logo",
    tag: "on request",
    specs: ["Side-mounted structure", "Facade projection", "Custom mounting"],
    image: images.aluminium,
  },
];

const referenceGroups = [
  {
    eyebrow: "01",
    title: "Leuchtlogo innen",
    description: "Beleuchtete Logos für Shops, Eingänge, Kassenbereiche und Innenwände.",
    items: [
      { image: "/references/illuminated-interior-logo.jpg", title: "Shop-Eingang", text: "Kompaktes Leuchtlogo im Retail-Bereich." },
      { image: "/references/illuminated-interior-logo-2.jpg", title: "Innenlogo im Store", text: "Leuchtkasten-Lösung für klare Markenpräsenz." },
      { image: "/references/illuminated-retail-facade.jpg", title: "Retail-Front innen", text: "Beleuchtete Markenfläche im Eingangsbereich." },
      { image: "/references/illuminated-retail-facade-2.jpg", title: "Leuchtlogo-Detail", text: "Nahaufnahme von Lichtfläche und Kantenausführung." },
      { image: "/references/illuminated-indoor-05.jpg", title: "Innenraum-Anwendung", text: "Beleuchtetes Logo für Kundenlaufwege." },
      { image: "/references/illuminated-indoor-06.jpg", title: "Brand Wall", text: "Leuchtlogo als Fokuspunkt im Innenbereich." },
    ],
  },
  {
    eyebrow: "02",
    title: "Leuchtlogo außen",
    description: "Beleuchtete Fassadenlogos für Außenwirkung, Sichtbarkeit und Standortkennzeichnung.",
    items: [
      { image: "/references/illuminated-exterior-logo.jpg", title: "Fassadenlogo", text: "Außenmontage mit gleichmäßiger LED-Ausleuchtung." },
      { image: "/references/illuminated-exterior-logo-2.jpg", title: "Profilbuchstaben", text: "Gut sichtbare Shop- und Fassadenbeschriftung." },
      { image: "/references/illuminated-outdoor-03.jpg", title: "Außenlogo bei Tag", text: "Leuchtlogo für Eingangs- und Fassadenbereiche." },
      { image: "/references/illuminated-outdoor-04.jpg", title: "Fassadenansicht", text: "Markenlogo mit klarer Fernwirkung." },
      { image: "/references/illuminated-outdoor-05.jpg", title: "Montierte Buchstaben", text: "Einzelbuchstaben auf Außenfassade." },
      { image: "/references/illuminated-outdoor-06.jpg", title: "Nachtwirkung", text: "Beleuchtetes Logo mit hoher Sichtbarkeit am Abend." },
    ],
  },
  {
    eyebrow: "03",
    title: "Nicht beleuchtetes Logo innen",
    description: "Nicht beleuchtete Wandlogos, 3D-Elemente und Markenflächen für Innenräume.",
    items: [
      { image: "/references/non-illuminated-interior-logo.jpg", title: "Wandlogo Empfang", text: "Saubere Logo-Elemente auf Innenwand." },
      { image: "/references/non-illuminated-interior-logo-2.jpg", title: "Wandgrafik", text: "Nicht beleuchtete Innenwand-Gestaltung." },
      { image: "/references/non-illuminated-indoor-03.jpg", title: "Innenwand-Logo", text: "Logo-Elemente mit matter Oberflächenwirkung." },
      { image: "/references/non-illuminated-indoor-04.jpg", title: "3D-Wandlogo", text: "Nicht beleuchtete Buchstaben im Innenraum." },
      { image: "/references/non-illuminated-indoor-05.jpg", title: "Markenwand", text: "Logo und Wandgrafik als Raumidentität." },
      { image: "/references/non-illuminated-indoor-06.jpg", title: "Office Branding", text: "Dezente Innenraum-Beschriftung." },
    ],
  },
  {
    eyebrow: "04",
    title: "Nicht beleuchtetes Logo außen",
    description: "Fassadenlogos ohne interne Beleuchtung, geeignet für klare Tageswirkung.",
    items: [
      { image: "/references/non-illuminated-outdoor-01.jpg", title: "Fassadenlogo ohne Licht", text: "Außenlogo mit klarer Formensprache." },
      { image: "/references/non-illuminated-outdoor-02.jpg", title: "Außenbeschriftung", text: "Nicht beleuchtete Einzelbuchstaben." },
      { image: "/references/non-illuminated-outdoor-03.jpg", title: "Großes Fassadenlogo", text: "Logoelemente auf Gebäudefassade." },
      { image: "/references/non-illuminated-outdoor-04.jpg", title: "Gebäudekennzeichnung", text: "Nicht beleuchtete Markenfläche außen." },
      { image: "/references/non-illuminated-outdoor-05.jpg", title: "Detail Außenlogo", text: "Material, Tiefe und Montagewirkung." },
      { image: "/references/non-illuminated-outdoor-06.jpg", title: "Standortlogo", text: "Außenwirkung ohne integrierte Beleuchtung." },
    ],
  },
  {
    eyebrow: "05",
    title: "Logo-Stele",
    description: "Freistehende Stelen und Pylone für Außenbereiche, Autohauser und Retail-Standorte.",
    items: [
      { image: "/references/logo-pylon.jpg", title: "Freistehende Logo-Stele", text: "Standortkennzeichnung im Außenbereich." },
      { image: "/references/logo-pylon-2.jpg", title: "Außenstele am Standort", text: "Stele mit Logo und Orientierung." },
      { image: "/references/logo-pylon-3.jpg", title: "Pylon mit Markenlogo", text: "Freistehende Lösung für Zufahrt und Eingang." },
      { image: "/references/logo-pylon-4.jpg", title: "Standort-Pylon", text: "Großformatige Kennzeichnung im Außenraum." },
      { image: "/references/logo-pylon-5.jpg", title: "Logo-Stele Detail", text: "Saubere Oberfläche und robuste Außenwirkung." },
      { image: "/references/logo-pylon-6.jpg", title: "Hohe Logo-Stele", text: "Vertikale Markenpräsenz für Fernwirkung." },
    ],
  },
  {
    eyebrow: "06",
    title: "Seitlich montiertes Logo",
    description: "Ausleger, seitlich montierte Logos und Sonderkonstruktionen für bessere Sichtbarkeit.",
    items: [
      { image: "/references/side-mounted-logo.jpg", title: "Seitlich montiertes Logo", text: "Auskragendes Logo für Laufwege." },
      { image: "/references/side-mounted-logo-2.jpg", title: "Seitlicher Leuchtausleger", text: "Rundes Auslegerlogo mit Beleuchtung." },
      { image: "/references/side-mounted-logo-3.jpg", title: "Fassaden-Ausleger", text: "Seitliche Befestigung an der Gebäudefassade." },
      { image: "/references/side-mounted-logo-4.jpg", title: "Auslegerkonstruktion", text: "Logo mit sichtbarer Tiefe und Trägerstruktur." },
      { image: "/references/side-mounted-logo-5.jpg", title: "Doppelseitige Wirkung", text: "Seitlich sichtbares Logo für Kundenlaufwege." },
      { image: "/references/side-mounted-logo-6.jpg", title: "Hängendes Seitenlogo", text: "Dezente seitliche Montage für Retail-Bereiche." },
    ],
  },
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative flex min-h-screen items-end overflow-hidden">
        <img src={images.hero} alt="Illuminated facade logo" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-40">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <div className="mb-6 text-sm uppercase tracking-[0.35em] text-neutral-300">
              {t.hero.eyebrow}
            </div>
            <h1 className="text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
              {t.hero.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-300">{t.hero.text}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="inline-flex rounded-2xl bg-white px-7 py-4 text-sm tracking-wide text-black transition hover:bg-neutral-200"
              >
                {t.hero.primary} <ArrowRight className="ml-2" size={17} />
              </Link>
              <Link
                href="#references"
                className="inline-flex rounded-2xl border border-white/30 px-7 py-4 text-sm tracking-wide text-white transition hover:bg-white/10"
              >
                {t.hero.secondary}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-14 px-6 py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-6 text-sm uppercase tracking-[0.25em] text-neutral-500">
            {t.sections.built}
          </div>
          <h2 className="text-4xl font-light leading-tight md:text-5xl">
            {t.sections.builtTitle}
          </h2>
        </div>
        <div className="text-lg leading-8 text-neutral-300">{t.sections.builtText}</div>
      </section>

      <section id="systems" className="px-6 pb-28">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow={t.sections.systems} title={t.sections.systemsTitle} />
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {systems.map((item) => (
              <ImageCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section id="references" className="mx-auto max-w-7xl px-6 pb-28">
        <SectionTitle
          eyebrow={t.sections.references}
          title="Referenzen nach Logo-Typ."
        />
        <div className="grid gap-14">
          {referenceGroups.map((group) => (
            <div key={group.title} className="rounded-[34px] border border-white/10 bg-neutral-950/70 p-5 md:p-8">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-3 text-sm uppercase tracking-[0.25em] text-neutral-500">{group.eyebrow}</div>
                  <h3 className="text-3xl font-light text-white md:text-4xl">{group.title}</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">{group.description}</p>
                </div>
                <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                  {group.items.length} Projekte
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <ReferenceCard key={item.image} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-7xl px-6 pb-28">
        <SectionTitle
          eyebrow={t.sections.catalogue}
          title="Starting points for custom signage requests."
        />
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {catalogue.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section id="process" className="mx-auto max-w-7xl px-6 pb-28">
        <SectionTitle eyebrow={t.sections.process} title="From request to formal quote." />
        <div className="grid gap-4 md:grid-cols-5">
          {t.process.map((step, index) => (
            <div key={step} className="rounded-[28px] border border-white/10 bg-neutral-950 p-6">
              <div className="mb-8 text-sm text-neutral-500">{String(index + 1).padStart(2, "0")}</div>
              <CheckCircle2 className="mb-4 text-neutral-500" />
              <div className="text-lg font-light">{step}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-14">
      <div className="mb-4 text-sm uppercase tracking-[0.25em] text-neutral-500">{eyebrow}</div>
      <h2 className="max-w-4xl text-4xl font-light md:text-5xl">{title}</h2>
    </div>
  );
}

function ImageCard({
  image,
  title,
  text,
  tall = false,
}: {
  image: string;
  title: string;
  text: string;
  tall?: boolean;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-[32px] bg-neutral-900 ${tall ? "h-[620px]" : "h-[420px]"}`}>
      <img src={image} alt={title} className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-8">
        <h3 className="text-2xl font-light text-white">{title}</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-neutral-300">{text}</p>
      </div>
    </div>
  );
}

function ReferenceCard({
  image,
  title,
  text,
}: {
  image: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative h-72 overflow-hidden rounded-[26px] border border-white/10 bg-neutral-900 md:h-80">
      <img src={image} alt={title} className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h4 className="text-lg font-light text-white">{title}</h4>
        <p className="mt-2 text-sm leading-5 text-neutral-300">{text}</p>
      </div>
    </div>
  );
}

function ProductCard({
  item,
}: {
  item: { id: string; name: string; tag: string; specs: string[]; image: string };
}) {
  return (
    <div className="group h-full overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950 shadow-sm transition hover:-translate-y-1 hover:border-white/25">
      <div className="relative h-64 overflow-hidden bg-neutral-900">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105" />
        <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
          #{item.id}
        </div>
      </div>
      <div className="p-6">
        <div className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">{item.tag}</div>
        <h3 className="text-xl font-light text-white">{item.name}</h3>
        <div className="mt-5 grid gap-2">
          {item.specs.map((spec) => (
            <div key={spec} className="flex items-center gap-2 text-sm text-neutral-400">
              <Ruler size={15} className="text-neutral-600" /> {spec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
