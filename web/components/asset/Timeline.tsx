"use client";

import { useId, useMemo, useState } from "react";
import { CaretDownIcon, TagIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { Asset, LifecycleRecord, RecordType } from "@/lib/types";
import { formatDateTime, RECORD_LABEL } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "@/components/ui/Field";
import { TimelineEntry } from "./TimelineEntry";
import { AddressChip, TxLink } from "./Chips";

const PAGE = 20;

/** Lifecycle history, newest first, ending with the registration itself. */
export function Timeline({ asset, records }: { asset: Asset; records: LifecycleRecord[] }) {
  const id = useId();
  const [filter, setFilter] = useState<RecordType | "ALL">("ALL");
  const [shown, setShown] = useState(PAGE);

  const types = useMemo(() => [...new Set(records.map((r) => r.type))], [records]);
  const visible = useMemo(
    () => [...records].reverse().filter((r) => filter === "ALL" || r.type === filter),
    [records, filter],
  );
  const page = visible.slice(0, shown);
  const showRegistration = filter === "ALL" && shown >= visible.length;

  return (
    <section aria-labelledby={`${id}-h`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id={`${id}-h`} className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-ink">
          History
        </h2>
        {types.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor={`${id}-f`} className="sr-only">
              Filter by record type
            </label>
            <div className="relative">
              <select
                id={`${id}-f`}
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as RecordType | "ALL");
                  setShown(PAGE);
                }}
                className={inputClass() + " h-10 appearance-none pr-9 text-[14px]"}
              >
                <option value="ALL">All records</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {RECORD_LABEL[t]}
                  </option>
                ))}
              </select>
              <CaretDownIcon size={14} aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
            </div>
          </div>
        )}
      </div>

      {records.length === 0 && (
        <p className="mt-4 text-[15px] leading-6 text-muted">No records yet beyond registration.</p>
      )}

      <ol className="relative mt-6">
        {/* The rail behind the entry icons */}
        <span aria-hidden className="absolute top-4 bottom-4 left-[15.5px] w-px bg-line" />
        {page.map((r, i) => (
          <motion.li
            key={r.index}
            id={`record-${r.index}`}
            className="relative scroll-mt-24 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.03 }}
          >
            <TimelineEntry record={r} detailed />
          </motion.li>
        ))}
        {showRegistration && (
          <li className="relative">
            <div className="grid grid-cols-[32px_1fr] gap-x-3">
              <span className="relative z-[1] flex size-8 items-center justify-center rounded-[6px] bg-ink text-bg">
                <TagIcon size={17} aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <h3 className="text-[15px] leading-8 font-semibold text-ink">Registered</h3>
                  <time className="font-mono text-[12.5px] text-muted">{formatDateTime(asset.registeredAt)}</time>
                </div>
                <p className="mt-0.5 text-[15px] leading-6 text-ink">Passport created on BOT Chain.</p>
                <dl className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] leading-[18px] text-muted">
                  <div className="flex items-center gap-1">
                    <dt>Registrar</dt>
                    <dd>
                      <AddressChip address={asset.registrar} className="[&>span:first-child]:text-[13px]" />
                    </dd>
                  </div>
                  <div className="flex items-center gap-1">
                    <dt>Tx</dt>
                    <dd>
                      <TxLink hash={asset.registeredTx} />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </li>
        )}
        {filter !== "ALL" && visible.length === 0 && (
          <li className="text-[15px] text-muted">No {RECORD_LABEL[filter].toLowerCase()} records.</li>
        )}
      </ol>

      {visible.length > shown && (
        <button type="button" onClick={() => setShown((s) => s + PAGE)} className={buttonClass("secondary", "md", "mt-6")}>
          Show older records
        </button>
      )}
    </section>
  );
}
