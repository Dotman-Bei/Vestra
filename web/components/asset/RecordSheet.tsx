"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import type { Asset, AssetStatus, LifecycleRecord, RecordType } from "@/lib/types";
import { RECORD_LABEL, STATUS_LABEL } from "@/lib/format";
import { correctableRecords, statusChangeTargets, SUMMARY_MAX } from "@/lib/rules";
import { submitRecord } from "@/lib/data/actions";
import { buttonClass } from "@/components/ui/button";
import { Field, FieldError, describedBy, inputClass } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { useViewer } from "@/components/shell/Viewer";
import { FileHashInput, type HashedFile } from "./FileHashInput";
import { TxStatus } from "./TxStatus";
import { useWrite } from "./useWrite";
import { RECORD_ICON } from "./recordIcons";

const HINT: Partial<Record<RecordType, string>> = {
  INSPECTION: "What was checked and what you found.",
  MAINTENANCE: "What work was done and any parts replaced.",
  INSTALLATION: "Where and how it was installed or commissioned.",
  WARRANTY: "What changed in the warranty and until when.",
  INCIDENT: "What happened and when. Keep personal details out.",
  STATUS_CHANGE: "Why the status is changing.",
  RETIREMENT: "Why the asset is retired and what happened to it.",
  CORRECTION: "What was wrong in the earlier record and the correct information.",
};

