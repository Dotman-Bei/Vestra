"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowsLeftRightIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";
import type { Asset } from "@/lib/types";
import type { DashboardData, DashboardRecord } from "@/lib/data";
import { formatDate, formatDateTime, RECORD_LABEL } from "@/lib/format";
import { allowedRecordTypes, canProposeHandover } from "@/lib/rules";
import { StatusChip } from "@/components/asset/StatusChip";
import { ChainRef, TxLink } from "@/components/asset/Chips";
import { RECORD_ICON } from "@/components/asset/recordIcons";
import { inputClass } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { useTxLog } from "@/components/shell/txLog";
import { cn } from "@/lib/cn";

const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });

export function relative(unixSeconds: number, nowSeconds: number) {
  const diff = unixSeconds - nowSeconds;
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86_400), "day");
}

const rowAction =
  "inline-flex h-9 items-center gap-1.5 rounded-[6px] px-2 text-[14px] font-medium text-accent transition-colors hover:bg-accent-wash";

/* ---------- Asset rows ---------- */

export function AssetRows({
  assets,
  data,
  now,
  showHandover,
  empty,
}: {
  assets: Asset[];
  data: DashboardData;
  now: number;
  showHandover?: boolean;
  empty: ReactNode;
}) {
  if (!assets.length) return <p className="py-6 text-[15px] leading-6 text-muted">{empty}</p>;
  const address = data.address as `0x${string}`;
  return (
    <ul className="divide-y divide-line border-y border-line">
      {assets.map((a) => {
        const canRecord = allowedRecordTypes(a, address, data.roles, []).length > 0;
        const canHand = showHandover && canProposeHandover(a, address, now);
        return (
          <li key={a.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <Link href={`/assets/${a.id}`} className="text-[15px] leading-6 font-semibold text-ink hover:underline underline-offset-4">
                {a.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="font-mono text-[13px] text-muted">{a.id}</span>
                <StatusChip status={a.status} />
                <span className="text-[13px] leading-5 text-muted">
                  {a.lastRecord
                    ? `${RECORD_LABEL[a.lastRecord.type]}, ${formatDate(a.lastRecord.at)}`
                    : `Registered ${formatDate(a.registeredAt)}`}
                </span>
              </div>
            </div>
            {(canRecord || canHand) && (
              <div className="-ml-2 flex shrink-0 gap-1 sm:ml-0">
                {canRecord && (
                  <Link href={`/assets/${a.id}?do=record`} className={rowAction}>
                    <PlusIcon size={15} weight="bold" aria-hidden />
                    Add record
                  </Link>
                )}
                {canHand && (
                  <Link href={`/assets/${a.id}?do=handover`} className={rowAction}>
                    <ArrowsLeftRightIcon size={15} aria-hidden />
                    Propose handover
                  </Link>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Your records ---------- */

export function RecordRows({ records }: { records: DashboardRecord[] }) {
  if (!records.length) {
    return (
      <p className="py-6 text-[15px] leading-6 text-muted">
        No records from this wallet yet. Records you add to any passport appear here.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-line border-y border-line">
      {records.map((r) => {
        const Icon = RECORD_ICON[r.type];
        return (
          <li key={`${r.assetId}-${r.index}`} className="grid grid-cols-[28px_1fr] gap-x-3 py-4">
            <span className="flex size-7 items-center justify-center rounded-[6px] border border-line bg-surface text-ink">
              <Icon size={15} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-[15px] leading-7 text-ink">
                  <span className="font-semibold">{RECORD_LABEL[r.type]}</span>
                  <span className="text-muted"> on </span>
                  <Link href={`/assets/${r.assetId}#record-${r.index}`} className="hover:underline underline-offset-4">
                    {r.assetName}
                  </Link>
                </p>
                <span className="font-mono text-[12.5px] text-muted">{formatDateTime(r.timestamp)}</span>
              </div>
              <p className="line-clamp-1 text-[14px] leading-[22px] text-muted">{r.summary}</p>
              <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
                <span className="font-mono">{r.assetId}</span>
                <span aria-hidden className="px-1">
                  ·
                </span>
                <ChainRef tx={r.tx} block={r.block} />
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Asset picker for service providers ---------- */

export function AssetPicker({
  open,
  onOpenChange,
  assets,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: DashboardData["serviceable"];
}) {
  const id = useId();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? assets.filter((a) => a.id.toLowerCase().includes(n) || a.name.toLowerCase().includes(n)) : assets;
  }, [assets, q]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} variant="dialog" title="Add a record" description="Choose the asset you worked on.">
      <label htmlFor={`${id}-q`} className="text-[13px] leading-[18px] font-medium text-ink">
        Find by name or asset ID
      </label>
      <div className="relative mt-2">
        <MagnifyingGlassIcon size={17} aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
        <input
          id={`${id}-q`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          className={inputClass() + " h-11 pl-9"}
        />
      </div>
      <ul className="mt-4 flex max-h-[50dvh] flex-col gap-1 overflow-y-auto">
        {list.map((a) => (
          <li key={a.id}>
            <Link
              href={`/assets/${a.id}?do=record`}
              className="flex items-center justify-between gap-3 rounded-[6px] px-3 py-2.5 hover:bg-sunk"
            >
              <span className="min-w-0">
                <span className="block truncate text-[15px] leading-6 text-ink">{a.name}</span>
                <span className="block font-mono text-[12.5px] text-muted">{a.id}</span>
              </span>
              <StatusChip status={a.status} />
            </Link>
          </li>
        ))}
        {list.length === 0 && <li className="px-3 py-2.5 text-[14px] text-muted">No assets match.</li>}
      </ul>
    </Sheet>
  );
}

/* ---------- Tabs (segmented on mobile) ---------- */

export function Tabs({ tabs }: { tabs: Array<{ id: string; label: string; count: number; content: ReactNode }> }) {
  const base = useId();
  const [active, setActive] = useState(tabs[0].id);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  function onKey(e: KeyboardEvent, i: number) {
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const j = (next + tabs.length) % tabs.length;
    setActive(tabs[j].id);
    refs.current[j]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Your roles" className="flex gap-1 overflow-x-auto rounded-[10px] bg-sunk p-1 [scrollbar-width:none] sm:inline-flex">
        {tabs.map((t, i) => {
          const on = t.id === current.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${base}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "inline-flex h-9 flex-1 shrink-0 items-center justify-center gap-1.5 rounded-[6px] px-3 text-[14px] whitespace-nowrap transition-colors sm:flex-none",
                on ? "bg-surface font-medium text-ink shadow-[0_1px_2px_rgb(20_23_28/0.08)]" : "text-muted hover:text-ink",
              )}
            >
              {t.label}
              <span className="font-mono text-[12px] text-muted">{t.count}</span>
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${base}-panel-${current.id}`}
        aria-labelledby={`${base}-tab-${current.id}`}
        tabIndex={0}
        className="mt-5 focus-visible:outline-offset-4"
      >
        {current.content}
      </div>
    </div>
  );
}

/* ---------- Recent transactions rail ---------- */

export function RecentTransactions() {
  const log = useTxLog();
  return (
    <section aria-labelledby="tx-h" className="rounded-[10px] border border-line bg-surface p-5">
      <h2 id="tx-h" className="text-[16px] leading-6 font-semibold text-ink">
        Recent transactions
      </h2>
      <p className="text-[13px] leading-[18px] text-muted">Sent from this browser session.</p>
      {log.length === 0 ? (
        <p className="mt-4 text-[14px] leading-5 text-muted">Records, handovers and registrations you send appear here.</p>
      ) : (
        <ol className="mt-4 flex flex-col gap-4">
          {log.map((e) => (
            <li key={e.id} className="grid grid-cols-[18px_1fr] gap-x-2.5">
              {e.status === "pending" ? (
                <span aria-label="Pending" className="mt-0.5 size-[18px] animate-spin rounded-full border-2 border-line-strong border-t-accent motion-reduce:animate-none" />
              ) : e.status === "confirmed" ? (
                <CheckCircleIcon size={18} weight="fill" aria-label="Confirmed" className="mt-0.5 text-accent" />
              ) : (
                <WarningOctagonIcon size={18} weight="fill" aria-label="Failed" className="mt-0.5 text-[color:var(--st-danger-fg)]" />
              )}
              <div className="min-w-0 text-[14px] leading-5">
                <p className="text-ink">
                  {e.label}
                  {e.assetId && (
                    <>
                      {" "}
                      <Link href={`/assets/${e.assetId}`} className="font-mono text-[13px] text-accent hover:underline">
                        {e.assetId}
                      </Link>
                    </>
                  )}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
                  {new Date(e.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  {e.status === "failed" && <span className="text-[color:var(--st-danger-fg)]">Failed</span>}
                  {e.tx && <TxLink hash={e.tx} />}
                </p>
                {e.status === "failed" && e.error && <p className="mt-0.5 text-[13px] text-muted">{e.error}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function RoleTags({ data }: { data: DashboardData }) {
  const tags = [
    data.roles.registrar && "Registrar",
    data.stewarded.length > 0 && `Steward of ${data.stewarded.length} ${data.stewarded.length === 1 ? "asset" : "assets"}`,
    data.roles.serviceProvider && "Service provider",
  ].filter(Boolean) as string[];
  if (!tags.length) return null;
  return (
    <ul aria-label="Roles" className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t} className="rounded-[6px] border border-line-strong px-2.5 py-1 text-[13px] leading-[18px] text-ink">
          {t}
        </li>
      ))}
    </ul>
  );
}

