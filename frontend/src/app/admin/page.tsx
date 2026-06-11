"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type AdminRecord = Record<string, unknown>;
type PageResponse<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};
type AdminUser = {
  id: number;
  email: string;
  is_admin: boolean;
};
type Summary = {
  users: number;
  admins: number;
  quotes: number;
  quote_files: number;
  products: number;
  gallery_items: number;
  starting_price_rules: number;
};
type TabKey =
  | "users"
  | "quotes"
  | "quote-files"
  | "products"
  | "gallery-items"
  | "starting-price-rules";
type Column = {
  key: string;
  label: string;
  render?: (row: AdminRecord) => ReactNode;
};
type TabConfig = {
  key: TabKey;
  label: string;
  summaryKey: keyof Summary;
  columns: Column[];
};

const PAGE_SIZE = 10;
const PRIMARY_ADMIN_EMAIL = "admin@ks-logo.local";

const tabs: TabConfig[] = [
  {
    key: "users",
    label: "Users",
    summaryKey: "users",
    columns: [
      { key: "id", label: "ID" },
      { key: "email", label: "Email" },
      { key: "company_name", label: "Company" },
      { key: "contact_name", label: "Contact" },
      { key: "phone", label: "Phone" },
      { key: "preferred_locale", label: "Locale" },
      { key: "is_admin", label: "Admin" },
      { key: "created_at", label: "Created" },
      { key: "last_login_at", label: "Last Login" },
    ],
  },
  {
    key: "quotes",
    label: "Quotes",
    summaryKey: "quotes",
    columns: [
      { key: "quote_number", label: "Quote No." },
      { key: "user.email", label: "User" },
      { key: "project_type", label: "Project" },
      { key: "status", label: "Status" },
      { key: "indicative_price_label", label: "Starting Price" },
      {
        key: "files",
        label: "Files",
        render: (row) => (Array.isArray(row.files) ? row.files.length : 0),
      },
      { key: "created_at", label: "Created" },
    ],
  },
  {
    key: "quote-files",
    label: "Quote Files",
    summaryKey: "quote_files",
    columns: [
      { key: "id", label: "ID" },
      { key: "quote_id", label: "Quote ID" },
      { key: "original_name", label: "Original Name" },
      { key: "mime_type", label: "Type" },
      { key: "file_size", label: "Size" },
      { key: "file_role", label: "Role" },
      { key: "created_at", label: "Created" },
    ],
  },
  {
    key: "products",
    label: "Products",
    summaryKey: "products",
    columns: [
      { key: "id", label: "ID" },
      { key: "slug", label: "Slug" },
      { key: "name_de", label: "Name DE" },
      { key: "category", label: "Category" },
      { key: "material", label: "Material" },
      { key: "base_price", label: "Base Price" },
      { key: "active", label: "Active" },
    ],
  },
  {
    key: "gallery-items",
    label: "Gallery",
    summaryKey: "gallery_items",
    columns: [
      { key: "id", label: "ID" },
      { key: "title_de", label: "Title DE" },
      { key: "category", label: "Category" },
      { key: "published", label: "Published" },
      { key: "sort_order", label: "Sort" },
      { key: "created_at", label: "Created" },
    ],
  },
  {
    key: "starting-price-rules",
    label: "Price Rules",
    summaryKey: "starting_price_rules",
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "project_type", label: "Project" },
      { key: "material", label: "Material" },
      { key: "starting_price", label: "Starting Price" },
      { key: "currency", label: "Currency" },
      { key: "active", label: "Active" },
    ],
  },
];

