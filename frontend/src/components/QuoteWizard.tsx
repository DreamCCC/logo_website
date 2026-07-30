"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, FileUp, LoaderCircle, LockKeyhole, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  getProduct,
  localized,
  products,
  type ProductFamily,
} from "@/lib/lumasign-content";
import { useLanguage } from "./LanguageProvider";

type QuoteFormState = {
  product_family: ProductFamily;
  variant: string;
  usage: "indoor" | "outdoor" | "both";
  design_style: string;
  width_value: string;
  unit: "mm" | "cm" | "m";
  light_color: string;
  mounting: string;
  installation_service: "needed" | "not_needed" | "open";
  deadline: string;
  customer_notes: string;
  country: string;
  city_postal: string;
  delivery_company: string;
  delivery_contact: string;
};

type AuthUser = {
  id: number;
  email: string;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  preferred_locale: string;
  is_admin: boolean;
};

type QuoteResponse = {
  id: number;
  quote_number: string;
  indicative_price_label: string | null;
};

type QuoteWizardProps = {
  selectedProduct?: ProductFamily;
  selectedVariant?: string;
  selectionVersion?: number;
};

const steps = Array.from({ length: 7 }, (_, index) => index);

const materialByProduct: Record<ProductFamily, string> = {
  letters: "acrylic",
  lightboxes: "lightbox",
  neon: "acrylic",
  infinity_mirror: "acrylic",
  custom_concept: "custom",
};

const lightOptions = [
  { value: "warm_white", de: "Warmweiß", en: "Warm white" },
  { value: "neutral_white", de: "Neutralweiß", en: "Neutral white" },
  { value: "cool_white", de: "Kaltweiß", en: "Cool white" },
  { value: "rgb", de: "RGB / Farbwechsel", en: "RGB / colour changing" },
  { value: "unlit", de: "Unbeleuchtet", en: "Non-illuminated" },
  { value: "open", de: "Noch offen", en: "Not decided" },
];

const mountingOptions = [
  {
    value: "preassembled_rail",
    de: "Vormontiert auf Platte / Schiene",
    en: "Preassembled on panel / rail",
  },
  {
    value: "direct_wall",
    de: "Direkt auf Wand / Fassade",
    en: "Directly on wall / facade",
  },
  {
    value: "projecting_double_sided",
    de: "Ausleger / doppelseitig",
    en: "Projecting / double-sided",
  },
  {
    value: "freestanding_special",
    de: "Freistehend / Sonderbau",
    en: "Freestanding / special build",
  },
  { value: "open", de: "Noch offen", en: "Not decided" },
];

const installationServiceOptions = [
  { value: "needed", de: "Montage durch LumaSign", en: "Installation by LumaSign" },
  { value: "not_needed", de: "Keine Montage benötigt", en: "No installation required" },
  { value: "open", de: "Noch offen", en: "Not decided" },
] as const;

function initialState(): QuoteFormState {
  return {
    product_family: "letters",
    variant: "front_lit",
    usage: "indoor",
    design_style: "",
    width_value: "",
    unit: "cm",
    light_color: "warm_white",
    mounting: "preassembled_rail",
    installation_service: "open",
    deadline: "",
    customer_notes: "",
    country: "Deutschland",
    city_postal: "",
    delivery_company: "",
    delivery_contact: "",
  };
}

