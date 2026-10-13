import type { Asset } from "@/lib/types";
import { formatDate, formatNumber, RECORD_LABEL, truncateAddress } from "@/lib/format";
import { cn } from "@/lib/cn";
import { StatusChip } from "./StatusChip";
import { VestraMark } from "@/components/shell/Wordmark";

/**
 * The equipment nameplate. A static summary of one asset, used in the Home
 * hero, the Register preview and the Register success state.
 */
export function PassportPlate({ asset, className }: { asset: Asset; className?: string }) {
  const specs: Array<[string, string | undefined]> = [
    ["Category", asset.category],
    ["Manufacturer", asset.manufacturer],
    ["Model", asset.model],
    ["Serial", asset.publicSerial ?? "Kept private"],
  ];

  return (
    <article
      aria-label={`Asset passport for ${asset.name}`}
      className={cn(
        "rounded-[10px] border border-line-strong bg-surface shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
        className,
      )}
    >
      <header className="px-5 pt-4 pb-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
            <VestraMark size={18} />
            Asset passport
          </p>
          <StatusChip status={asset.status} className="shrink-0" />
        </div>
        <h3 className="mt-3 text-[19px] leading-7 font-semibold tracking-[-0.01em] text-balance text-ink">
          {asset.name}
        </h3>
        <p className="mt-0.5 font-mono text-[20px] leading-7 font-medium text-ink">{asset.id}</p>
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line px-5 py-5 sm:px-6">
        {specs
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-[13px] leading-[18px] font-medium text-muted">{k}</dt>
              <dd
                className={cn(
                  "mt-1 truncate text-[15px] leading-6 text-ink",
                  k === "Serial" && asset.publicSerial && "font-mono text-[14px]",
                )}
              >
                {v}
              </dd>
            </div>
          ))}
      </dl>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line px-5 py-5 sm:px-6">
        <div>
          <dt className="text-[13px] leading-[18px] font-medium text-muted">Steward</dt>
          <dd className="mt-1 font-mono text-[14px] leading-6 text-ink" title={asset.steward}>
            {truncateAddress(asset.steward)}
          </dd>
        </div>
        <div>
          <dt className="text-[13px] leading-[18px] font-medium text-muted">Registrar</dt>
          <dd className="mt-1 font-mono text-[14px] leading-6 text-ink" title={asset.registrar}>
            {truncateAddress(asset.registrar)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[13px] leading-[18px] font-medium text-muted">Registered</dt>
          <dd className="mt-1 text-[15px] leading-6 text-ink">
            {formatDate(asset.registeredAt)}
            <span className="text-muted"> at block </span>
            <span className="font-mono text-[14px]">{formatNumber(asset.registeredBlock)}</span>
          </dd>
        </div>
      </dl>

      {asset.lastRecord && (
        <footer className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-b-[10px] border-t border-line bg-sunk/60 px-5 py-3.5 sm:px-6 text-[14px] leading-5">
          <span className="text-ink">
            <span className="text-muted">Last record </span>
            {RECORD_LABEL[asset.lastRecord.type]}, {formatDate(asset.lastRecord.at)}
          </span>
          <span className="text-muted">
            {asset.recordCount} {asset.recordCount === 1 ? "record" : "records"}
          </span>
        </footer>
      )}
    </article>
  );
}
