import Link from "next/link";
import { ArrowDownIcon, PlusIcon, TrayIcon, XIcon } from "@phosphor-icons/react/ssr";
import type { Asset } from "@/lib/types";
import { formatDate, RECORD_LABEL, truncateAddress } from "@/lib/format";
import { PAGE_SIZE, toSearchString, type RegistryQuery } from "@/lib/registry";
import { StatusChip } from "@/components/asset/StatusChip";
import { StateMessage } from "@/components/ui/StateMessage";
import { buttonClass } from "@/components/ui/button";

function LastRecord({ asset }: { asset: Asset }) {
  if (!asset.lastRecord) return <span className="text-muted">Registered {formatDate(asset.registeredAt)}</span>;
  return (
    <>
      {RECORD_LABEL[asset.lastRecord.type]}
      <span className="text-muted">, {formatDate(asset.lastRecord.at)}</span>
    </>
  );
}

export function RegistryResults({
  assets,
  total,
  query,
}: {
  assets: Asset[];
  total: number;
  query: RegistryQuery;
}) {
  const filtered = !!(query.q || query.statuses.length || query.category);

  if (total === 0) {
    return (
      <StateMessage
        icon={TrayIcon}
        title="No assets are registered yet."
        action={
          <Link href="/register" className={buttonClass("primary", "md")}>
            <PlusIcon size={17} weight="bold" aria-hidden />
            Register an asset
          </Link>
        }
      >
        Approved registrars can add the first one.
      </StateMessage>
    );
  }

  if (assets.length === 0) {
    return (
      <StateMessage
        icon={TrayIcon}
        title={query.q ? `Nothing matches “${query.q}”.` : "No assets match these filters."}
        action={
          <Link href="/assets" scroll={false} className={buttonClass("secondary", "md")}>
            Clear filters
          </Link>
        }
      >
        {query.q ? "Check the spelling, try the full asset ID, or remove a filter." : "Try removing a status or category."}
      </StateMessage>
    );
  }

  const page = assets.slice(0, query.show);

  return (
    <section aria-label="Assets" className="transition-opacity duration-150 group-data-[pending]/registry:opacity-50">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p aria-live="polite" className="text-[14px] leading-5 text-muted">
          {filtered
            ? `${assets.length} of ${total} ${total === 1 ? "asset matches" : "assets match"}`
            : `Showing ${page.length} of ${total} ${total === 1 ? "asset" : "assets"}`}
          <span className="text-muted">, most recent activity first</span>
        </p>
        {filtered && (
          <Link
            href="/assets"
            scroll={false}
            className="inline-flex items-center gap-1.5 text-[14px] text-accent underline-offset-4 hover:underline"
          >
            <XIcon size={14} aria-hidden />
            Clear filters
          </Link>
        )}
      </div>

      {/* Desktop: table. The asset link stretches across its row. */}
      <table className="mt-4 hidden w-full table-fixed border-collapse text-left md:table">
        <colgroup>
          <col className="w-[32%]" />
          <col className="w-[18%]" />
          <col className="w-[15%]" />
          <col className="w-[22%]" />
          <col className="w-[13%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line-strong text-[13px] leading-[18px] text-muted">
            <th scope="col" className="py-3 pr-4 font-medium">Asset</th>
            <th scope="col" className="py-3 pr-4 font-medium">Status</th>
            <th scope="col" className="py-3 pr-4 font-medium">Category</th>
            <th scope="col" className="py-3 pr-4 font-medium">Last record</th>
            <th scope="col" className="py-3 font-medium">Steward</th>
          </tr>
        </thead>
        <tbody>
          {page.map((a) => (
            <tr key={a.id} className="relative border-b border-line transition-colors hover:bg-surface has-[a:focus-visible]:bg-surface">
              <td className="py-4 pr-4 align-top">
                <Link
                  href={`/assets/${a.id}`}
                  className="text-[15px] leading-6 font-semibold text-ink after:absolute after:inset-0 focus-visible:outline-none"
                >
                  {a.name}
                </Link>
                <span className="block font-mono text-[13px] leading-5 text-muted">{a.id}</span>
              </td>
              <td className="py-4 pr-4 align-top">
                <StatusChip status={a.status} />
              </td>
              <td className="py-4 pr-4 align-top text-[14px] leading-6 text-ink">{a.category}</td>
              <td className="py-4 pr-4 align-top text-[14px] leading-6 text-ink">
                <LastRecord asset={a} />
              </td>
              <td className="py-4 align-top font-mono text-[13px] leading-6 text-ink" title={a.steward}>
                {truncateAddress(a.steward)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: compact blocks */}
      <ul className="mt-4 flex flex-col gap-1 md:hidden">
        {page.map((a) => (
          <li key={a.id}>
            <Link href={`/assets/${a.id}`} className="-mx-3 block rounded-[10px] px-3 py-3.5 active:bg-surface">
              <span className="block text-[16px] leading-6 font-semibold text-ink">{a.name}</span>
              <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="font-mono text-[13px] text-muted">{a.id}</span>
                <StatusChip status={a.status} />
              </span>
              <span className="mt-1.5 block text-[14px] leading-5 text-ink">
                <LastRecord asset={a} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {assets.length > page.length && (
        <Link
          href={`/assets${toSearchString({ ...query, show: query.show + PAGE_SIZE })}`}
          scroll={false}
          className={buttonClass("secondary", "md", "mt-6")}
        >
          <ArrowDownIcon size={16} aria-hidden />
          Load {Math.min(PAGE_SIZE, assets.length - page.length)} more
        </Link>
      )}
    </section>
  );
}
