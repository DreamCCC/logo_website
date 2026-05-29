"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "./LanguageProvider";

type AuthMode = "login" | "register";

export function AuthCard({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      await apiFetch(mode === "login" ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: JSON.stringify(
          mode === "register" ? { ...payload, preferred_locale: locale } : payload,
        ),
      });
      router.push(mode === "login" ? "/account" : "/quote");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 pt-32 text-white">
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-neutral-950 p-8">
        <div className="mb-8">
          <div className="mb-3 text-sm uppercase tracking-[0.25em] text-neutral-500">
            KS. Logo
          </div>
          <h1 className="text-4xl font-light">
            {mode === "login" ? t.auth.login : t.auth.register}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Input label={t.auth.email} name="email" type="email" required />
          <Input label={t.auth.password} name="password" type="password" required minLength={8} />
          {mode === "register" && (
            <>
              <Input label={t.auth.company} name="company_name" />
              <Input label={t.auth.contact} name="contact_name" />
              <Input label={t.auth.phone} name="phone" />
            </>
          )}

          {error && <div className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

          <button
            disabled={loading}
            className="mt-2 rounded-2xl bg-white px-5 py-4 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:opacity-60"
          >
            {loading ? "..." : mode === "login" ? t.auth.login : t.auth.register}
          </button>
        </form>

        <div className="mt-6 text-sm text-neutral-400">
          {mode === "login" ? t.auth.noAccount : t.auth.hasAccount}{" "}
          <Link className="text-white underline" href={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? t.auth.register : t.auth.login}
          </Link>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  name,
  type = "text",
  required = false,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="grid gap-2 text-sm text-neutral-300">
      {label}
      <input
        className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40"
        name={name}
        type={type}
        required={required}
        minLength={minLength}
      />
    </label>
  );
}