export function QuoteWizard({
  selectedProduct,
  selectedVariant,
  selectionVersion,
}: QuoteWizardProps) {
  const { locale, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<QuoteFormState>(initialState);
  const [designFiles, setDesignFiles] = useState<File[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuoteResponse | null>(null);

  const activeProduct = useMemo(
    () => getProduct(form.product_family),
    [form.product_family],
  );

  useEffect(() => {
    apiFetch<AuthUser>("/auth/me")
      .then((authenticatedUser) => {
        setUser(authenticatedUser);
        setForm((current) => ({
          ...current,
          delivery_company: current.delivery_company || authenticatedUser.company_name || "",
          delivery_contact:
            current.delivery_contact ||
            authenticatedUser.contact_name ||
            authenticatedUser.email,
        }));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const timer = window.setTimeout(() => {
      const product = getProduct(selectedProduct);
      const nextVariant =
        selectedVariant && product.variants.some((variant) => variant.value === selectedVariant)
          ? selectedVariant
          : product.variants[0].value;
      setForm((current) => ({
        ...current,
        product_family: selectedProduct,
        variant: nextVariant,
        light_color: normalizedLightColor(
          selectedProduct,
          nextVariant,
          current.light_color,
        ),
      }));
      setCurrentStep(selectedVariant ? 2 : 1);
      setResult(null);
      setError(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedProduct, selectedVariant, selectionVersion]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setForm((current) => {
        if (current.country !== "Deutschland" && current.country !== "Germany") return current;
        return { ...current, country: locale === "de" ? "Deutschland" : "Germany" };
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [locale]);

  function update<K extends keyof QuoteFormState>(key: K, value: QuoteFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
    setResult(null);
  }

  function chooseProduct(productFamily: ProductFamily) {
    const product = getProduct(productFamily);
    setForm((current) => ({
      ...current,
      product_family: productFamily,
      variant: product.variants[0].value,
      light_color: normalizedLightColor(
        productFamily,
        product.variants[0].value,
        current.light_color,
      ),
    }));
    window.setTimeout(() => setCurrentStep(1), 120);
  }

  function chooseVariant(value: string) {
    setForm((current) => ({
      ...current,
      variant: value,
      light_color: normalizedLightColor(
        current.product_family,
        value,
        current.light_color,
      ),
    }));
    setError(null);
    setResult(null);
    window.setTimeout(() => setCurrentStep(2), 120);
  }

  function stepIsValid(step: number): boolean {
    if (step === 0) return Boolean(form.product_family);
    if (step === 1) return Boolean(form.variant);
    if (step === 2) return Boolean(form.usage);
    if (step === 4) return Number(form.width_value) > 0 && Boolean(form.mounting);
    if (step === 6) {
      return Boolean(
        form.country.trim() &&
          form.city_postal.trim().length >= 3 &&
          form.delivery_company.trim().length >= 2 &&
          contactLooksValid(form.delivery_contact),
      );
    }
    return true;
  }

  function goNext() {
    if (!stepIsValid(currentStep)) {
      setError(t.quote.required);
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    setError(null);
  }

  async function handleFinalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stepIsValid(6)) {
      setError(t.quote.required);
      return;
    }
    if (!user) {
      setAuthOpen(true);
      return;
    }
    await submitQuote();
  }

  async function submitQuote() {
    setSubmitting(true);
    setError(null);
    try {
      const widthMm = normalizeToMillimetres(Number(form.width_value), form.unit);
      const data = new FormData();
      data.set("application_type", form.product_family);
      data.set("product_family", form.product_family);
      data.set("variant", form.variant);
      data.set("usage", form.usage);
      data.set("design_style", form.design_style);
      data.set("width_value", form.width_value);
      data.set("unit", form.unit);
      data.set("width_mm", String(widthMm));
      data.set("material", materialByProduct[form.product_family]);
      data.set("light_color", form.light_color);
      data.set("mounting", form.mounting);
      data.set("deadline", form.deadline);
      data.set("installation_service", form.installation_service);
      data.set("need_installation", String(form.installation_service === "needed"));
      data.set("installation_scene", form.usage);
      data.set("installation_method", form.mounting);
      data.set("country", form.country);
      data.set("city", form.city_postal);
      data.set("delivery_company", form.delivery_company);
      data.set("delivery_contact", form.delivery_contact);
      data.set("customer_notes", form.customer_notes);
      data.set("locale", locale);
      designFiles.forEach((file) => data.append("files", file));

      const quote = await apiFetch<QuoteResponse>("/quotes", {
        method: "POST",
        body: data,
      });
      setResult(quote);
      setAuthOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  function handleAuthenticated(authenticatedUser: AuthUser) {
    setUser(authenticatedUser);
    setForm((current) => ({
      ...current,
      delivery_company: current.delivery_company || authenticatedUser.company_name || "",
      delivery_contact:
        current.delivery_contact || authenticatedUser.contact_name || authenticatedUser.email,
    }));
    setAuthOpen(false);
    window.setTimeout(() => void submitQuote(), 0);
  }

  if (result) {
    return (
      <div className="quote-wizard ls-quote-success" role="status">
        <span className="ls-success-icon" aria-hidden="true">
          <Check />
        </span>
        <p className="eyebrow">{result.quote_number}</p>
        <h3>{t.quote.success}</h3>
        <div className="ls-price-result">
          <span>{t.quote.indicative}</span>
          <strong>{result.indicative_price_label || "—"}</strong>
        </div>
        <p>{t.quote.notBinding}</p>
        <div className="ls-success-actions">
          <a className="button dark" href="/account">
            {t.nav.account}
          </a>
          <button
            type="button"
            className="button outline"
            onClick={() => {
              setForm(initialState());
              setDesignFiles([]);
              setCurrentStep(0);
              setResult(null);
            }}
          >
            {t.account.newQuote}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form className="quote-wizard" onSubmit={handleFinalSubmit} noValidate>
        <div className="wizard-progress" aria-label="Quote progress">
          {steps.map((step) => (
            <button
              type="button"
              key={step}
              className={step === currentStep ? "active" : step < currentStep ? "done" : ""}
              onClick={() => {
                if (step <= currentStep) setCurrentStep(step);
              }}
              aria-current={step === currentStep ? "step" : undefined}
              aria-label={`Step ${step + 1}`}
            >
              {step + 1}
            </button>
          ))}
        </div>

        <fieldset className={currentStep === 0 ? "wizard-step active" : "wizard-step"}>
          <legend>{t.quote.steps.productTitle}</legend>
          <p>{t.quote.steps.productText}</p>
          <div className="quote-options product-choice">
            {products.map((product) => (
              <label className="quote-option" key={product.id}>
                <input
                  type="radio"
                  name="product_family"
                  value={product.id}
                  checked={form.product_family === product.id}
                  onChange={() => chooseProduct(product.id)}
                />
                <span className="option-visual">
                  <Image
                    src={productImage(product.id)}
                    alt={localized(product.label, locale)}
                    width={420}
                    height={340}
                  />
                </span>
                <strong>{localized(product.label, locale)}</strong>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={currentStep === 1 ? "wizard-step active" : "wizard-step"}>
          <legend>{t.quote.steps.variantTitle}</legend>
          <p>{t.quote.steps.variantText}</p>
          <div className="quote-options compact-options">
            {activeProduct.variants.map((variant) => (
              <label className="quote-option" key={variant.value}>
                <input
                  type="radio"
                  name="variant"
                  value={variant.value}
                  checked={form.variant === variant.value}
                  onChange={() => chooseVariant(variant.value)}
                />
                {variant.image ? (
                  <span className="option-visual">
                    <Image
                      src={variant.image}
                      alt={localized(variant.label, locale)}
                      width={420}
                      height={340}
                    />
                  </span>
                ) : (
                  <span className={`option-visual logo-effect ${variant.effect || ""}`}>
                    <span>LOGO</span>
                  </span>
                )}
                <strong>{localized(variant.label, locale)}</strong>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={currentStep === 2 ? "wizard-step active" : "wizard-step"}>
          <legend>{t.quote.steps.usageTitle}</legend>
          <p>{t.quote.steps.usageText}</p>
          <div className="choice-stack">
            {(["indoor", "outdoor", "both"] as const).map((usage) => (
              <label className="choice-button" key={usage}>
                <input
                  type="radio"
                  name="usage"
                  value={usage}
                  checked={form.usage === usage}
                  onChange={() => {
                    update("usage", usage);
                    window.setTimeout(() => setCurrentStep(3), 120);
                  }}
                />
                <span>{t.quote.fields[usage]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={currentStep === 3 ? "wizard-step active" : "wizard-step"}>
          <legend>{t.quote.steps.designTitle}</legend>
          <p>{t.quote.steps.designText}</p>
          <label className="upload-zone">
            <input
              type="file"
              accept=".svg,.ai,.eps,.pdf,.png,.jpg,.jpeg,.jfif,.webp,.gif,.bmp,.tif,.tiff,.heic,.heif"
              multiple
              onChange={(event) => setDesignFiles(Array.from(event.target.files || []))}
            />
            <span className="upload-icon" aria-hidden="true">
              {designFiles.length > 0 ? <Check /> : <FileUp />}
            </span>
            <strong>
              {designFiles.length === 1
                ? designFiles[0].name
                : designFiles.length > 1
                  ? locale === "de"
                    ? `${designFiles.length} Dateien ausgewählt`
                    : `${designFiles.length} files selected`
                  : t.quote.fields.upload}
            </strong>
            <small>{t.quote.fields.uploadHelp}</small>
          </label>
          <label className="font-field">
            {t.quote.fields.style}
            <input
              value={form.design_style}
              onChange={(event) => update("design_style", event.target.value)}
              placeholder={t.quote.fields.stylePlaceholder}
            />
          </label>
        </fieldset>

        <fieldset className={currentStep === 4 ? "wizard-step active" : "wizard-step"}>
          <legend>{t.quote.steps.detailsTitle}</legend>
          <p>{t.quote.steps.detailsText}</p>
          <div className="field-grid">
            <label>
              {t.quote.fields.width}
              <input
                type="number"
                min="1"
                step="1"
                value={form.width_value}
                onChange={(event) => update("width_value", event.target.value)}
                placeholder="180"
                required
              />
            </label>
            <label>
              {t.quote.fields.unit}
              <select
                value={form.unit}
                onChange={(event) => update("unit", event.target.value as QuoteFormState["unit"])}
              >
                <option value="cm">cm</option>
                <option value="m">m</option>
                <option value="mm">mm</option>
              </select>
            </label>
            <label>
              {t.quote.fields.light}
              <select
                value={form.light_color}
                onChange={(event) => update("light_color", event.target.value)}
              >
                {lightOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option[locale]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.quote.fields.mounting}
              <select
                value={form.mounting}
                onChange={(event) => update("mounting", event.target.value)}
              >
                {mountingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option[locale]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.quote.fields.installationService}
              <select
                value={form.installation_service}
                onChange={(event) =>
                  update(
                    "installation_service",
                    event.target.value as QuoteFormState["installation_service"],
                  )
                }
              >
                {installationServiceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option[locale]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.quote.fields.deadline}
              <input
                type="date"
                value={form.deadline}
                onChange={(event) => update("deadline", event.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className={currentStep === 5 ? "wizard-step active" : "wizard-step"}>
          <legend>{t.quote.steps.notesTitle}</legend>
          <p>{t.quote.steps.notesText}</p>
          <textarea
            value={form.customer_notes}
            onChange={(event) => update("customer_notes", event.target.value)}
            placeholder={t.quote.fields.notesPlaceholder}
          />
        </fieldset>

        <fieldset className={currentStep === 6 ? "wizard-step active" : "wizard-step"}>
          <legend>{t.quote.steps.deliveryTitle}</legend>
          <p>{t.quote.steps.deliveryText}</p>
          <div className="field-grid">
            <label>
              {t.quote.fields.country}
              <input
                value={form.country}
                onChange={(event) => update("country", event.target.value)}
                required
              />
            </label>
            <label>
              {t.quote.fields.city}
              <input
                value={form.city_postal}
                onChange={(event) => update("city_postal", event.target.value)}
                placeholder="10115 Berlin"
                required
              />
            </label>
            <label>
              {t.quote.fields.deliveryCompany}
              <input
                value={form.delivery_company}
                onChange={(event) => update("delivery_company", event.target.value)}
                placeholder="Studio Linden"
                minLength={2}
                required
              />
            </label>
            <label>
              {t.quote.fields.deliveryContact}
              <input
                value={form.delivery_contact}
                onChange={(event) => update("delivery_contact", event.target.value)}
                placeholder="name@company.de or +49 ..."
                required
              />
            </label>
          </div>
        </fieldset>

        <div className="wizard-actions">
          <button
            className={currentStep === 0 ? "button ghost hidden" : "button ghost"}
            type="button"
            onClick={() => {
              setCurrentStep((step) => Math.max(step - 1, 0));
              setError(null);
            }}
          >
            {t.quote.back}
          </button>
          {currentStep < 6 ? (
            <button className="button primary" type="button" onClick={goNext}>
              {t.quote.next}
            </button>
          ) : (
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle className="ls-spin" size={18} />
                  {t.quote.submitting}
                </>
              ) : (
                t.quote.submit
              )}
            </button>
          )}
        </div>
        <p className="form-note" role="status">
          {error || ""}
        </p>
      </form>

      {authOpen && (
        <InlineAuthGate
          onClose={() => setAuthOpen(false)}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </>
  );
}

function InlineAuthGate({
  onClose,
  onAuthenticated,
}: {
  onClose: () => void;
  onAuthenticated: (user: AuthUser) => void;
}) {
  const { locale, t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await apiFetch<{ user: AuthUser }>(
        mode === "login" ? "/auth/login" : "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(
            mode === "register" ? { ...data, preferred_locale: locale } : data,
          ),
        },
      );
      onAuthenticated(response.user);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ls-auth-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-gate-title">
      <div className="ls-auth-dialog">
        <button type="button" className="ls-dialog-close" onClick={onClose} aria-label={t.auth.close}>
          <X aria-hidden="true" />
        </button>
        <span className="ls-auth-lock" aria-hidden="true">
          <LockKeyhole />
        </span>
        <h2 id="auth-gate-title">{t.auth.gateTitle}</h2>
        <p>{t.auth.gateText}</p>
        <div className="segmented-control">
          <label>
            <input
              type="radio"
              checked={mode === "login"}
              onChange={() => setMode("login")}
            />
            {t.auth.login}
          </label>
          <label>
            <input
              type="radio"
              checked={mode === "register"}
              onChange={() => setMode("register")}
            />
            {t.auth.register}
          </label>
        </div>
        <form className="ls-auth-form" onSubmit={authenticate}>
          <label>
            {t.auth.email}
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            {t.auth.password}
            <input
              name="password"
              type="password"
              required
              minLength={mode === "register" ? 8 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>
          {mode === "register" && (
            <div className="field-grid">
              <label>
                {t.auth.company}
                <input name="company_name" />
              </label>
              <label>
                {t.auth.contact}
                <input name="contact_name" />
              </label>
              <label>
                {t.auth.phone}
                <input name="phone" type="tel" />
              </label>
            </div>
          )}
          {error && <div className="ls-form-error">{error}</div>}
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? t.quote.submitting : mode === "login" ? t.auth.login : t.auth.register}
          </button>
        </form>
      </div>
    </div>
  );
}

function contactLooksValid(value: string): boolean {
  const trimmed = value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const phoneOk = /^\+?[0-9\s().-]{7,}$/.test(trimmed);
  return emailOk || phoneOk;
}

function normalizeToMillimetres(value: number, unit: QuoteFormState["unit"]): number {
  if (unit === "m") return Math.round(value * 1000);
  if (unit === "cm") return Math.round(value * 10);
  return Math.round(value);
}

function normalizedLightColor(
  product: ProductFamily,
  variant: string,
  current: string,
): string {
  if (product === "letters" && variant === "non_lit") return "unlit";
  return current === "unlit" ? "warm_white" : current;
}

function productImage(product: ProductFamily): string {
  const images: Record<ProductFamily, string> = {
    letters: "/lumasign/projects/letters-backlit-number.webp",
    lightboxes: "/lumasign/projects/lightbox-fabric-retail.jpeg",
    neon: "/lumasign/projects/neon-custom-color-sign.jpg",
    infinity_mirror: "/lumasign/projects/neon-infinity-mirror.jpg",
    custom_concept: "/lumasign/projects/xpeng-mitsubishi-facade.jpg",
  };
  return images[product];
}
