import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowsLeftRightIcon,
  CloudSlashIcon,
  MagnifyingGlassIcon,
  SealCheckIcon,
  WarningIcon,
} from "@phosphor-icons/react/ssr";
import { ChainReadError, getAsset, getChainHead, getMetadataStatus, getRecords } from "@/lib/data";
import type { Asset, LifecycleRecord } from "@/lib/types";
import { formatDate, formatDateTime, formatNumber, RECORD_LABEL, STATUS_LABEL, truncateAddress } from "@/lib/format";
import { explorerBlock } from "@/lib/config";
import { StatusChip } from "@/components/asset/StatusChip";
import { AddressChip } from "@/components/asset/Chips";
import { AssetIdLookup } from "@/components/asset/AssetIdLookup";
import { RECORD_ICON } from "@/components/asset/recordIcons";
import { StateMessage } from "@/components/ui/StateMessage";
import { RetryButton } from "@/components/ui/RetryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { buttonClass } from "@/components/ui/button";
import { normalizeAssetId } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/verify/[assetId]">): Promise<Metadata> {
  const { assetId } = await params;
  return { title: `Verify ${normalizeAssetId(decodeURIComponent(assetId)) ?? "asset"}` };
}

export default function VerifyPage({ params }: PageProps<"/verify/[assetId]">) {
  return (
    <div className="mx-auto max-w-[560px] px-4 pt-8 pb-16 sm:pt-12">
      <Suspense fallback={<VerifySkeleton />}>
        <Verification params={params} />
      </Suspense>
    </div>
  );
}

