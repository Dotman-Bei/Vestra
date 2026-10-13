import type { LifecycleRecord } from "@/lib/types";
import { formatDateTime, RECORD_LABEL, STATUS_LABEL, truncateAddress, truncateHash } from "@/lib/format";
import { cn } from "@/lib/cn";
import { RECORD_ICON, CLAIM_TYPES } from "./recordIcons";
import { ProvenanceTag } from "./ProvenanceTag";
import { AddressChip, ChainRef, HashChip } from "./Chips";

function shortUri(uri: string) {
  const [, scheme = "", rest = uri] = uri.match(/^([a-z]+:\/\/)?(.*)$/) ?? [];
  return truncateHash(rest, scheme);
}

/**
 * One lifecycle record. `detailed` adds the entry number, chain receipt and
 * correction links used in the Passport timeline; the compact form is the
 * standalone example on Home.
 */
export function TimelineEntry({
  record,
  detailed = false,
  className,
}: {
  record: LifecycleRecord;
  detailed?: boolean;
  className?: string;
}) {
  const Icon = RECORD_ICON[record.type];
  const superseded = record.supersededBy !== undefined;

  return (
    <div className={cn("grid grid-cols-[32px_1fr] gap-x-3", className)}>
      <span className="relative z-[1] flex size-8 items-center justify-center rounded-[6px] border border-line bg-surface text-ink">
        <Icon size={17} aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <h3 className={cn("text-[15px] leading-8 font-semibold text-ink", superseded && "text-muted")}>
            {RECORD_LABEL[record.type]}
            {detailed && <span className="ml-2 font-mono text-[13px] font-normal text-muted">#{record.index}</span>}
          </h3>
          <time className="font-mono text-[12.5px] text-muted" dateTime={new Date(record.timestamp * 1000).toISOString()}>
            {formatDateTime(record.timestamp)}
          </time>
        </div>

        {detailed && record.supersedes !== undefined && (
          <p className="text-[13px] leading-5 text-muted">
            Corrects{" "}
            <a href={`#record-${record.supersedes}`} className="text-accent hover:underline">
              entry #{record.supersedes}
            </a>
          </p>
        )}
        {detailed && superseded && (
          <p className="text-[13px] leading-5 font-medium text-ink">
            Superseded by{" "}
            <a href={`#record-${record.supersededBy}`} className="text-accent hover:underline">
              entry #{record.supersededBy}
            </a>
          </p>
        )}

        <div className={cn(superseded && "opacity-60")}>
        <p className="mt-0.5 text-[15px] leading-6 text-ink">{record.summary}</p>

        {detailed && (record.newStatus || record.newSteward) && (
          <p className="mt-1.5 text-[14px] leading-5 text-ink">
            {record.newStatus && (
              <>
                Status set to <strong className="font-semibold">{STATUS_LABEL[record.newStatus]}</strong>
              </>
            )}
            {record.newSteward && (
              <>
                Registered steward is now{" "}
                <span className="font-mono text-[13px]" title={record.newSteward}>
                  {truncateAddress(record.newSteward)}
                </span>
              </>
            )}
          </p>
        )}

        {detailed ? (
          <dl className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] leading-[18px] text-muted">
            <div className="flex items-center gap-1">
              <dt>Submitted by</dt>
              <dd>
                <AddressChip address={record.submitter} className="[&>span:first-child]:text-[13px]" />
              </dd>
            </div>
            {record.providerId && (
              <div className="flex items-center gap-1">
                <dt>Provider</dt>
                <dd className="text-ink">{record.providerId}</dd>
              </div>
            )}
            {record.evidenceHash && (
              <div className="flex items-center gap-1">
                <dt>Evidence</dt>
                <dd>
                  <HashChip hash={record.evidenceHash} />
                </dd>
              </div>
            )}
            {record.documentUri && (
              <div className="flex min-w-0 items-center gap-1">
                <dt>Document</dt>
                <dd className="min-w-0 truncate font-mono text-ink" title={record.documentUri}>
                  {shortUri(record.documentUri)}
                </dd>
              </div>
            )}
            <div className="flex items-center gap-1">
              <dt>{record.tx ? "Tx" : "On-chain"}</dt>
              <dd>
                <ChainRef tx={record.tx} block={record.block} />
              </dd>
            </div>
          </dl>
        ) : (
          <dl className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] leading-[18px] text-muted">
            <div className="flex gap-1">
              <dt>Submitted by</dt>
              <dd className="font-mono text-ink" title={record.submitter}>
                {truncateAddress(record.submitter)}
              </dd>
            </div>
            {record.evidenceHash && (
              <div className="flex gap-1">
                <dt>Evidence</dt>
                <dd className="font-mono text-ink" title={record.evidenceHash}>
                  {truncateHash(record.evidenceHash)}
                </dd>
              </div>
            )}
          </dl>
        )}
        {CLAIM_TYPES.has(record.type) && <ProvenanceTag kind="claim" className="mt-2" />}
        </div>
      </div>
    </div>
  );
}
