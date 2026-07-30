"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "./LanguageProvider";

type AuthMode = "login" | "register";
type AuthResponse = {
  user: {
    is_admin: boolean;
  };
};

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
      const response = await apiFetch<AuthResponse>(mode === "login" ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: JSON.stringify(
          mode === "register" ? { ...payload, preferred_locale: locale } : payload,
        ),
      });
      router.push(response.user.is_admin ? "/admin" : mode === "login" ? "/account" : "/quote");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ls-auth-page">
      <div className="ls-auth-card">
        <div>
          <div className="eyebrow">LumaSign Europe</div>
          <h1>
            {mode === "login" ? t.auth.login : t.auth.register}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Input label={t.auth.email} name="email" type="email" required />
          <Input
            label={t.auth.password}
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
          />
          {mode === "register" && (
            <>
              <Input label={t.auth.company} name="company_name" />
              <Input label={t.auth.contact} name="contact_name" />
              <Input label={t.auth.phone} name="phone" />
            </>
          )}

          {error && <div className="ls-form-error">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="button primary"
          >
            {loading ? "..." : mode === "login" ? t.auth.login : t.auth.register}
          </button>
        </form>

        <div className="mt-6 text-sm ls-muted">
          {mode === "login" ? t.auth.noAccount : t.auth.hasAccount}{" "}
          <Link className="ls-inline-link" href={mode === "login" ? "/register" : "/login"}>
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
    <label>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
      />
    </label>
  );
}
