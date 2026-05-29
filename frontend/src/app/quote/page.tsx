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

const quoteCopy = {
  en: {
    sidebarEyebrow: "Logo request",
    steps: ["Project", "Size", "Material", "Lighting", "Logo", "Installation", "Confirm"],
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
    acrylic: "Acrylic",
    aluminium: "Aluminium",
    stainless: "Stainless steel",
    lightboxTextile: "Lightbox textile",
    lighting: "Lighting",
    backlit: "Backlit",
    frontlit: "Frontlit",
    sideLit: "Side lit",
    none: "Non-illuminated",
    colorTemperature: "Color temperature",
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
    wholeLogoOrLightbox: "Whole logo or complete lightbox installation",
    lettersOnMetalBeam: "Individual letters fixed on a metal crossbeam",
    country: "Country",
    postalCode: "Postal code",
    city: "City",
    confirmRequest: "Confirm request",
    notes: "Notes",
  },
  de: {
    sidebarEyebrow: "Logo-Anfrage",
    steps: ["Projekt", "Größe", "Material", "Beleuchtung", "Logo", "Montage", "Bestätigung"],
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
    acrylic: "Acryl",
    aluminium: "Aluminium",
    stainless: "Edelstahl",
    lightboxTextile: "Textil-Leuchtkasten",
    lighting: "Beleuchtung",
    backlit: "Hinterleuchtet",
    frontlit: "Frontbeleuchtet",
    sideLit: "Seitlich beleuchtet",
    none: "Nicht beleuchtet",
    colorTemperature: "Farbtemperatur",
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
    wholeLogoOrLightbox: "Gesamtes Logo oder kompletter Leuchtkasten",
    lettersOnMetalBeam: "Einzelbuchstaben auf Metallquerträger befestigen",
    country: "Land",
    postalCode: "Postleitzahl",
    city: "Stadt",
    confirmRequest: "Anfrage bestätigen",
    notes: "Notizen",
  },
} as const;

const stepCount = quoteCopy.en.steps.length;

export default function QuotePage() {
  const { locale, t } = useLanguage();
  const q = quoteCopy[locale];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuoteResponse | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [form, setForm] = useState({
    application_type: "non_illuminated_logo",
    width_mm: "1200",
    height_mm: "400",
    depth_mm: "80",
    quantity: "1",
    material: "acrylic",
    lighting_type: "backlit",
    color_temp: "4000K",
    need_installation: "true",
    installation_scene: "outdoor",
    installation_method: "individual_letters",
    country: "DE",
    postal_code: "",
    city: "",
    reference_url: "",
    customer_notes: "",
  });

  const indicative = useMemo(() => {
    if (form.application_type === "illuminated_logo") return locale === "de" ? "ab EUR 450" : "from EUR 450";
    if (form.application_type === "lightbox") return locale === "de" ? "ab EUR 650" : "from EUR 650";
    if (form.application_type === "side_mounted_logo") return locale === "de" ? "ab EUR 750" : "from EUR 750";
    if (form.material === "aluminium") return locale === "de" ? "ab EUR 450" : "from EUR 450";
    return locale === "de" ? "ab EUR 299" : "from EUR 299";
  }, [form.application_type, form.material, locale]);

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
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
            {q.steps.map((item, index) => (
              <button
                type="button"
                key={item}
                onClick={() => setStep(index)}
                className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                  step === index ? "bg-white text-black" : "text-neutral-400 hover:bg-white/5"
                }`}
              >
                {String(index + 1).padStart(2, "0")} {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-[32px] border border-white/10 bg-neutral-950 p-8">
          {step === 0 && (
            <Panel title={q.projectType}>
              <Select label={q.application} name="application_type" value={form.application_type} onChange={update}>
                <option value="non_illuminated_logo">{q.nonIlluminatedLogo}</option>
                <option value="illuminated_logo">{q.illuminatedLogo}</option>
                <option value="lightbox">{q.lightbox}</option>
                <option value="side_mounted_logo">{q.sideMountedLogo}</option>
              </Select>
            </Panel>
          )}

          {step === 1 && (
            <Panel title={q.dimensions}>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label={q.width} name="width_mm" value={form.width_mm} onChange={update} required />
                <Input label={q.height} name="height_mm" value={form.height_mm} onChange={update} required />
                <Input label={q.depth} name="depth_mm" value={form.depth_mm} onChange={update} />
                <Input label={q.quantity} name="quantity" value={form.quantity} onChange={update} required />
              </div>
            </Panel>
          )}

          {step === 2 && (
            <Panel title={q.material}>
              <Select label={q.material} name="material" value={form.material} onChange={update}>
                <option value="acrylic">{q.acrylic}</option>
                <option value="aluminium">{q.aluminium}</option>
                <option value="stainless">{q.stainless}</option>
                <option value="lightbox">{q.lightboxTextile}</option>
              </Select>
            </Panel>
          )}

          {step === 3 && (
            <Panel title={q.lighting}>
              <div className="grid gap-4 md:grid-cols-2">
                <Select label={q.lighting} name="lighting_type" value={form.lighting_type} onChange={update}>
                  <option value="backlit">{q.backlit}</option>
                  <option value="frontlit">{q.frontlit}</option>
                  <option value="side-lit">{q.sideLit}</option>
                  <option value="none">{q.none}</option>
                </Select>
                <Input label={q.colorTemperature} name="color_temp" value={form.color_temp} onChange={update} />
              </div>
            </Panel>
          )}

          {step === 4 && (
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

          {step === 5 && (
            <Panel title={q.installationDelivery}>
              <div className="grid gap-4 md:grid-cols-2">
                <Select label={q.installationNeeded} name="need_installation" value={form.need_installation} onChange={update}>
                  <option value="true">{q.yes}</option>
                  <option value="false">{q.no}</option>
                </Select>
                <Select label={q.installationScene} name="installation_scene" value={form.installation_scene} onChange={update}>
                  <option value="outdoor">{q.outdoorInstallation}</option>
                  <option value="indoor">{q.indoorInstallation}</option>
                </Select>
                <Select label={q.installationMethod} name="installation_method" value={form.installation_method} onChange={update}>
                  <option value="individual_letters">{q.individualLetters}</option>
                  <option value="whole_logo_or_lightbox">{q.wholeLogoOrLightbox}</option>
                  <option value="letters_on_metal_beam">{q.lettersOnMetalBeam}</option>
                </Select>
                <Input label={q.country} name="country" value={form.country} onChange={update} />
                <Input label={q.postalCode} name="postal_code" value={form.postal_code} onChange={update} />
                <Input label={q.city} name="city" value={form.city} onChange={update} />
              </div>
            </Panel>
          )}

          {step === 6 && (
            <Panel title={q.confirmRequest}>
              <div className="rounded-[24px] bg-white p-6 text-black">
                <div className="text-sm text-neutral-500">{t.quote.indicative}</div>
                <div className="mt-2 text-4xl font-light">{indicative}</div>
                <p className="mt-3 text-sm text-neutral-600">{t.quote.notBinding}</p>
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
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              className="rounded-2xl border border-white/15 px-5 py-3 text-sm text-white"
            >
              {t.quote.back}
            </button>
            {step < stepCount - 1 ? (
              <button
                type="button"
                onClick={() => setStep((value) => Math.min(stepCount - 1, value + 1))}
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

function Input({
  label,
  name,
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
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

function Select({
  label,
  name,
  value,
  onChange,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-neutral-300">
      {label}
      <select
        className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40"
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
