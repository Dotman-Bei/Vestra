import type { ReactNode } from "react";
import { CheckCircleIcon, WarningIcon } from "@phosphor-icons/react/ssr";
import type { Asset, ProvenanceKind } from "@/lib/types";
import type { MetadataStatus } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AddressChip, BlockLink, HashChip, TxLink } from "./Chips";
import { ProvenanceTag } from "./ProvenanceTag";

function Fact({
  label,
  kind,
  children,
  note,
  wide,
}: {
  label: string;
  kind: ProvenanceKind;
  children: ReactNode;
  note?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("min-w-0 py-4", wide && "sm:col-span-2")}>
      <dt className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-[13px] leading-[18px] font-medium text-muted">{label}</span>
        <ProvenanceTag kind={kind} />
      </dt>
      <dd className="mt-1.5 text-[15px] leading-6 text-ink">{children}</dd>
      {note && <dd className="mt-1 text-[13px] leading-[18px] text-muted">{note}</dd>}
    </div>
  );
}

/** The passport's key facts, each tagged with where it comes from. */
export function KeyFacts({ asset, metadata }: { asset: Asset; metadata: MetadataStatus }) {
  const details = [asset.category, asset.type, asset.manufacturer, asset.model].filter(Boolean).join(", ");

  return (
    <section aria-labelledby="facts-h">
      <h2 id="facts-h" className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-ink">
        Key facts
      </h2>
      <dl className="mt-2 grid gap-x-10 border-b border-line sm:grid-cols-2 [&>div]:border-t [&>div]:border-line">
        <Fact label="Registered steward" kind="onchain" note="The wallet Vestra records as responsible. Not legal title.">
          <AddressChip address={asset.steward} />
        </Fact>
        <Fact label="Registrar" kind="onchain" note="The approved wallet that created this passport.">
          <AddressChip address={asset.registrar} />
        </Fact>
        <Fact label="Registered" kind="onchain">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {formatDate(asset.registeredAt)}
            <span className="text-muted">at block</span>
            <BlockLink block={asset.registeredBlock} />
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
            Tx <TxLink hash={asset.registeredTx} />
          </span>
        </Fact>
        <Fact label="Serial number" kind="claim">
          {asset.publicSerial ? (
            <span className="font-mono text-[14px]">{asset.publicSerial}</span>
          ) : (
            <span className="flex flex-col gap-0.5">
              <span>Kept private</span>
              {asset.serialCommitment && (
                <span className="flex items-center gap-1 text-[13px] text-muted">
                  Commitment <HashChip hash={asset.serialCommitment} />
                </span>
              )}
            </span>
          )}
        </Fact>
        <Fact label="Description" kind="claim" note="As published by the registrar." wide>
          {details}
        </Fact>
        <Fact label="Metadata" kind="onchain" wide>
          {metadata === "none" || !asset.metadataUri ? (
            <span className="text-muted">No metadata linked.</span>
          ) : (
            <span className="flex flex-col gap-1">
              <span className="min-w-0 truncate font-mono text-[13px]" title={asset.metadataUri}>
                {asset.metadataUri}
              </span>
              {asset.metadataHash && (
                <span className="flex items-center gap-1 text-[13px] text-muted">
                  Hash <HashChip hash={asset.metadataHash} />
                </span>
              )}
              {metadata === "available" ? (
                <span className="flex items-center gap-1.5 text-[13px] text-muted">
                  <CheckCircleIcon size={15} aria-hidden style={{ color: "var(--st-active-fg)" }} />
                  Available and matches the recorded hash
                </span>
              ) : (
                <span className="flex items-start gap-1.5 text-[13px] leading-[18px] text-ink">
                  <WarningIcon size={15} aria-hidden className="mt-px shrink-0" style={{ color: "var(--st-maint-fg)" }} />
                  Couldn&rsquo;t load the metadata. The on-chain record is unaffected.
                </span>
              )}
            </span>
          )}
        </Fact>
        <Fact label="Ownership, location and condition" kind="external" wide>
          <span className="text-muted">
            Not recorded by Vestra. Check these with the steward or through the relevant agreements.
          </span>
        </Fact>
      </dl>
    </section>
  );
}

export function Limitations() {
  return (
    <aside className="rounded-[10px] bg-sunk px-5 py-5 text-[14px] leading-[22px] text-ink md:px-6">
      <h2 className="font-semibold">About this record</h2>
      <p className="mt-1.5 max-w-[72ch] text-muted">
        Entries show what authorized wallets submitted to BOT Chain and when. Vestra doesn&rsquo;t inspect equipment or
        check documents. The registered steward is the wallet Vestra recognizes as responsible, which may differ from
        the legal owner. Off-chain documents can go offline; their hashes stay on-chain so a copy can be checked later.
      </p>
    </aside>
  );
}
