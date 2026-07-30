"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { QuoteWizard } from "@/components/QuoteWizard";
import { useLanguage } from "@/components/LanguageProvider";
import {
  localized,
  products,
  projectCards,
  type ProductFamily,
} from "@/lib/lumasign-content";

export default function Home() {
  const { locale, t } = useLanguage();
  const [activeProduct, setActiveProduct] = useState<ProductFamily>("letters");
  const [quoteProduct, setQuoteProduct] = useState<ProductFamily | undefined>();
  const [quoteVariant, setQuoteVariant] = useState<string | undefined>();
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("product");
    if (products.some((product) => product.id === requested)) {
      const timer = window.setTimeout(
        () => setActiveProduct(requested as ProductFamily),
        0,
      );
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    function handleProductNavigation(event: Event) {
      const requested = (event as CustomEvent<string>).detail;
      if (products.some((product) => product.id === requested)) {
        setActiveProduct(requested as ProductFamily);
      }
    }
    window.addEventListener("lumasign:product", handleProductNavigation);
    return () => window.removeEventListener("lumasign:product", handleProductNavigation);
  }, []);

  const selectedProduct =
    products.find((product) => product.id === activeProduct) ?? products[0];

  function startQuote(product: ProductFamily, variant?: string) {
    setQuoteProduct(product);
    setQuoteVariant(variant);
    setSelectionVersion((version) => version + 1);
    window.setTimeout(
      () => document.querySelector("#angebot")?.scrollIntoView({ behavior: "smooth" }),
      30,
    );
  }

  return (
    <main id="top">
      <section className="hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/lumasign/projects/xpeng-showroom-dusk.jpg"
          aria-label="LumaSign Europe showreel"
        >
          <source src="/lumasign/lumasign-homepage-showreel.mp4" type="video/mp4" />
        </video>
        <Image
          src="/lumasign/projects/xpeng-showroom-dusk.jpg"
          alt="Illuminated Xpeng showroom facade at dusk"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-panel">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.hero.title}</h1>
          <p className="hero-copy">{t.hero.text}</p>
          <div className="hero-actions">
            <a className="button primary" href="#angebot">
              {t.hero.primary}
            </a>
            <a className="button secondary" href="#produkte">
              {t.hero.secondary}
            </a>
          </div>
        </div>
        <aside className="hero-metrics" aria-label="Project benefits">
          {t.hero.benefits.map((benefit) => (
            <div key={benefit}>
              <strong aria-hidden="true">✓</strong>
              <span>{benefit}</span>
            </div>
          ))}
        </aside>
      </section>

      <section id="projekte" className="projects">
        <div className="section-heading">
          <p className="eyebrow">{t.projects.eyebrow}</p>
          <h2>{t.projects.title}</h2>
          <p>{t.projects.text}</p>
        </div>
        <div className="project-strip">
          {projectCards.map((project) => {
            const title = localized(project.title, locale);
            return (
              <article className="project-card" key={`${project.image}-${title}`}>
                <button
                  type="button"
                  className="ls-project-image-button"
                  onClick={() => setModalImage({ src: project.image, alt: title })}
                  aria-label={`${title} – ${locale === "de" ? "Bild vergrößern" : "Enlarge image"}`}
                >
                  <Image
                    src={project.image}
                    alt={title}
                    width={900}
                    height={760}
                    sizes="(max-width: 620px) 100vw, (max-width: 1080px) 50vw, 33vw"
                  />
                </button>
                <span>
                  <strong>{title}</strong>
                  {localized(project.subtitle, locale)}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section id="montage" className="installation">
        <div className="montage-intro">
          <p className="eyebrow">{t.installation.eyebrow}</p>
          <h2>{t.installation.title}</h2>
          <p>{t.installation.text}</p>
          <a className="button dark" href="#kontakt">
            {t.installation.action}
          </a>
        </div>

        <div className="montage-flow" aria-label={t.installation.title}>
          {t.installation.steps.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>

        <div className="montage-visuals">
          <article className="montage-scene truck-scene">
            <Image
              className="montage-photo"
              src="/lumasign/projects/montage-transport-truck.png"
              alt={t.installation.transport}
              width={900}
              height={700}
            />
            <strong>{t.installation.transport}</strong>
            <p>{t.installation.transportText}</p>
          </article>
          <article className="montage-scene lift-scene">
            <Image
              className="montage-photo"
              src="/lumasign/projects/montage-hoehenzugang-lift.jpg"
              alt={t.installation.access}
              width={900}
              height={700}
            />
            <strong>{t.installation.access}</strong>
            <p>{t.installation.accessText}</p>
          </article>
          <article className="montage-map">
            <GermanyMap />
            <strong>{t.installation.germany}</strong>
            <p>{t.installation.germanyText}</p>
          </article>
        </div>
      </section>

      <section id="produkte" className="products">
        <div className="product-heading">
          <p className="eyebrow">{t.products.eyebrow}</p>
          <h2>{t.products.title}</h2>
          <p>{t.products.text}</p>
        </div>

        <div className="product-tabs" role="tablist" aria-label={t.products.title}>
          {products.map((product) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeProduct === product.id}
              className={activeProduct === product.id ? "active" : ""}
              key={product.id}
              onClick={() => setActiveProduct(product.id)}
            >
              {localized(product.label, locale)}
            </button>
          ))}
        </div>

        <article className="product-detail active">
          <div className="product-intro">
            <h3>{localized(selectedProduct.label, locale)}</h3>
            <p>{localized(selectedProduct.description, locale)}</p>
          </div>
          <div className="product-variants">
            {selectedProduct.variants.map((variant) => (
              <button
                type="button"
                className="product-preset"
                key={variant.value}
                onClick={() => startQuote(selectedProduct.id, variant.value)}
              >
                {variant.image ? (
                  <Image
                    src={variant.image}
                    alt={localized(variant.label, locale)}
                    width={620}
                    height={520}
                  />
                ) : (
                  <span className={`logo-effect ${variant.effect || ""}`} role="img">
                    <span>LOGO</span>
                  </span>
                )}
                <strong>{localized(variant.label, locale)}</strong>
              </button>
            ))}
          </div>
          <div className="product-actions">
            <button
              type="button"
              className="button dark"
              onClick={() => startQuote(selectedProduct.id)}
            >
              {t.products.action}
            </button>
          </div>
        </article>
      </section>

      <section id="angebot" className="quote-section">
        <div className="quote-intro">
          <p className="eyebrow">{t.quote.eyebrow}</p>
          <h2>{t.quote.title}</h2>
          <p>{t.quote.intro}</p>
          <div className="contact-lines">
            {t.quote.contactLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
        <QuoteWizard
          selectedProduct={quoteProduct}
          selectedVariant={quoteVariant}
          selectionVersion={selectionVersion}
        />
      </section>

      <section className="customer-strip" aria-label={t.customers}>
        <span>{t.customers}</span>
        <div className="customer-logo-grid">
          <Image
            src="/lumasign/projects/customer-logos-automotive-a.png"
            alt="Automotive clients"
            width={1700}
            height={260}
          />
          <Image
            src="/lumasign/projects/customer-logos-brands.png"
            alt="Brand clients"
            width={1700}
            height={260}
          />
          <Image
            src="/lumasign/projects/customer-logos-automotive-b.png"
            alt="Automotive clients"
            width={1700}
            height={260}
          />
        </div>
      </section>

      <LegalSections />
      <SiteFooter onProductSelect={setActiveProduct} />
      <WhatsAppButton />

      {modalImage && (
        <div
          className="image-modal"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.currentTarget === event.target) setModalImage(null);
          }}
        >
          <button type="button" onClick={() => setModalImage(null)} aria-label="Close image">
            ×
          </button>
          <Image
            src={modalImage.src}
            alt={modalImage.alt}
            width={1600}
            height={1200}
            sizes="95vw"
          />
        </div>
      )}
    </main>
  );
}

