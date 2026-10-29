import { cn } from "@/lib/utils";

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
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[#8fa0b5]">{description}</p>
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
    <div className="rounded-lg border border-dashed border-white/15 px-6 py-14 text-center">
      <p className="text-base font-medium text-white">{title}</p>
      <p className="mt-2 text-sm text-[#8fa0b5]">{description}</p>
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
    neutral: "bg-white/10 text-[#c5d0de]",
    ok: "bg-emerald-500/15 text-emerald-300",
    warn: "bg-amber-500/15 text-amber-200",
    danger: "bg-rose-500/15 text-rose-300",
    info: "bg-sky-500/15 text-sky-200",
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
      <span className="mb-1.5 block text-[#8fa0b5]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-white/10 bg-[#121a24] px-3 py-2 text-sm text-white outline-none ring-sky-500/40 placeholder:text-[#5c6b7d] focus:ring-2"
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
      <span className="mb-1.5 block text-[#8fa0b5]">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-white/10 bg-[#121a24] px-3 py-2 text-sm text-white outline-none ring-sky-500/40 focus:ring-2"
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  type = "submit",
  formAction,
}: {
  children: React.ReactNode;
  type?: "submit" | "button";
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <button
      type={type}
      formAction={formAction}
      className="inline-flex items-center justify-center rounded-md bg-[#2d5a87] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3a6fa3]"
    >
      {children}
    </button>
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
      className="inline-flex items-center justify-center rounded-md border border-white/15 px-4 py-2 text-sm text-[#c5d0de] transition hover:bg-white/5"
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
        "rounded-lg border border-white/10 bg-[#121a24]/70 p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
