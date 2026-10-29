import Link from "next/link";
import { cn } from "@/lib/utils";

const primaryBtnClass =
  "inline-flex items-center justify-center rounded-md bg-dash-btn px-4 py-2 text-sm font-medium text-dash-on-btn transition hover:bg-dash-btn-hover";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-dash-text">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-dash-muted">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-dash-border bg-dash-surface/40 px-6 py-14 text-center">
      <p className="text-base font-medium text-dash-text">{title}</p>
      <p className="mt-2 text-sm text-dash-muted">{description}</p>
    </div>
  );
}

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "ok" | "warn" | "danger" | "info";
}) {
  const tones = {
    neutral:
      "bg-dash-hover text-dash-soft ring-1 ring-dash-border",
    ok: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    warn: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
    danger: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    info: "bg-sky-500/15 text-sky-800 dark:text-sky-200",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {label}
    </span>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-dash-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text outline-none ring-[#2d5a87]/30 placeholder:text-dash-muted2 focus:ring-2"
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-dash-muted">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text outline-none ring-[#2d5a87]/30 focus:ring-2"
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  formAction,
}: {
  children: React.ReactNode;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <button type="submit" formAction={formAction} className={primaryBtnClass}>
      {children}
    </button>
  );
}

/** Lien stylé comme bouton primaire (évite button dans Link). */
export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={primaryBtnClass}>
      {children}
    </Link>
  );
}

export function SecondaryButton({
  children,
  formAction,
}: {
  children: React.ReactNode;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      className="inline-flex items-center justify-center rounded-md border border-dash-border px-4 py-2 text-sm text-dash-soft transition hover:bg-dash-hover"
    >
      {children}
    </button>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dash-border bg-dash-surface p-5 shadow-sm shadow-black/[0.03]",
        className,
      )}
    >
      {children}
    </div>
  );
}