function GermanyMap() {
  return (
    <div className="germany-map" aria-label="Germany installation cities">
      <svg viewBox="0 0 240 300" role="img" aria-label="Map of Germany">
        <path d="M118 14 86 30 73 55 50 62 56 89 38 107 52 133 45 158 67 176 66 205 91 215 99 245 126 286 153 257 174 253 180 224 203 206 193 178 206 154 190 130 194 103 169 91 162 60 138 52Z" />
      </svg>
      <span className="city berlin">Berlin</span>
      <span className="city hamburg">Hamburg</span>
      <span className="city koeln">Köln</span>
      <span className="city frankfurt">Frankfurt</span>
      <span className="city stuttgart">Stuttgart</span>
      <span className="city muenchen">München</span>
      <span className="city leipzig">Leipzig</span>
      <span className="city duesseldorf">Düsseldorf</span>
    </div>
  );
}

function LegalSections() {
  const { locale, t } = useLanguage();
  const de = locale === "de";
  return (
    <section className="legal-section" aria-label={t.legal.eyebrow}>
      <article id="impressum" className="legal-card">
        <p className="eyebrow">{t.legal.imprint}</p>
        <h2>{de ? "Angaben gemäß § 5 TMG" : "Information according to § 5 TMG"}</h2>
        <div className="legal-grid">
          <div>
            <h3>{de ? "Anbieter / Betreiber" : "Provider / operator"}</h3>
            <p>
              KleinS GmbH
              <br />
              Grupellostraße 27
              <br />
              40210 Düsseldorf, Germany
            </p>
            <p>
              +49 (0) 211 98463093
              <br />
              hello@kleinsmarketing.de
            </p>
          </div>
          <div>
            <h3>{de ? "Vertretungsberechtigte Person" : "Legal representative"}</h3>
            <p>{de ? "Geschäftsführer: Wenchang Lu" : "Managing director: Wenchang Lu"}</p>
            <h3>{de ? "Register und Steuern" : "Register details"}</h3>
            <p>
              Handelsregister: HRB 83821
              <br />
              Amtsgericht Düsseldorf
            </p>
          </div>
          <div>
            <h3>{de ? "Marke / Projekt" : "Brand / project"}</h3>
            <p>
              {de
                ? "LumaSign Europe ist ein Projekt für individuelle Lichtwerbung, Leuchtlogos, Transport und Montagekoordination."
                : "LumaSign Europe provides custom illuminated signage, logo production, transport and installation coordination."}
            </p>
            <h3>{de ? "Datenschutz" : "Data protection"}</h3>
            <p>
              {de
                ? "Daten aus Kontaktformularen werden ausschließlich zur Bearbeitung von Anfragen und Projekten verarbeitet."
                : "Contact form data is processed only to handle enquiries, quotations and projects."}
            </p>
          </div>
        </div>
      </article>

      <article id="garantie" className="legal-card">
        <p className="eyebrow">{t.legal.warranty}</p>
        <h2>{de ? "Garantie und Reklamationsabwicklung" : "Warranty and claims"}</h2>
        <div className="legal-copy">
          <h3>{de ? "Dauer der Garantie" : "Warranty period"}</h3>
          <p>
            {de
              ? "Für LumaSign-Produkte gilt eine Garantie von 24 Monaten ab Lieferung, sofern sie unter normalen Bedingungen und gemäß den Montagehinweisen verwendet werden."
              : "LumaSign products carry a 24-month warranty from delivery when used under normal conditions and according to installation instructions."}
          </p>
          <h3>{de ? "Umfang der Garantie" : "Warranty coverage"}</h3>
          <p>
            {de
              ? "Die Garantie bezieht sich auf versteckte Material- oder Produktionsfehler. Je nach Fall erfolgt Nachbesserung, Ersatzteillieferung oder Austausch."
              : "The warranty covers hidden material or production defects. Depending on the case, we may repair, provide parts or replace the product."}
          </p>
          <h3>{de ? "Ausschlüsse" : "Exclusions"}</h3>
          <p>
            {de
              ? "Ausgeschlossen sind unsachgemäße Installation, mechanische Beschädigung, normaler Verschleiß und Nutzung außerhalb der Produktspezifikation."
              : "Improper installation, mechanical damage, normal wear and use outside the product specification are excluded."}
          </p>
        </div>
      </article>

      <article id="widerruf-retouren" className="legal-card">
        <p className="eyebrow">{t.legal.returns}</p>
        <h2>
          {de
            ? "Rückgabe von individuell gefertigten Produkten"
            : "Returns for individually manufactured products"}
        </h2>
        <div className="legal-copy">
          <p>
            {de
              ? "LumaSign fertigt Logoanlagen, Leuchtbuchstaben, Neon Signs und Leuchtkästen individuell. Nach Produktionsfreigabe besteht in der Regel kein reguläres Rückgaberecht."
              : "LumaSign manufactures custom logo systems, illuminated letters, neon signs and lightboxes. After production approval, standard cancellation rights generally do not apply."}
          </p>
          <h3>{de ? "Mängel oder Falschlieferung" : "Defects or incorrect delivery"}</h3>
          <p>
            {de
              ? "Bitte melden Sie Schäden oder Fehler schnell mit Fotos, Videos, Verpackungsbildern und Bestelldaten."
              : "Please report damage or errors promptly with photos, videos, packaging images and order details."}
          </p>
        </div>
      </article>
    </section>
  );
}