export function RecordSheet({
  open,
  onOpenChange,
  asset,
  records,
  allowed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset;
  records: LifecycleRecord[];
  allowed: RecordType[];
}) {
  const id = useId();
  const { address, roles } = useViewer();
  const { phase, run, reset, busy, demo } = useWrite();

  const [type, setType] = useState<RecordType>(allowed[0]);
  const [summary, setSummary] = useState("");
  const [files, setFiles] = useState<HashedFile[]>([]);
  const [documentUri, setDocumentUri] = useState("");
  const [providerId, setProviderId] = useState("");
  const [newStatus, setNewStatus] = useState<AssetStatus | "">("");
  const [supersedes, setSupersedes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const targets = useMemo(() => statusChangeTargets(asset.status), [asset.status]);
  const correctable = useMemo(() => correctableRecords(records, address), [records, address]);
  const effectiveType = allowed.includes(type) ? type : allowed[0];

  function close(next: boolean) {
    if (busy) return;
    onOpenChange(next);
    if (!next) {
      // Reset after the exit animation.
      setTimeout(() => {
        reset();
        setSummary("");
        setFiles([]);
        setDocumentUri("");
        setProviderId("");
        setNewStatus("");
        setSupersedes("");
        setErrors({});
      }, 250);
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!summary.trim()) e.summary = "Add a short summary of the record.";
    else if (summary.length > SUMMARY_MAX) e.summary = `Keep the summary to ${SUMMARY_MAX} characters.`;
    if (documentUri && !/^(https:\/\/|ipfs:\/\/)\S+$/.test(documentUri)) e.documentUri = "Use an https:// or ipfs:// link.";
    if (effectiveType === "STATUS_CHANGE" && !newStatus) e.newStatus = "Choose the new status.";
    if (effectiveType === "CORRECTION" && !supersedes) e.supersedes = "Choose the record you’re correcting.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address || !validate()) return;
    run(() =>
      submitRecord({
        assetId: asset.id,
        actor: address,
        type: effectiveType,
        summary,
        evidenceHash: files[0]?.hash,
        documentUri: documentUri || undefined,
        providerId: providerId || undefined,
        newStatus: effectiveType === "STATUS_CHANGE" ? (newStatus as AssetStatus) : undefined,
        supersedes: effectiveType === "CORRECTION" ? Number(supersedes) : undefined,
      }),
      { label: `${RECORD_LABEL[effectiveType]} record`, assetId: asset.id },
    );
  }

  const done = phase.kind === "confirmed";
  const locked = busy || done;

  return (
    <Sheet open={open} onOpenChange={close} title="Add record" description={`${asset.name}, ${asset.id}`}>
      {done ? (
        <div>
          <TxStatus phase={phase} demo={demo} />
          <p className="mt-5 text-[15px] leading-6 text-ink">
            Added as entry #{phase.index} in the history. It shows your wallet as the submitter.
          </p>
          <button type="button" onClick={() => close(false)} className={buttonClass("primary", "md", "mt-6 w-full sm:w-auto")}>
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
          <fieldset disabled={locked}>
            <legend className="text-[13px] leading-[18px] font-medium text-ink">Record type</legend>
            <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-2">
              {allowed.map((t) => {
                const Icon = RECORD_ICON[t];
                const checked = t === effectiveType;
                return (
                  <label
                    key={t}
                    className={cn(
                      "relative flex h-11 cursor-pointer items-center gap-2 rounded-[6px] border px-3 text-[14px] transition-colors",
                      "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                      checked ? "border-accent bg-accent-wash font-medium text-ink" : "border-line bg-surface text-ink hover:border-line-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${id}-type`}
                      value={t}
                      checked={checked}
                      onChange={() => {
                        setType(t);
                        setErrors({});
                      }}
                      className="sr-only"
                    />
                    <Icon size={17} aria-hidden className={checked ? "text-accent" : "text-muted"} />
                    {RECORD_LABEL[t]}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {effectiveType === "STATUS_CHANGE" && (
            <Field id={`${id}-status`} label="New status" error={errors.newStatus}>
              <select
                id={`${id}-status`}
                value={newStatus}
                disabled={locked}
                onChange={(e) => setNewStatus(e.target.value as AssetStatus)}
                aria-invalid={!!errors.newStatus || undefined}
                aria-describedby={describedBy(`${id}-status`, false, !!errors.newStatus)}
                className={inputClass(!!errors.newStatus) + " h-11"}
              >
                <option value="">Choose a status</option>
                {targets.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {effectiveType === "CORRECTION" && (
            <Field
              id={`${id}-supersedes`}
              label="Record being corrected"
              helper="The original stays in the history, marked as superseded."
              error={errors.supersedes}
            >
              <select
                id={`${id}-supersedes`}
                value={supersedes}
                disabled={locked}
                onChange={(e) => setSupersedes(e.target.value)}
                aria-invalid={!!errors.supersedes || undefined}
                aria-describedby={describedBy(`${id}-supersedes`, true, !!errors.supersedes)}
                className={inputClass(!!errors.supersedes) + " h-11"}
              >
                <option value="">Choose one of your records</option>
                {correctable.map((r) => (
                  <option key={r.index} value={r.index}>
                    #{r.index} {RECORD_LABEL[r.type]}: {r.summary.slice(0, 48)}
                    {r.summary.length > 48 ? "…" : ""}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {effectiveType === "RETIREMENT" && (
            <p className="rounded-[6px] bg-sunk px-4 py-3 text-[14px] leading-5 text-ink">
              Retiring sets the status to Retired. It can&rsquo;t be undone, and no further handovers can be proposed.
            </p>
          )}

          <Field
            id={`${id}-summary`}
            label="Summary"
            helper={HINT[effectiveType]}
            error={errors.summary}
            aside={
              <span className={cn("text-[12px] tabular-nums", summary.length > SUMMARY_MAX ? "text-[color:var(--st-danger-fg)]" : "text-muted")}>
                {summary.length}/{SUMMARY_MAX}
              </span>
            }
          >
            <textarea
              id={`${id}-summary`}
              value={summary}
              disabled={locked}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              aria-invalid={!!errors.summary || undefined}
              aria-describedby={describedBy(`${id}-summary`, true, !!errors.summary)}
              className={inputClass(!!errors.summary) + " resize-y py-2.5 leading-6"}
            />
          </Field>

          <fieldset disabled={locked} className="contents">
            <FileHashInput label="Evidence document" files={files} onChange={setFiles} />
          </fieldset>

          <Field
            id={`${id}-uri`}
            label="Document link"
            optional
            helper="Where an authorized reader can find the full document. Don’t link anything with personal data."
            error={errors.documentUri}
          >
            <input
              id={`${id}-uri`}
              value={documentUri}
              disabled={locked}
              onChange={(e) => setDocumentUri(e.target.value.trim())}
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!errors.documentUri || undefined}
              aria-describedby={describedBy(`${id}-uri`, true, !!errors.documentUri)}
              className={inputClass(!!errors.documentUri) + " h-11 font-mono text-[14px]"}
            />
          </Field>

          {roles.serviceProvider && (
            <Field id={`${id}-provider`} label="Service provider reference" optional helper="Your team or job reference.">
              <input
                id={`${id}-provider`}
                value={providerId}
                disabled={locked}
                onChange={(e) => setProviderId(e.target.value)}
                maxLength={64}
                autoComplete="off"
                aria-describedby={`${id}-provider-help`}
                className={inputClass() + " h-11"}
              />
            </Field>
          )}

          {Object.keys(errors).length > 0 && <FieldError>Fix the highlighted fields to continue.</FieldError>}

          <TxStatus phase={phase} demo={demo} />

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => close(false)} disabled={busy} className={buttonClass("secondary", "md")}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className={buttonClass("primary", "md")}>
              {busy ? "Recording" : phase.kind === "failed" ? "Try again" : "Add record"}
            </button>
          </div>
          <p className="-mt-3 text-[13px] leading-[18px] text-muted">
            Records can&rsquo;t be edited or deleted. Mistakes are fixed with a correction record.
          </p>
        </form>
      )}
    </Sheet>
  );
}