async function Verification({ params }: { params: PageProps<"/verify/[assetId]">["params"] }) {
  const { assetId: raw } = await params;
  const input = decodeURIComponent(raw);
  const id = normalizeAssetId(input);

  if (!id) {
    return (
      <StateMessage icon={MagnifyingGlassIcon} as="h1" title="That isn’t a Vestra asset ID." action={<AssetIdLookup />}>
        Vestra IDs look like VST-0007. Check what&rsquo;s printed under the QR tag.
      </StateMessage>
    );
  }

  let data;
  try {
    const [asset, records, metadata, head] = await Promise.all([
      getAsset(id),
      getRecords(id),
      getMetadataStatus(id),
      getChainHead(),
    ]);
    data = { asset, records, metadata, head };
  } catch (e) {
    if (!(e instanceof ChainReadError)) throw e;
    return (
      <StateMessage icon={CloudSlashIcon} as="h1" title="Couldn’t reach BOT Chain." action={<RetryButton />}>
        This is a connection problem, not a problem with the asset. Try again in a moment.
      </StateMessage>
    );
  }

  const { asset, records, metadata, head } = data;
  if (!asset) {
    return (
      <StateMessage icon={MagnifyingGlassIcon} as="h1" title="No asset with this ID." action={<AssetIdLookup />}>
        <span className="font-mono text-[15px] text-ink">{id}</span> isn&rsquo;t registered on Vestra. Check the ID
        under the QR tag, or the tag may not be a Vestra tag.
      </StateMessage>
    );
  }

  const blockHref = explorerBlock(head.block);
  const recent = [...records].reverse().slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <SealCheckIcon size={32} weight="duotone" aria-hidden className="text-accent" />
        <h1 className="mt-3 text-[26px] leading-8 font-semibold tracking-[-0.015em] text-ink">
          Record found on BOT Chain
        </h1>
        <p className="mt-1.5 text-[14px] leading-5 text-muted">
          Read from block{" "}
          {blockHref ? (
            <a href={blockHref} target="_blank" rel="noreferrer" className="font-mono text-[13px] text-accent hover:underline">
              {formatNumber(head.block)}
            </a>
          ) : (
            <span className="font-mono text-[13px] text-ink">{formatNumber(head.block)}</span>
          )}{" "}
          at {formatDateTime(head.timestamp)}
        </p>
      </header>

      <section aria-label="Asset" className="rounded-[10px] border border-line-strong bg-surface">
        <div className="px-5 pt-5 pb-5">
          <h2 className="text-[19px] leading-7 font-semibold tracking-[-0.01em] text-balance text-ink">{asset.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-[20px] leading-7 font-medium text-ink">{asset.id}</span>
            <StatusChip status={asset.status} />
          </div>
          <StatusNote asset={asset} records={records} />
        </div>

        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2.5 border-t border-line px-5 py-4 text-[14px] leading-5">
          <dt className="text-muted">Registered steward</dt>
          <dd className="justify-self-end sm:justify-self-start">
            <AddressChip address={asset.steward} />
          </dd>
          <dt className="text-muted">Registrar</dt>
          <dd className="justify-self-end sm:justify-self-start">
            <AddressChip address={asset.registrar} />
          </dd>
          <dt className="text-muted">Registered on</dt>
          <dd className="justify-self-end text-ink sm:justify-self-start">{formatDate(asset.registeredAt)}</dd>
          {asset.publicSerial && (
            <>
              <dt className="text-muted">Serial</dt>
              <dd className="justify-self-end font-mono text-[13px] text-ink sm:justify-self-start">{asset.publicSerial}</dd>
            </>
          )}
        </dl>

        {asset.pendingHandover && (
          <p className="flex items-start gap-2 border-t border-line px-5 py-3.5 text-[14px] leading-5 text-ink">
            <ArrowsLeftRightIcon size={17} aria-hidden className="mt-px shrink-0 text-muted" />
            <span>
              A handover to <span className="font-mono text-[13px] whitespace-nowrap">{truncateAddress(asset.pendingHandover.to)}</span> is
              pending. The steward above stays registered until it&rsquo;s accepted.
            </span>
          </p>
        )}

        {metadata === "unavailable" && (
          <p className="flex items-start gap-2 rounded-b-[10px] border-t border-line bg-sunk/60 px-5 py-3.5 text-[14px] leading-5 text-ink">
            <WarningIcon size={17} aria-hidden className="mt-px shrink-0" style={{ color: "var(--st-maint-fg)" }} />
            <span>
              Some details are unavailable because the linked metadata couldn&rsquo;t be loaded. The on-chain record is
              intact.
            </span>
          </p>
        )}
      </section>

      <section aria-labelledby="recent-h">
        <h2 id="recent-h" className="text-[17px] leading-6 font-semibold text-ink">
          Recent history
        </h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-[15px] leading-6 text-muted">No records yet beyond registration.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-4">
            {recent.map((r) => {
              const Icon = RECORD_ICON[r.type];
              return (
                <li key={r.index} className="grid grid-cols-[28px_1fr] gap-x-3">
                  <span className="flex size-7 items-center justify-center rounded-[6px] border border-line bg-surface text-ink">
                    <Icon size={15} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-[15px] leading-7">
                      <span className="font-semibold text-ink">{RECORD_LABEL[r.type]}</span>
                      <span className="font-mono text-[12.5px] text-muted">{formatDate(r.timestamp)}</span>
                    </p>
                    <p className="line-clamp-2 text-[14px] leading-[22px] text-muted">{r.summary}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {records.length > 0 && (
          <p className="mt-4 text-[14px] leading-5 text-muted">
            {records.length} {records.length === 1 ? "record" : "records"} since {formatDate(asset.registeredAt)}
          </p>
        )}
        <Link href={`/assets/${asset.id}`} className={buttonClass("primary", "lg", "mt-5 w-full sm:w-auto")}>
          Open full passport
          <ArrowRightIcon size={17} aria-hidden />
        </Link>
      </section>

      <aside className="rounded-[10px] bg-sunk px-5 py-4 text-[14px] leading-[22px]">
        <h2 className="font-semibold text-ink">What this confirms</h2>
        <p className="mt-1 text-muted">
          This record exists on BOT Chain and shows the status and steward it currently records. It doesn&rsquo;t
          confirm who legally owns the equipment or its condition right now.
        </p>
      </aside>
    </div>
  );
}

/** Who set the current status and when, so a verifier can judge the assertion. */
function StatusNote({ asset, records }: { asset: Asset; records: LifecycleRecord[] }) {
  if (asset.status === "REGISTERED") return null;
  const setBy = [...records].reverse().find((r) => r.newStatus === asset.status);
  if (!setBy) return null;
  return (
    <p className="mt-3 text-[14px] leading-5 text-muted">
      {STATUS_LABEL[asset.status]} since {formatDate(setBy.timestamp)}, recorded by{" "}
      <span className="font-mono text-[13px] whitespace-nowrap text-ink" title={setBy.submitter}>
        {truncateAddress(setBy.submitter)}
      </span>
      .
    </p>
  );
}

function VerifySkeleton() {
  return (
    <div role="status" aria-label="Reading the record from BOT Chain" className="flex flex-col gap-8">
      <div>
        <Skeleton className="size-8" />
        <Skeleton className="mt-3 h-8 w-64" />
        <Skeleton className="mt-2 h-5 w-52" />
      </div>
      <Skeleton className="h-[260px] w-full rounded-[10px]" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <p className="text-[14px] text-muted">Reading the record from BOT Chain…</p>
    </div>
  );
}
