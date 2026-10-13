import type { ReactNode } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

export const inputClass = (invalid?: boolean) =>
  cn(
    "w-full min-w-0 rounded-[6px] border bg-surface px-3 text-[16px] text-ink transition-colors",
    "hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-60",
    invalid ? "border-[color:var(--st-danger-fg)]" : "border-line",
  );

/** Label above, control, helper below, error below helper. Ids follow `${id}-help` / `${id}-error`. */
export function Field({
  id,
  label,
  optional,
  helper,
  error,
  children,
  className,
  aside,
}: {
  id: string;
  label: string;
  optional?: boolean;
  helper?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] leading-[18px] font-medium text-ink">
          {label}
          {optional && <span className="font-normal text-muted"> (optional)</span>}
        </label>
        {aside}
      </div>
      {children}
      {helper && (
        <p id={`${id}-help`} className="-mt-0.5 text-[13px] leading-[18px] text-muted">
          {helper}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="-mt-0.5 flex items-start gap-1.5 text-[13px] leading-[18px] text-[color:var(--st-danger-fg)]"
    >
      <WarningCircleIcon size={15} weight="bold" aria-hidden className="mt-px shrink-0" />
      {children}
    </p>
  );
}

export function describedBy(id: string, helper: boolean, error: boolean) {
  return [helper && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}
