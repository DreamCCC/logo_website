"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

type Quote = {
  id: number;
  quote_number: string;
  status: string;
  project_type: string | null;
  indicative_price_label: string | null;
  created_at: string;
};

type User = {
  email: string;
  company_name: string | null;
  contact_name: string | null;
  is_admin: boolean;
};

export default function AccountPage() {
  const { t } = useLanguage();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 pt-32 text-white">
        <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-neutral-950 p-8">
          <h1 className="text-3xl font-light">{t.nav.login}</h1>
          <p className="mt-4 text-neutral-400">{error}</p>
          <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-black">
            {t.nav.login}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 pt-32 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 text-sm uppercase tracking-[0.25em] text-neutral-500">
              {user?.email || "Account"}
            </div>
            <h1 className="text-4xl font-light">{t.account.title}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {user?.is_admin && (
              <Link href="/admin" className="rounded-2xl border border-white/15 px-5 py-3 text-sm text-white">
                Admin
              </Link>
            )}
            <Link href="/quote" className="rounded-2xl bg-white px-5 py-3 text-sm text-black">
              {t.nav.quote}
            </Link>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-neutral-950 p-8 text-neutral-400">
            {t.account.empty}
          </div>
        ) : (
          <div className="grid gap-4">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="rounded-[28px] border border-white/10 bg-neutral-950 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-neutral-500">{quote.quote_number}</div>
                    <div className="mt-2 text-2xl font-light">
                      {quote.project_type || "Logo request"}
                    </div>
                    <div className="mt-3 text-sm text-neutral-400">
                      {t.account.created}: {new Date(quote.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-300">
                      {t.account.status}: {quote.status}
                    </div>
                    <div className="mt-4 text-xl font-light">{quote.indicative_price_label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
