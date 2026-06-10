"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Locale } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

const navItems = [
  { key: "systems", href: "/#systems" },
  { key: "references", href: "/#references" },
  { key: "process", href: "/#process" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/65 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <img
            src="/KS_mark.png"
            alt="KS. Logo"
            className="h-9 w-auto object-contain md:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-neutral-300 md:flex">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href} className="hover:text-white">
              {t.nav[item.key]}
            </Link>
          ))}
          <Link href="/account" className="hover:text-white">
            {t.nav.account}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle locale={locale} setLocale={setLocale} />
          <Link
            href="/quote"
            className="rounded-full bg-white px-5 py-2.5 text-sm text-black transition hover:bg-neutral-200"
          >
            {t.nav.quote}
          </Link>
        </div>

        <button className="text-white md:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black px-6 py-5 md:hidden">
          <div className="grid gap-4 text-sm text-neutral-300">
            {navItems.map((item) => (
              <Link key={item.key} href={item.href} onClick={() => setOpen(false)}>
                {t.nav[item.key]}
              </Link>
            ))}
            <Link href="/account" onClick={() => setOpen(false)}>
              {t.nav.account}
            </Link>
            <Link href="/quote" onClick={() => setOpen(false)}>
              {t.nav.quote}
            </Link>
            <LanguageToggle locale={locale} setLocale={setLocale} />
          </div>
        </div>
      )}
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
    <div className="flex rounded-full border border-white/15 p-1 text-xs text-neutral-300">
      {(["en", "de"] as const).map((item) => (
        <button
          key={item}
          onClick={() => setLocale(item)}
          className={`rounded-full px-3 py-1 uppercase transition ${
            locale === item ? "bg-white text-black" : "hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
