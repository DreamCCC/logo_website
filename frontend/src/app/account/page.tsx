"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";
import { products, type ProductFamily } from "@/lib/lumasign-content";

type Quote = {
  id: number;
  quote_number: string;
  status: string;
  project_type: string | null;
  indicative_price_label: string | null;
  created_at: string;
  form_payload: Record<string, unknown> | null;
};

type User = {
  email: string;
  company_name: string | null;
  contact_name: string | null;
  is_admin: boolean;
};

export default function AccountPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [me, myQuotes] = await Promise.all([
          apiFetch<User>("/auth/me"),
          apiFetch<Quote[]>("/quotes/my"),
        ]);
        setUser(me);
        setQuotes(myQuotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Not authenticated");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function logout() {
    await apiFetch<void>("/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="ls-app-page">
        <div className="ls-app-container ls-panel ls-empty-state">{t.quote.submitting}</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="ls-app-page">
        <div className="ls-app-container ls-panel">
          <p className="eyebrow">LumaSign Europe</p>
          <h1>{t.nav.login}</h1>
          <p className="ls-muted">{t.account.signInRequired}</p>
          <Link href="/login" className="button dark">
            {t.nav.login}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ls-app-page">
      <div className="ls-app-container">
        <div className="ls-page-heading">
          <div>
            <div className="eyebrow">{user?.email || "LumaSign Europe"}</div>
            <h1>{t.account.title}</h1>
          </div>
          <div className="ls-account-actions">
            {user?.is_admin && (
              <Link href="/admin" className="button outline">
                {t.nav.admin}
              </Link>
            )}
            <button type="button" className="button outline" onClick={() => void logout()}>
              {t.auth.logout}
            </button>
            <Link href="/quote" className="button primary">
              {t.account.newQuote}
            </Link>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="ls-panel ls-empty-state">
            {t.account.empty}
          </div>
        ) : (
          <div className="ls-card-grid">
            {quotes.map((quote) => (
              <article key={quote.id} className="ls-quote-card">
                <div>
                  <div className="eyebrow">{quote.quote_number}</div>
                  <h2>{productLabel(quote.project_type, locale)}</h2>
                  <div className="ls-muted">
                    {t.account.created}:{" "}
                    {new Date(quote.created_at).toLocaleDateString(
                      locale === "de" ? "de-DE" : "en-GB",
                    )}
                  </div>
                  <div className="ls-quote-variant">
                    {quoteVariant(quote.form_payload, locale)}
                  </div>
                </div>
                <div className="ls-quote-card-side">
                  <div className="ls-status-pill">
                    {t.account.status}: {statusLabel(quote.status, locale)}
                  </div>
                  <div className="ls-account-price">
                    <span>{t.quote.indicative}</span>
                    <strong>{quote.indicative_price_label || "—"}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function productLabel(projectType: string | null, locale: "en" | "de"): string {
  const product = products.find((item) => item.id === projectType);
  if (product) return product.label[locale];
  const legacy: Record<string, { de: string; en: string }> = {
    non_illuminated_logo: { de: "Nicht beleuchtetes Logo", en: "Non-illuminated logo" },
    illuminated_logo: { de: "Beleuchtetes Logo", en: "Illuminated logo" },
    lightbox: { de: "Leuchtkasten", en: "Lightbox" },
    side_mounted_logo: { de: "Seitlich montiertes Logo", en: "Side-mounted logo" },
  };
  return projectType && legacy[projectType]
    ? legacy[projectType][locale]
    : locale === "de"
      ? "Logo-Anfrage"
      : "Logo request";
}

function quoteVariant(payload: Record<string, unknown> | null, locale: "en" | "de"): string {
  const product = payload?.product;
  if (!product || typeof product !== "object") return "";
  const family = (product as Record<string, unknown>).family;
  const variant = (product as Record<string, unknown>).variant;
  if (typeof family !== "string" || typeof variant !== "string") return "";
  const definition = products.find((item) => item.id === (family as ProductFamily));
  return definition?.variants.find((item) => item.value === variant)?.label[locale] || variant;
}

function statusLabel(status: string, locale: "en" | "de"): string {
  const values: Record<string, { de: string; en: string }> = {
    submitted: { de: "Eingereicht", en: "Submitted" },
    reviewing: { de: "In Prüfung", en: "Reviewing" },
    quoted: { de: "Angebot erstellt", en: "Quoted" },
    closed: { de: "Abgeschlossen", en: "Closed" },
  };
  return values[status]?.[locale] || status;
}
