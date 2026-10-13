"use client";

import { useId, useState, type FormEvent } from "react";
import { isAddress } from "viem";
import type { Asset } from "@/lib/types";
import { formatDateTime, truncateAddress } from "@/lib/format";
import { acceptHandover, cancelHandover, proposeHandover } from "@/lib/data/actions";
import { buttonClass } from "@/components/ui/button";
import { Field, describedBy, inputClass } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { useViewer } from "@/components/shell/Viewer";
import { FileHashInput, type HashedFile } from "./FileHashInput";
import { TxStatus } from "./TxStatus";
import { useWrite } from "./useWrite";

const LEGAL_NOTE =
  "This changes the registered steward in Vestra once the recipient accepts. It doesn’t transfer legal ownership.";

export function ProposeHandoverDialog({
  open,
  onOpenChange,
  asset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
}) {
  const id = useId();
  const { address } = useViewer();
  const { phase, run, reset, busy, demo } = useWrite();
  const [to, setTo] = useState("");
  const [days, setDays] = useState("7");
  const [files, setFiles] = useState<HashedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  function close(next: boolean) {
    if (busy) return;
    onOpenChange(next);
    if (!next)
      setTimeout(() => {
        reset();
        setTo("");
        setDays("7");
        setFiles([]);
        setError(null);
      }, 250);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address) return;
    const value = to.trim();
    if (!isAddress(value)) return setError("Enter a full wallet address starting with 0x.");
    if (value.toLowerCase() === address.toLowerCase()) return setError("That’s your own wallet. Enter the recipient’s.");
    setError(null);
    run(() =>
      proposeHandover({ assetId: asset.id, actor: address, to: value, days: Number(days), evidenceHash: files[0]?.hash }),
    );
  }

  const done = phase.kind === "confirmed";
  const locked = busy || done;

  return (
    <Sheet open={open} onOpenChange={close} variant="dialog" title="Propose handover" description={`${asset.name}, ${asset.id}`}>
      {done ? (
        <div>
          <TxStatus phase={phase} demo={demo} />
          <p className="mt-5 text-[15px] leading-6 text-ink">
            The handover is waiting for {truncateAddress(to)} to accept. You can cancel it until then.
          </p>
          <button type="button" onClick={() => close(false)} className={buttonClass("primary", "md", "mt-6")}>
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
          <Field
            id={`${id}-to`}
            label="Recipient wallet"
            helper="The handover completes only when this wallet accepts it."
            error={error}
          >
            <input
              id={`${id}-to`}
              value={to}
              disabled={locked}
              onChange={(e) => {
                setTo(e.target.value);
                if (error) setError(null);
              }}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!error || undefined}
              aria-describedby={describedBy(`${id}-to`, true, !!error)}
              className={inputClass(!!error) + " h-11 font-mono text-[14px]"}
            />
          </Field>

          <Field id={`${id}-days`} label="Expires in" helper="After this the proposal can’t be accepted.">
            <select
              id={`${id}-days`}
              value={days}
              disabled={locked}
              onChange={(e) => setDays(e.target.value)}
              aria-describedby={`${id}-days-help`}
              className={inputClass() + " h-11"}
            >
              {[3, 7, 14, 30].map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </select>
          </Field>

          <fieldset disabled={locked} className="contents">
            <FileHashInput label="Handover document" files={files} onChange={setFiles} />
          </fieldset>

          <p className="rounded-[6px] bg-sunk px-4 py-3 text-[14px] leading-5 text-ink">{LEGAL_NOTE}</p>

          <TxStatus phase={phase} demo={demo} />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => close(false)} disabled={busy} className={buttonClass("secondary", "md")}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className={buttonClass("primary", "md")}>
              {busy ? "Proposing" : phase.kind === "failed" ? "Try again" : "Propose handover"}
            </button>
          </div>
        </form>
      )}
    </Sheet>
  );
}

/** Confirmation for accepting or cancelling an open handover. */
export function ConfirmHandoverDialog({
  open,
  onOpenChange,
  asset,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  action: "accept" | "cancel";
}) {
  const { address } = useViewer();
  const { phase, run, reset, busy, demo } = useWrite();
  const h = asset.pendingHandover;

  function close(next: boolean) {
    if (busy) return;
    onOpenChange(next);
    if (!next) setTimeout(reset, 250);
  }

  const accept = action === "accept";
  const done = phase.kind === "confirmed";

  return (
    <Sheet
      open={open}
      onOpenChange={close}
      variant="dialog"
      title={accept ? "Accept handover" : "Cancel proposal"}
      description={`${asset.name}, ${asset.id}`}
    >
      {done ? (
        <div>
          <TxStatus phase={phase} demo={demo} />
          <p className="mt-5 text-[15px] leading-6 text-ink">
            {accept
              ? "Your wallet is now the registered steward of this asset in Vestra."
              : "The proposal is cancelled and can no longer be accepted."}
          </p>
          <button type="button" onClick={() => close(false)} className={buttonClass("primary", "md", "mt-6")}>
            Done
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-[15px] leading-6 text-ink">
            {accept ? (
              <>
                You&rsquo;ll become the registered steward of this asset in Vestra, taking over from{" "}
                <span className="font-mono text-[14px]">{h ? truncateAddress(h.from) : ""}</span>.
              </>
            ) : (
              <>
                The handover to <span className="font-mono text-[14px]">{h ? truncateAddress(h.to) : ""}</span> will be
                cancelled. You stay the registered steward.
              </>
            )}
          </p>
          {accept && (
            <p className="rounded-[6px] bg-sunk px-4 py-3 text-[14px] leading-5 text-ink">
              This changes the registered steward in Vestra. It doesn&rsquo;t transfer legal ownership.
            </p>
          )}
          {h && (
            <p className="text-[13px] leading-[18px] text-muted">Proposal expires {formatDateTime(h.expiresAt)}.</p>
          )}
          <TxStatus phase={phase} demo={demo} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => close(false)} disabled={busy} className={buttonClass("secondary", "md")}>
              {accept ? "Not now" : "Keep proposal"}
            </button>
            <button
              type="button"
              disabled={busy || !address}
              onClick={() =>
                address &&
                run(() => (accept ? acceptHandover : cancelHandover)({ assetId: asset.id, actor: address }))
              }
              className={buttonClass("primary", "md")}
            >
              {busy ? (accept ? "Accepting" : "Cancelling") : accept ? "Accept handover" : "Cancel proposal"}
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
