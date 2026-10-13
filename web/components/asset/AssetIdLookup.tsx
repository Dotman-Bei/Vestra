"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { normalizeAssetId } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** Asset ID field that routes to the public verification page. */
export function AssetIdLookup({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setError("Enter the asset ID printed on the tag.");
      return;
    }
    const assetId = normalizeAssetId(value);
    if (!assetId) {
      setError("That isn't a Vestra asset ID. IDs look like VST-0007.");
      return;
    }
    setError(null);
    router.push(`/verify/${assetId}`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("max-w-[480px]", className)}>
      <label htmlFor={`${id}-input`} className="block text-[13px] leading-[18px] font-medium text-ink">
        Asset ID
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={`${id}-input`}
          name="assetId"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
          className={cn(
            "h-12 w-full min-w-0 rounded-[6px] border bg-surface px-3.5 font-mono text-[16px] text-ink uppercase",
            "transition-colors placeholder:normal-case hover:border-line-strong focus:border-accent focus:outline-none focus-visible:outline-none",
            "focus:ring-2 focus:ring-accent/25",
            error ? "border-[color:var(--st-danger-fg)]" : "border-line",
          )}
        />
        <button type="submit" className={buttonClass("primary", "lg", "sm:w-auto")}>
          Verify
        </button>
      </div>
      <p id={`${id}-help`} className="mt-2 text-[13px] leading-[18px] text-muted">
        Printed under the QR tag, starts with VST-
      </p>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-[13px] leading-[18px] text-[color:var(--st-danger-fg)]"
        >
          <WarningCircleIcon size={15} weight="bold" aria-hidden />
          {error}
        </p>
      )}
    </form>
  );
}
