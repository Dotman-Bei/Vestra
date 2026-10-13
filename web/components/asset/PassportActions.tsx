"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowsLeftRightIcon, PlusIcon } from "@phosphor-icons/react";
import type { Asset, LifecycleRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { allowedRecordTypes, canAcceptHandover, canCancelHandover, canProposeHandover, isSteward } from "@/lib/rules";
import { buttonClass } from "@/components/ui/button";
import { useViewer } from "@/components/shell/Viewer";
import { AddressChip, HashChip } from "./Chips";
import { RecordSheet } from "./RecordSheet";
import { ConfirmHandoverDialog, ProposeHandoverDialog } from "./HandoverDialogs";

/** Handover banner plus the record and handover actions the viewer's wallet is allowed to take. */
export function PassportActions({ asset, records }: { asset: Asset; records: LifecycleRecord[] }) {
  const { address, roles, ready } = useViewer();
  const [now] = useState(() => Math.floor(Date.now() / 1000));
  const [sheet, setSheet] = useState<null | "record" | "propose" | "accept" | "cancel">(null);

  const allowed = allowedRecordTypes(asset, address, roles, records);
  const canPropose = canProposeHandover(asset, address, now);
  const h = asset.pendingHandover;
  const live = h && h.expiresAt > now;

  // Links from the dashboard (?do=record or ?do=handover) open the matching sheet once.
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const intent = params.get("do");
  const [handled, setHandled] = useState(false);
  if (intent && ready && !handled) {
    setHandled(true);
    if (intent === "record" && allowed.length) setSheet("record");
    if (intent === "handover" && canPropose) setSheet("propose");
  }
  useEffect(() => {
    if (handled && intent) router.replace(pathname, { scroll: false });
  }, [handled, intent, router, pathname]);

  return (
    <>
      {h && (
        <HandoverBanner
          asset={asset}
          live={!!live}
          recipient={canAcceptHandover(asset, address, now)}
          steward={isSteward(asset, address) && canCancelHandover(asset, address)}
          onAccept={() => setSheet("accept")}
          onCancel={() => setSheet("cancel")}
        />
      )}

      {(allowed.length > 0 || canPropose) && (
        <div className="flex flex-wrap gap-3">
          {allowed.length > 0 && (
            <button type="button" onClick={() => setSheet("record")} className={buttonClass("primary", "md")}>
              <PlusIcon size={17} weight="bold" aria-hidden />
              Add record
            </button>
          )}
          {canPropose && (
            <button type="button" onClick={() => setSheet("propose")} className={buttonClass("secondary", "md")}>
              <ArrowsLeftRightIcon size={17} aria-hidden />
              Propose handover
            </button>
          )}
        </div>
      )}

      {allowed.length > 0 && (
        <RecordSheet
          key={address ?? "none"}
          open={sheet === "record"}
          onOpenChange={(o) => setSheet(o ? "record" : null)}
          asset={asset}
          records={records}
          allowed={allowed}
        />
      )}
      <ProposeHandoverDialog open={sheet === "propose"} onOpenChange={(o) => setSheet(o ? "propose" : null)} asset={asset} />
      <ConfirmHandoverDialog
        open={sheet === "accept" || sheet === "cancel"}
        onOpenChange={(o) => !o && setSheet(null)}
        asset={asset}
        action={sheet === "cancel" ? "cancel" : "accept"}
      />
    </>
  );
}

function HandoverBanner({
  asset,
  live,
  recipient,
  steward,
  onAccept,
  onCancel,
}: {
  asset: Asset;
  live: boolean;
  recipient: boolean;
  steward: boolean;
  onAccept: () => void;
  onCancel: () => void;
}) {
  const h = asset.pendingHandover!;

  if (!live) {
    if (!steward) return null;
    return (
      <div className="rounded-[10px] border border-line bg-surface p-5">
        <p className="text-[15px] leading-6 text-ink">
          <strong className="font-semibold">Handover expired.</strong> The proposal to{" "}
          <span className="font-mono text-[14px]">{h.to.slice(0, 6)}…{h.to.slice(-4)}</span> expired on{" "}
          {formatDateTime(h.expiresAt)} without being accepted.
        </p>
        <button type="button" onClick={onCancel} className={buttonClass("ghost", "md", "mt-3")}>
          Clear proposal
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label="Pending handover"
      className="rounded-[10px] border p-5"
      style={{
        borderColor: recipient ? "var(--accent)" : "var(--line)",
        background: recipient ? "var(--accent-wash)" : "var(--surface)",
      }}
    >
      <h2 className="text-[16px] leading-6 font-semibold text-ink">
        {recipient ? "Handover waiting for you" : steward ? "Handover proposed" : "Handover pending"}
      </h2>
      <dl className="mt-2 grid items-center gap-x-6 gap-y-1 text-[14px] leading-5 sm:grid-cols-[auto_1fr]">
        <dt className="text-muted">From</dt>
        <dd>
          <AddressChip address={h.from} />
        </dd>
        <dt className="text-muted">To</dt>
        <dd>
          <AddressChip address={h.to} />
        </dd>
        <dt className="text-muted">Expires</dt>
        <dd className="font-mono text-[13px] text-ink">{formatDateTime(h.expiresAt)}</dd>
        {h.evidenceHash && (
          <>
            <dt className="text-muted">Document</dt>
            <dd>
              <HashChip hash={h.evidenceHash} />
            </dd>
          </>
        )}
      </dl>
      {recipient && (
        <button type="button" onClick={onAccept} className={buttonClass("primary", "md", "mt-4")}>
          Accept handover
        </button>
      )}
      {steward && (
        <button type="button" onClick={onCancel} className={buttonClass("secondary", "md", "mt-4")}>
          Cancel proposal
        </button>
      )}
    </section>
  );
}