export default function AdminPage() {
  const [me, setMe] = useState<AdminUser | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("users");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PageResponse<AdminRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const activeConfig = useMemo(
    () => tabs.find((tab) => tab.key === activeTab) || tabs[0],
    [activeTab],
  );
  const canManageAdmins = me?.email.toLowerCase() === PRIMARY_ADMIN_EMAIL;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [currentUser, summaryData, pageData] = await Promise.all([
          apiFetch<AdminUser>("/auth/me"),
          apiFetch<Summary>("/admin/summary"),
          apiFetch<PageResponse<AdminRecord>>(
            `/admin/${activeConfig.key}?page=${page}&page_size=${PAGE_SIZE}`,
          ),
        ]);
        if (!currentUser.is_admin) {
          throw new Error("Admin access required");
        }
        setMe(currentUser);
        setSummary(summaryData);
        setData(pageData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [activeConfig.key, page, refreshKey]);

  async function setAdminRole(userId: number, isAdmin: boolean) {
    setNotice(null);
    try {
      await apiFetch(`/admin/users/${userId}/admin`, {
        method: "PATCH",
        body: JSON.stringify({ is_admin: isAdmin }),
      });
      setNotice("Admin role updated.");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to update admin role");
    }
  }

  function switchTab(nextTab: TabKey) {
    setActiveTab(nextTab);
    setPage(1);
    setNotice(null);
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 pt-32 text-white">
        <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-neutral-950 p-8">
          <div className="mb-3 text-sm uppercase tracking-[0.25em] text-neutral-500">Admin</div>
          <h1 className="text-4xl font-light">Access unavailable</h1>
          <p className="mt-4 text-neutral-400">{error}</p>
          <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-black">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 text-sm uppercase tracking-[0.25em] text-neutral-500">
              KS. Logo Admin
            </div>
            <h1 className="text-5xl font-light">Database dashboard</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
              View registered users, quote requests, uploaded file metadata and configurable content
              with paginated queries.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-950 px-5 py-3 text-sm text-neutral-300">
            {me?.email || "Admin"}
          </div>
        </div>

        {summary && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchTab(tab.key)}
                className={`rounded-[28px] border p-5 text-left transition ${
                  activeTab === tab.key
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-neutral-950 text-white hover:border-white/30"
                }`}
              >
                <div className="text-xs uppercase tracking-[0.2em] opacity-60">{tab.label}</div>
                <div className="mt-3 text-3xl font-light">{summary[tab.summaryKey]}</div>
              </button>
            ))}
          </div>
        )}

        <section className="rounded-[32px] border border-white/10 bg-neutral-950 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                {activeConfig.label}
              </div>
              <h2 className="mt-2 text-3xl font-light">
                {data ? `${data.total} records` : loading ? "Loading" : "No records"}
              </h2>
            </div>
            {data && (
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <button
                  type="button"
                  disabled={data.page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="rounded-2xl border border-white/15 px-4 py-2 disabled:opacity-40"
                >
                  Previous
                </button>
                <span>
                  Page {data.page} / {data.pages}
                </span>
                <button
                  type="button"
                  disabled={data.page >= data.pages}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-2xl border border-white/15 px-4 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {notice && (
            <div className="mb-5 rounded-2xl bg-white/10 px-4 py-3 text-sm text-neutral-200">
              {notice}
            </div>
          )}

          {loading ? (
            <div className="rounded-[24px] bg-black/40 p-6 text-neutral-400">Loading data...</div>
          ) : data && data.items.length > 0 ? (
            <div className="grid gap-4">
              {data.items.map((row, index) => (
                <RecordCard
                  key={String(row.id ?? row.quote_number ?? index)}
                  row={row}
                  columns={activeConfig.columns}
                  canManageAdmins={canManageAdmins}
                  showAdminActions={activeTab === "users"}
                  onSetAdminRole={setAdminRole}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-black/40 p-6 text-neutral-400">No data yet.</div>
          )}
        </section>
      </div>
    </main>
  );
}

function RecordCard({
  row,
  columns,
  canManageAdmins,
  showAdminActions,
  onSetAdminRole,
}: {
  row: AdminRecord;
  columns: Column[];
  canManageAdmins: boolean;
  showAdminActions: boolean;
  onSetAdminRole: (userId: number, isAdmin: boolean) => void;
}) {
  const userId = typeof row.id === "number" ? row.id : null;
  const isAdmin = row.is_admin === true;
  const isPrimaryAdmin = String(row.email || "").toLowerCase() === PRIMARY_ADMIN_EMAIL;

  return (
    <article className="rounded-[28px] border border-white/10 bg-black/35 p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => (
          <div key={column.key} className="rounded-2xl bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-neutral-500">{column.label}</div>
            <div className="mt-2 break-words text-sm text-neutral-100">
              {column.render ? column.render(row) : formatValue(getValue(row, column.key))}
            </div>
          </div>
        ))}
      </div>

      {showAdminActions && userId && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!canManageAdmins || isAdmin}
            onClick={() => onSetAdminRole(userId, true)}
            className="rounded-2xl bg-white px-4 py-2 text-sm text-black disabled:opacity-40"
          >
            Set admin
          </button>
          <button
            type="button"
            disabled={!canManageAdmins || !isAdmin || isPrimaryAdmin}
            onClick={() => onSetAdminRole(userId, false)}
            className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            Remove admin
          </button>
          {!canManageAdmins && (
            <span className="text-sm text-neutral-500">
              Only {PRIMARY_ADMIN_EMAIL} can change admin roles.
            </span>
          )}
        </div>
      )}

      <details className="mt-4 rounded-2xl border border-white/10 bg-neutral-950 p-4">
        <summary className="cursor-pointer text-sm text-neutral-300">Full record JSON</summary>
        <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap text-xs leading-5 text-neutral-300">
          {JSON.stringify(row, null, 2)}
        </pre>
      </details>
    </article>
  );
}

function getValue(row: AdminRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as AdminRecord)[key];
    }
    return null;
  }, row);
}

function formatValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "string") {
    const date = Date.parse(value);
    if (!Number.isNaN(date) && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value).toLocaleString();
    }
    return value;
  }
  return JSON.stringify(value);
}
