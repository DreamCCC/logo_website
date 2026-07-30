"use client";

import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Locale } from "@/lib/i18n";
import { products } from "@/lib/lumasign-content";
import { useLanguage } from "./LanguageProvider";

export function Header() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="LumaSign Europe">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" focusable="false">
            <path className="ls-l" d="M18 17V43H43" />
            <path className="ls-s" d="M44 21H30C24 21 24 31 30 31H40C46 31 46 43 40 43H25" />
          </svg>
        </span>
        <span>
          <strong>
            Luma<span>Sign</span>
          </strong>
          <small>Lighting your brand.</small>
        </span>
      </Link>

      <nav className={open ? "ls-main-nav is-open" : "ls-main-nav"} aria-label="Main navigation">
        <div className="nav-dropdown">
          <Link href="/#produkte">{t.nav.products}</Link>
          <div className="nav-menu" aria-label={t.nav.products}>
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/?product=${product.id}#produkte`}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("lumasign:product", { detail: product.id }),
                  );
                  setOpen(false);
                }}
              >
                {product.label[locale]}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/#projekte" onClick={() => setOpen(false)}>
          {t.nav.inspiration}
        </Link>
        <Link href="/#montage" onClick={() => setOpen(false)}>
          {t.nav.installation}
        </Link>
        <Link href="/#kontakt" onClick={() => setOpen(false)}>
          {t.nav.contact}
        </Link>
      </nav>

      <div className="ls-header-tools">
        <LanguageToggle locale={locale} setLocale={setLocale} />
        <Link className="ls-account-link" href="/account" aria-label={t.nav.account}>
          <UserRound size={18} aria-hidden="true" />
          <span>{t.nav.account}</span>
        </Link>
        <Link className="header-cta" href="/#angebot">
          {t.nav.quote}
        </Link>
      </div>

      <button
        type="button"
        className="ls-mobile-menu-button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
    </header>
  );
}

function LanguageToggle({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}) {
  return (
    <div className="ls-language-toggle" aria-label="Language">
      {(["en", "de"] as const).map((item) => (
        <button
          type="button"
          key={item}
          onClick={() => setLocale(item)}
          className={locale === item ? "active" : ""}
          aria-pressed={locale === item}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
