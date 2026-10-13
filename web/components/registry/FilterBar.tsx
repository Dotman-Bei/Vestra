"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import type { AssetStatus } from "@/lib/types";
import { ASSET_STATUSES } from "@/lib/types";
import { normalizeAssetId, STATUS_LABEL } from "@/lib/format";
import { toSearchString, type RegistryQuery } from "@/lib/registry";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { useRegistryPending } from "./RegistryPending";

const FULL_ID = /^\s*vst-?\s*\d{4,}\s*$/i;

export function FilterBar({ query, categories }: { query: RegistryQuery; categories: string[] }) {
  const router = useRouter();
  const id = useId();
  const { pending, start } = useRegistryPending();
  const [q, setQ] = useState(query.q);
  // Follow the URL when it changes from elsewhere (e.g. "Clear filters"), without fighting the user's typing.
  const [urlQ, setUrlQ] = useState(query.q);
  if (query.q !== urlQ) {
    setUrlQ(query.q);
    if (query.q !== q.trim()) setQ(query.q);
  }
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(debounce.current), []);

  function go(next: Partial<RegistryQuery>) {
    const merged = { ...query, q, ...next, show: undefined };
    start(() => router.replace(`/assets${toSearchString(merged)}`, { scroll: false }));
  }

  function toggleStatus(s: AssetStatus) {
    const statuses = query.statuses.includes(s) ? query.statuses.filter((x) => x !== s) : [...query.statuses, s];
    go({ statuses });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <form
          role="search"
          className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-[440px]"
          onSubmit={(e) => {
            e.preventDefault();
            clearTimeout(debounce.current);
            // A complete asset ID goes straight to its passport.
            if (FULL_ID.test(q)) {
              const assetId = normalizeAssetId(q.replace(/\s+/g, ""));
              if (assetId) return router.push(`/assets/${assetId}`);
            }
            go({ q });
          }}
        >
          <label htmlFor={`${id}-q`} className="text-[13px] leading-[18px] font-medium text-ink">
            Search by name, asset ID or serial
          </label>
          <div className="relative">
            <MagnifyingGlassIcon size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input
              id={`${id}-q`}
              type="search"
              value={q}
              onChange={(e) => {
                const value = e.target.value;
                setQ(value);
                clearTimeout(debounce.current);
                debounce.current = setTimeout(() => go({ q: value.trim() }), 250);
              }}
              autoComplete="off"
              spellCheck={false}
              className={inputClass() + " h-11 pl-10 [&::-webkit-search-cancel-button]:hidden"}
            />
          </div>
        </form>

        <div className="flex flex-col gap-2 sm:w-[220px]">
          <label htmlFor={`${id}-cat`} className="text-[13px] leading-[18px] font-medium text-ink">
            Category
          </label>
          <div className="relative">
            <select
              id={`${id}-cat`}
              value={query.category}
              onChange={(e) => go({ category: e.target.value })}
              className={inputClass() + " h-11 appearance-none pr-9"}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <CaretDownIcon size={14} aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          role="group"
          aria-label="Filter by status"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {ASSET_STATUSES.map((s) => {
            const on = query.statuses.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => toggleStatus(s)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-[6px] border px-3 text-[14px] whitespace-nowrap transition-colors",
                  on ? "border-accent bg-accent-wash font-medium text-ink" : "border-line bg-surface text-ink hover:border-line-strong",
                )}
              >
                {STATUS_LABEL[s]}
              </button>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {pending ? "Updating results" : ""}
      </p>
    </div>
  );
}
