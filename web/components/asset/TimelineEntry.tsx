import type { LifecycleRecord } from "@/lib/types";
import { formatDateTime, RECORD_LABEL, truncateAddress, truncateHash } from "@/lib/format";
import { cn } from "@/lib/cn";
import { RECORD_ICON, CLAIM_TYPES } from "./recordIcons";
import { ProvenanceTag } from "./ProvenanceTag";

/**
 * One lifecycle record. In the Passport timeline it sits on a vertical rail;
 * standalone (Home) it renders the same content without the rail.
 */
export function TimelineEntry({ record, className }: { record: LifecycleRecord; className?: string }) {
  const Icon = RECORD_ICON[record.type];
  const superseded = record.supersededBy !== undefined;

  return (
    <div className={cn("grid grid-cols-[32px_1fr] gap-x-3", superseded && "opacity-60", className)}>
      <span className="flex size-8 items-center justify-center rounded-[6px] border border-line bg-surface text-ink">
        <Icon size={17} aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <h4 className="text-[15px] leading-8 font-semibold text-ink">{RECORD_LABEL[record.type]}</h4>
          <time className="font-mono text-[12.5px] text-muted" dateTime={new Date(record.timestamp * 1000).toISOString()}>
            {formatDateTime(record.timestamp)}
          </time>
        </div>
        <p className="mt-0.5 text-[15px] leading-6 text-ink">{record.summary}</p>
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
        {CLAIM_TYPES.has(record.type) && <ProvenanceTag kind="claim" className="mt-2" />}
      </div>
    </div>
  );
}
