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
const PRIMARY_ADMIN_EMAIL = "admin@ks-logo.de";

type QuoteStatus = "new" | "in_progress" | "completed";

const quoteStatusOptions: Array<{ value: QuoteStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

function normalizeQuoteStatus(value: unknown): QuoteStatus {
  const status = String(value || "new").toLowerCase();
  if (status === "submitted" || status === "new") return "new";
  if (status === "in_progress") return "in_progress";
  if (status === "completed" || status === "done") return "completed";
  return "new";
}

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
  const [activeTab, setActiveTab] = useState<TabKey>("quotes");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PageResponse<AdminRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openQuoteId, setOpenQuoteId] = useState<number | null>(null);

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

  async function updateQuoteStatus(quoteId: number, nextStatus: QuoteStatus) {
    setNotice(null);
    try {
      await apiFetch(`/admin/quotes/${quoteId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setNotice("Quote status updated.");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to update quote status");
    }
  }

  async function deleteQuote(quoteId: number, quoteNumber: string) {
    const confirmed = window.confirm(
      `Delete completed quote ${quoteNumber}? This cannot be undone.`,
    );
    if (!confirmed) return;
    setNotice(null);
    try {
      await apiFetch(`/admin/quotes/${quoteId}`, { method: "DELETE" });
      setNotice(`Quote ${quoteNumber} deleted.`);
      if (openQuoteId === quoteId) setOpenQuoteId(null);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to delete quote");
    }
  }

  function switchTab(nextTab: TabKey) {
    setActiveTab(nextTab);
    setPage(1);
    setNotice(null);
    setOpenQuoteId(null);
  }

  if (error) {
    return (
      <main className="ls-app-page">
        <div className="ls-app-container ls-panel">
          <div className="eyebrow">LumaSign Admin</div>
          <h1>Access unavailable</h1>
          <p className="ls-muted">{error}</p>
          <Link href="/login" className="button dark">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ls-app-page ls-admin-page">
      <div className="ls-app-container">
        <div className="ls-page-heading">
          <div>
            <div className="eyebrow">LumaSign Europe Admin</div>
            <h1>Quote management</h1>
            <p className="ls-muted ls-heading-copy">
              Review customer requests by quote number, update progress, and remove completed items.
            </p>
          </div>
          <div className="ls-admin-identity">
            {me?.email || "Admin"}
          </div>
        </div>

        {summary && (
          <div className="ls-admin-stats">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchTab(tab.key)}
                className={activeTab === tab.key ? "ls-admin-stat active" : "ls-admin-stat"}
              >
                <div>{tab.label}</div>
                <strong>{summary[tab.summaryKey]}</strong>
              </button>
            ))}
          </div>
        )}

        <section className="ls-panel ls-admin-data">
          <div className="ls-admin-data-heading">
            <div>
              <div className="eyebrow">{activeConfig.label}</div>
              <h2>
                {data ? `${data.total} records` : loading ? "Loading" : "No records"}
              </h2>
            </div>
            {data && (
              <div className="ls-pagination">
                <button
                  type="button"
                  disabled={data.page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="button outline"
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
                  className="button outline"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {notice && (
            <div className="ls-admin-notice">
              {notice}
            </div>
          )}

          {loading ? (
            <div className="ls-admin-empty">Loading data...</div>
          ) : data && data.items.length > 0 ? (
            activeTab === "quotes" ? (
              <div className="ls-quote-list">
                {data.items.map((row, index) => {
                  const quoteId = typeof row.id === "number" ? row.id : null;
                  return (
                    <QuoteListItem
                      key={String(row.id ?? row.quote_number ?? index)}
                      row={row}
                      open={quoteId !== null && openQuoteId === quoteId}
                      onToggle={() => {
                        if (quoteId === null) return;
                        setOpenQuoteId((current) => (current === quoteId ? null : quoteId));
                      }}
                      onStatusChange={updateQuoteStatus}
                      onDelete={deleteQuote}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="ls-card-grid">
                {data.items.map((row, index) => (
                  <RecordCard
                    key={String(row.id ?? row.quote_number ?? index)}
                    row={row}
                    recordType={activeTab}
                    columns={activeConfig.columns}
                    canManageAdmins={canManageAdmins}
                    showAdminActions={activeTab === "users"}
                    onSetAdminRole={setAdminRole}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="ls-admin-empty">No data yet.</div>
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
  recordType: TabKey;
  columns: Column[];
  canManageAdmins: boolean;
  showAdminActions: boolean;
  onSetAdminRole: (userId: number, isAdmin: boolean) => void;
}) {
  const userId = typeof row.id === "number" ? row.id : null;
  const isAdmin = row.is_admin === true;
  const isPrimaryAdmin = String(row.email || "").toLowerCase() === PRIMARY_ADMIN_EMAIL;

  return (
    <article className="ls-admin-record">
      <div className="ls-admin-field-grid">
        {columns.map((column) => (
          <div key={column.key} className="ls-admin-field">
            <div>{column.label}</div>
            <strong>
              {column.render ? column.render(row) : formatValue(getValue(row, column.key))}
            </strong>
          </div>
        ))}
      </div>

      {showAdminActions && userId && (
        <div className="ls-admin-actions">
          <button
            type="button"
            disabled={!canManageAdmins || isAdmin}
            onClick={() => onSetAdminRole(userId, true)}
            className="button primary"
          >
            Set admin
          </button>
          <button
            type="button"
            disabled={!canManageAdmins || !isAdmin || isPrimaryAdmin}
            onClick={() => onSetAdminRole(userId, false)}
            className="button outline"
          >
            Remove admin
          </button>
          {!canManageAdmins && (
            <span className="ls-muted">
              Only {PRIMARY_ADMIN_EMAIL} can change admin roles.
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function QuoteListItem({
  row,
  open,
  onToggle,
  onStatusChange,
  onDelete,
}: {
  row: AdminRecord;
  open: boolean;
  onToggle: () => void;
  onStatusChange: (quoteId: number, status: QuoteStatus) => void;
  onDelete: (quoteId: number, quoteNumber: string) => void;
}) {
  const quoteId = typeof row.id === "number" ? row.id : null;
  const quoteNumber = String(row.quote_number || "—");
  const status = normalizeQuoteStatus(row.status);
  const delivery = toRecord(toRecord(row.form_payload).delivery);
  const contact = delivery.contact || getValue(toRecord(row.user), "email") || "—";

  return (
    <article className={open ? "ls-quote-list-item open" : "ls-quote-list-item"}>
      <div className="ls-quote-list-row">
        <button type="button" className="ls-quote-list-main" onClick={onToggle}>
          <strong>{quoteNumber}</strong>
          <span className={`ls-status-pill ls-status-${status}`}>
            {quoteStatusOptions.find((option) => option.value === status)?.label || "New"}
          </span>
          <span className="ls-muted">{formatValue(row.created_at)}</span>
          <span className="ls-muted ls-quote-list-contact">{formatValue(contact)}</span>
          <span className="ls-quote-list-toggle">{open ? "Hide" : "Open"}</span>
        </button>
        <div className="ls-quote-list-controls" onClick={(event) => event.stopPropagation()}>
          <label>
            Status
            <select
              value={status}
              disabled={quoteId === null}
              onChange={(event) => {
                if (quoteId === null) return;
                onStatusChange(quoteId, event.target.value as QuoteStatus);
              }}
            >
              {quoteStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {status === "completed" && quoteId !== null && (
            <button
              type="button"
              className="button outline"
              onClick={() => onDelete(quoteId, quoteNumber)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {open && <QuoteRequestDetails row={row} />}
    </article>
  );
}

function QuoteRequestDetails({ row }: { row: AdminRecord }) {
  const payload = toRecord(row.form_payload);
  const user = toRecord(row.user);
  const dimensions = toRecord(payload.dimensions);
  const materials = toRecord(payload.materials);
  const product = toRecord(payload.product);
  const design = toRecord(payload.design);
  const lighting = toRecord(payload.lighting);
  const installation = toRecord(payload.installation);
  const delivery = toRecord(payload.delivery);
  const files = Array.isArray(row.files) ? row.files.filter(isRecord) : [];

  const sections = [
    {
      title: "Customer",
      fields: [
        detail("Email", getValue(user, "email")),
        detail("Company", getValue(user, "company_name")),
        detail("Contact", getValue(user, "contact_name")),
        detail("Delivery company", delivery.company),
        detail("Delivery contact", delivery.contact),
        detail("Language", row.locale),
        detail("Submitted", row.created_at),
      ],
    },
    {
      title: "Project",
      fields: [
        detail("Quote number", row.quote_number),
        detail(
          "Product family",
          labelValue(product.family ?? payload.applicationType ?? row.project_type),
        ),
        detail("Variant", labelValue(product.variant)),
        detail("Usage", labelValue(product.usage ?? installation.scene)),
        detail("Status", labelValue(normalizeQuoteStatus(row.status))),
        detail("Indicative starting price", row.indicative_price_label),
      ],
    },
    {
      title: "Size and quantity",
      fields: [
        detail(
          "Requested width",
          formatRequestedMeasurement(dimensions.widthValue, dimensions.unit),
        ),
        detail("Width", formatMeasurement(dimensions.widthMm)),
        detail("Height", formatMeasurement(dimensions.heightMm)),
        detail("Depth", formatMeasurement(dimensions.depthMm)),
        detail("Quantity", payload.quantity),
      ],
    },
    {
      title: "Materials",
      fields: [
        detail("Pricing material", labelValue(payload.material)),
        detail("Logo body material", labelValue(materials.mainMaterial)),
        detail("Edge / side material", labelValue(materials.edgeMaterial)),
        detail("Front cover material", labelValue(materials.frontCoverMaterial)),
      ],
    },
    {
      title: "Lighting",
      fields: [
        detail("Lighting type", labelValue(lighting.type ?? payload.lightingType)),
        detail("Light colour", labelValue(lighting.color)),
        detail("Color temperature", lighting.colorTemperature ?? payload.colorTemperature),
        detail("Brightness", labelValue(lighting.brightness ?? payload.brightness)),
      ],
    },
    {
      title: "Installation",
      fields: [
        detail("Installation needed", formatBoolean(installation.needed)),
        detail("Installation service", labelValue(installation.service)),
        detail("Installation scene", labelValue(installation.scene)),
        detail("Installation method", labelValue(installation.method)),
      ],
    },
    {
      title: "Design and notes",
      fields: [
        detail("Preferred font / style", design.style),
        detail("Deadline", payload.deadline),
        detail("Reference URL", payload.referenceUrl),
        detail("Customer notes", row.customer_notes),
      ],
    },
    {
      title: "Delivery",
      fields: [
        detail("Country", delivery.country ?? installation.country),
        detail("City / postcode", delivery.cityPostal ?? installation.city),
        detail("Postal code", installation.postalCode),
      ],
    },
  ];

  return (
    <div className="ls-admin-quote-details">
      <div className="eyebrow">Quote request details</div>
      <div className="ls-admin-detail-grid">
        {sections.map((section) => (
          <section key={section.title} className="ls-admin-detail-section">
            <h3>{section.title}</h3>
            <div className="ls-admin-detail-fields">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </div>
          </section>
        ))}
        <section className="ls-admin-detail-section ls-admin-files-section">
          <h3>Uploaded files</h3>
          {files.length > 0 ? (
            <div className="ls-admin-files">
              {files.map((file) => (
                <div key={String(file.id ?? file.original_name)}>
                  {typeof row.id === "number" && typeof file.file_name === "string" ? (
                    <a
                      className="ls-inline-link"
                      href={`/uploads/${row.id}/${encodeURIComponent(file.file_name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formatValue(file.original_name)}
                    </a>
                  ) : (
                    <strong>{formatValue(file.original_name)}</strong>
                  )}
                  <span>
                    {formatValue(file.mime_type)} · {formatFileSize(file.file_size)}
                  </span>
                  <span>Uploaded: {formatValue(file.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ls-muted">No files uploaded.</div>
          )}
        </section>
      </div>
    </div>
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

function detail(label: string, value: unknown): { label: string; value: ReactNode } {
  return { label, value: formatValue(value) };
}

function isRecord(value: unknown): value is AdminRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toRecord(value: unknown): AdminRecord {
  return isRecord(value) ? value : {};
}

const readableValues: Record<string, string> = {
  non_illuminated_logo: "Non-illuminated logo",
  illuminated_logo: "Illuminated logo",
  lightbox: "Lightbox",
  side_mounted_logo: "Side-mounted logo",
  letters: "Letters",
  lightboxes: "Lightboxes",
  neon: "LED Neon",
  infinity_mirror: "Infinity Mirror",
  custom_concept: "Custom concept",
  front_lit: "Front-lit",
  back_lit: "Back-lit",
  painted_wood: "Painted wood",
  acrylic: "Acrylic",
  aluminium_composite: "Aluminium composite panel",
  stainless_steel: "Stainless steel",
  textile: "Fabric / textile",
  backlit: "Backlit",
  frontlit: "Frontlit",
  side_lit: "Side lit",
  full_lit: "Fully illuminated",
  non_lit: "Non-illuminated",
  fabric_lightbox: "Fabric lightbox",
  retail_column: "Retail column",
  store_concept: "Store concept",
  modular_cubes: "Modular cubes",
  event_display: "Event display",
  character_neon: "Character neon",
  colour_lettering: "Colour lettering",
  brand_logo_neon: "Brand logo neon",
  text_mirror_box: "Text mirror box",
  experience_installation: "Experience installation",
  tunnel_wall: "Tunnel wall",
  facade_concept: "Facade concept",
  pylon_landmark: "Pylon & wayfinding",
  exhibition_event: "Exhibition & event",
  interior_branding: "Interior branding",
  special_build: "Special build",
  low: "Low",
  medium: "Medium",
  high: "High",
  indoor: "Indoor installation",
  outdoor: "Outdoor installation",
  both: "Indoor & outdoor",
  warm_white: "Warm white",
  neutral_white: "Neutral white",
  cool_white: "Cool white",
  rgb: "RGB / colour changing",
  unlit: "Unlit",
  open: "Not decided",
  preassembled_rail: "Preassembled on panel / rail",
  direct_wall: "Directly on wall / facade",
  projecting_double_sided: "Projecting / double-sided",
  freestanding_special: "Freestanding / special build",
  needed: "Installation by LumaSign",
  not_needed: "No installation required",
  new: "New",
  in_progress: "In progress",
  completed: "Completed",
  submitted: "New",
  individual_letters: "Individual letters mounted separately",
  letters_on_metal_beam: "Letters mounted on a support bar",
  logo_backboard: "Logo mounted on a back panel",
  metal_rod_support: "Metal rod support installation",
  wall_mounted_side_logo: "Full side sign mounted against the wall",
};

function labelValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return readableValues[value] || value;
}

function formatBoolean(value: unknown): unknown {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return value;
}

function formatMeasurement(value: unknown): unknown {
  if (value === null || value === undefined || value === "") return value;
  return `${value} mm`;
}

function formatRequestedMeasurement(value: unknown, unit: unknown): unknown {
  if (value === null || value === undefined || value === "") return null;
  return `${value} ${typeof unit === "string" && unit ? unit : ""}`.trim();
}

function formatFileSize(value: unknown): string {
  if (typeof value !== "number") return "Unknown size";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
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