function SiteFooter({
  onProductSelect,
}: {
  onProductSelect: (product: ProductFamily) => void;
}) {
  const { locale, t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="footer-column">
        <h3>{t.footer.learn}</h3>
        <a href="#impressum">{t.legal.imprint}</a>
        <a href="#garantie">{t.legal.warranty}</a>
        <a href="#widerruf-retouren">{t.legal.returns}</a>
        <a href="#projekte">{t.nav.inspiration}</a>
      </div>
      <div className="footer-column">
        <h3>{t.footer.support}</h3>
        <a href="#angebot">{t.nav.quote}</a>
        <a href="#montage">{t.installation.eyebrow}</a>
        <a
          href="https://wa.me/491625727600?text=Hallo%20LumaSign%2C%20ich%20moechte%20ein%20Angebot%20anfragen."
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp Chat
        </a>
      </div>
      <div className="footer-column">
        <h3>{t.footer.services}</h3>
        {products.map((product) => (
          <a
            key={product.id}
            href="#produkte"
            onClick={() => onProductSelect(product.id)}
          >
            {localized(product.label, locale)}
          </a>
        ))}
      </div>
      <div className="footer-column footer-contact" id="kontakt">
        <h3>{t.footer.contact}</h3>
        <p>{t.footer.response}</p>
        <a className="footer-button" href="#angebot">
          {t.footer.form}
        </a>
        <p>
          Mo.–Fr. 09:00–17:00
          <br />
          +49 (0) 211 98463093
          <br />
          WhatsApp: +49 162 5727600
          <br />
          <a href="mailto:projects@lumasign.eu">projects@lumasign.eu</a>
        </p>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <a
      className="whatsapp-float"
      href="https://wa.me/491625727600?text=Hallo%20LumaSign%2C%20ich%20moechte%20ein%20Angebot%20anfragen."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open WhatsApp chat"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.01 4a11.8 11.8 0 0 0-10.1 17.9L4.4 27.6l5.85-1.45A11.8 11.8 0 1 0 16.01 4Zm0 2.45a9.35 9.35 0 0 1 7.86 14.4 9.3 9.3 0 0 1-11.9 2.82l-.52-.3-3.52.88.91-3.42-.34-.55a9.35 9.35 0 0 1 7.51-13.83Zm-3.1 4.74c-.22 0-.58.08-.88.42-.3.35-1.15 1.12-1.15 2.72s1.18 3.16 1.34 3.38c.16.22 2.3 3.68 5.68 5.02 2.8 1.1 3.38.88 3.99.83.61-.05 1.96-.8 2.24-1.57.27-.77.27-1.43.19-1.57-.08-.14-.3-.22-.63-.38-.33-.16-1.96-.97-2.26-1.08-.3-.11-.52-.16-.74.16-.22.33-.85 1.08-1.04 1.3-.19.22-.38.25-.71.08-.33-.16-1.39-.51-2.65-1.64-.98-.88-1.65-1.96-1.84-2.29-.19-.33-.02-.51.14-.67.14-.14.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.57-.08-.16-.74-1.79-1.01-2.45-.27-.64-.54-.55-.74-.56h-.72Z"
        />
      </svg>
    </a>
  );
}
