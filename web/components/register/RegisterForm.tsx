"use client";

import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { encodePacked, isAddress, keccak256, toHex } from "viem";
import { ArrowLeftIcon, ArrowRightIcon, CaretDownIcon, CheckIcon, EyeIcon } from "@phosphor-icons/react";
import type { Address, Asset, Hex } from "@/lib/types";
import { STATUS_LABEL, truncateAddress, truncateHash } from "@/lib/format";
import {
  CATEGORIES,
  LIMITS,
  validateRegistration,
  type RegistrationErrors,
  type RegistrationInput,
} from "@/lib/registration";
import { registerAsset } from "@/lib/data/actions";
import { useViewer } from "@/components/shell/Viewer";
import { PassportPlate } from "@/components/asset/PassportPlate";
import { PrintTag } from "@/components/asset/PrintTag";
import { DownloadQrButton, verifyUrl } from "@/components/asset/QRPlate";
import { FileHashInput, type HashedFile } from "@/components/asset/FileHashInput";
import { TxStatus } from "@/components/asset/TxStatus";
import { useWrite } from "@/components/asset/useWrite";
import { Field, FieldError, describedBy, inputClass } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const ZERO = "0x0000000000000000000000000000000000000000" as Address;

function newSalt(): Hex {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

function Group({ title, children, description }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-6">
      <legend className="float-left w-full text-[17px] leading-6 font-semibold text-ink">{title}</legend>
      {description && <p className="clear-both pt-1 text-[14px] leading-5 text-muted">{description}</p>}
      <div className="clear-both flex flex-col gap-5 pt-5">{children}</div>
    </fieldset>
  );
}

export function RegisterForm() {
  const id = useId();
  const viewer = useViewer();
  const { phase, run, reset, busy, demo } = useWrite();
  const top = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [publishSerial, setPublishSerial] = useState(true);
  const [serial, setSerial] = useState("");
  const [salt, setSalt] = useState<Hex | null>(null);
  const [saltSaved, setSaltSaved] = useState(false);
  const [steward, setSteward] = useState<string>(viewer.address ?? "");
  const [metadataUri, setMetadataUri] = useState("");
  const [files, setFiles] = useState<HashedFile[]>([]);
  const [status, setStatus] = useState<"REGISTERED" | "ACTIVE">("REGISTERED");
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [step, setStep] = useState<"edit" | "review">("edit");

  const trimmedSerial = serial.trim();
  const commitment = useMemo(
    () =>
      !publishSerial && trimmedSerial && salt
        ? keccak256(encodePacked(["bytes16", "string"], [salt, trimmedSerial]))
        : undefined,
    [publishSerial, trimmedSerial, salt],
  );

  const input: RegistrationInput = {
    name,
    category,
    type,
    manufacturer: manufacturer.trim() || undefined,
    model: model.trim() || undefined,
    publicSerial: publishSerial ? trimmedSerial || undefined : undefined,
    serialCommitment: commitment,
    steward: steward.trim(),
    metadataUri: metadataUri.trim() || undefined,
    evidenceHashes: files.map((f) => f.hash),
    status,
  };

  const preview: Asset = {
    id: "",
    name: name.trim() || "Untitled asset",
    category,
    type: type.trim(),
    manufacturer: input.manufacturer,
    model: input.model,
    publicSerial: input.publicSerial ?? null,
    serialCommitment: commitment,
    steward: isAddress(steward.trim()) ? (steward.trim() as Address) : ZERO,
    registrar: viewer.address ?? ZERO,
    status,
    registeredAt: 0,
    registeredBlock: 0,
    registeredTx: "0x",
    evidenceHashes: input.evidenceHashes,
    recordCount: 0,
  };

  function clearError(key: keyof RegistrationErrors) {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function onReview(e: FormEvent) {
    e.preventDefault();
    const next = validateRegistration(input);
    if (!publishSerial && trimmedSerial && !saltSaved) next.saltSaved = "Confirm you’ve saved the salt.";
    setErrors(next);
    const firstKey = Object.keys(next).find((k) => next[k as keyof RegistrationErrors]);
    if (firstKey) {
      document.getElementById(`${id}-${firstKey}`)?.focus();
      return;
    }
    setStep("review");
    top.current?.scrollIntoView({ block: "start" });
  }

  function onRegister() {
    if (!viewer.address) return;
    run(() => registerAsset({ ...input, actor: viewer.address! }));
  }

  function startOver() {
    reset();
    setName("");
    setCategory("");
    setType("");
    setManufacturer("");
    setModel("");
    setPublishSerial(true);
    setSerial("");
    setSalt(null);
    setSaltSaved(false);
    setSteward(viewer.address ?? "");
    setMetadataUri("");
    setFiles([]);
    setStatus("REGISTERED");
    setErrors({});
    setStep("edit");
    top.current?.scrollIntoView({ block: "start" });
  }

  if (phase.kind === "confirmed" && phase.assetId) {
    return <Success assetId={phase.assetId} name={name.trim()} onAnother={startOver} />;
  }

  const onChain: Array<[string, ReactNode]> = [
    ["Asset ID", <span key="id" className="font-sans text-muted">Assigned by the contract</span>],
    ["Registrar", viewer.address ? truncateAddress(viewer.address) : "Your wallet"],
    ["Steward", isAddress(steward.trim()) ? truncateAddress(steward.trim()) : <Missing key="s" />],
    ["Name", name.trim() || <Missing key="n" />],
    ["Category, type", [category, type.trim()].filter(Boolean).join(", ") || <Missing key="c" />],
    ["Manufacturer, model", [input.manufacturer, input.model].filter(Boolean).join(", ") || "None"],
    [
      "Serial",
      input.publicSerial ? input.publicSerial : commitment ? `Hash ${truncateHash(commitment)}` : "None",
    ],
    ["Starting status", STATUS_LABEL[status]],
    ["Metadata link", input.metadataUri ? truncateHash(input.metadataUri) : "None"],
    ["Evidence hashes", files.length ? String(files.length) : "None"],
  ];

  const onChainList = (
    <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[13px] leading-5">
      {onChain.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="min-w-0 truncate text-right font-mono text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <div ref={top} className="grid scroll-mt-24 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 lg:col-span-7">
        {step === "review" ? (
          <section aria-labelledby={`${id}-review`}>
            <h2 id={`${id}-review`} className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-ink">
              Check before you sign
            </h2>
            <p className="mt-2 max-w-[60ch] text-[15px] leading-6 text-muted">
              These values are written to BOT Chain. They&rsquo;re public and can&rsquo;t be edited afterwards; later
              changes are added as records.
            </p>
            <div className="mt-6 rounded-[10px] border border-line bg-surface p-5">{onChainList}</div>
            {!publishSerial && commitment && (
              <p className="mt-4 rounded-[6px] bg-sunk px-4 py-3 text-[14px] leading-5 text-ink">
                The serial itself isn&rsquo;t sent anywhere. Only its hash is recorded, so keep the salt to prove the
                serial later.
              </p>
            )}
            <TxStatus phase={phase} demo={demo} className="mt-6" />
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  reset();
                  setStep("edit");
                }}
                className={buttonClass("secondary", "md")}
              >
                <ArrowLeftIcon size={16} aria-hidden />
                Edit details
              </button>
              <button type="button" disabled={busy} onClick={onRegister} className={buttonClass("primary", "md")}>
                {busy ? "Registering" : phase.kind === "failed" ? "Try again" : "Sign and register"}
              </button>
            </div>
          </section>
        ) : (
          <form onSubmit={onReview} noValidate className="flex flex-col gap-8">
            <Group title="The asset">
              <Field
                id={`${id}-name`}
                label="Display name"
                helper="Shown publicly. Don’t include people’s names or home addresses."
                error={errors.name}
              >
                <input
                  id={`${id}-name`}
                  value={name}
                  maxLength={LIMITS.name + 20}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  aria-invalid={!!errors.name || undefined}
                  aria-describedby={describedBy(`${id}-name`, true, !!errors.name)}
                  className={inputClass(!!errors.name) + " h-11"}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id={`${id}-category`} label="Category" error={errors.category}>
                  <div className="relative">
                    <select
                      id={`${id}-category`}
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        clearError("category");
                      }}
                      aria-invalid={!!errors.category || undefined}
                      aria-describedby={describedBy(`${id}-category`, false, !!errors.category)}
                      className={inputClass(!!errors.category) + " h-11 appearance-none pr-9"}
                    >
                      <option value="">Choose a category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <CaretDownIcon size={14} aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
                  </div>
                </Field>
                <Field id={`${id}-type`} label="Type" helper="For example “String inverter, 3-phase”." error={errors.type}>
                  <input
                    id={`${id}-type`}
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      clearError("type");
                    }}
                    aria-invalid={!!errors.type || undefined}
                    aria-describedby={describedBy(`${id}-type`, true, !!errors.type)}
                    className={inputClass(!!errors.type) + " h-11"}
                  />
                </Field>
                <Field id={`${id}-manufacturer`} label="Manufacturer" optional error={errors.manufacturer}>
                  <input
                    id={`${id}-manufacturer`}
                    value={manufacturer}
                    onChange={(e) => {
                      setManufacturer(e.target.value);
                      clearError("manufacturer");
                    }}
                    aria-invalid={!!errors.manufacturer || undefined}
                    aria-describedby={describedBy(`${id}-manufacturer`, false, !!errors.manufacturer)}
                    className={inputClass(!!errors.manufacturer) + " h-11"}
                  />
                </Field>
                <Field id={`${id}-model`} label="Model" optional error={errors.model}>
                  <input
                    id={`${id}-model`}
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                      clearError("model");
                    }}
                    aria-invalid={!!errors.model || undefined}
                    aria-describedby={describedBy(`${id}-model`, false, !!errors.model)}
                    className={inputClass(!!errors.model) + " h-11"}
                  />
                </Field>
              </div>
            </Group>

            <Group title="Serial number" description="Optional. Publish it, or keep it private and record only a salted hash.">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={publishSerial}
                  onChange={(e) => {
                    setPublishSerial(e.target.checked);
                    if (!e.target.checked && !salt) setSalt(newSalt());
                    clearError("serial");
                  }}
                  className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
                />
                <span className="text-[15px] leading-6 text-ink">
                  Publish the serial number
                  <span className="block text-[13px] leading-[18px] text-muted">
                    Anyone can then search for it and see it on the passport.
                  </span>
                </span>
              </label>
              <Field
                id={`${id}-serial`}
                label="Serial number"
                optional
                helper={publishSerial ? undefined : "Stays in your browser. Only the hash below is recorded."}
                error={errors.serial}
              >
                <input
                  id={`${id}-serial`}
                  value={serial}
                  onChange={(e) => {
                    setSerial(e.target.value);
                    clearError("serial");
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={!!errors.serial || undefined}
                  aria-describedby={describedBy(`${id}-serial`, !publishSerial, !!errors.serial)}
                  className={inputClass(!!errors.serial) + " h-11 font-mono text-[15px]"}
                />
              </Field>
              {!publishSerial && salt && (
                <div className="rounded-[6px] border border-line bg-surface p-4">
                  <p className="text-[13px] leading-[18px] font-medium text-ink">Salt</p>
                  <div className="mt-1 flex items-center gap-1">
                    <code className="min-w-0 truncate font-mono text-[13px] text-ink">{salt}</code>
                    <CopyButton value={salt} label="Copy salt" />
                  </div>
                  <p className="mt-2 text-[13px] leading-[18px] text-muted">
                    Store this with the serial number. Without it, nobody can show that a serial matches this asset,
                    including you.
                  </p>
                  {commitment && (
                    <p className="mt-3 flex items-center gap-1 text-[13px] text-muted">
                      Recorded hash <span className="font-mono text-ink">{truncateHash(commitment)}</span>
                    </p>
                  )}
                  {trimmedSerial && (
                    <label className="mt-4 flex cursor-pointer items-start gap-3">
                      <input
                        id={`${id}-saltSaved`}
                        type="checkbox"
                        checked={saltSaved}
                        onChange={(e) => {
                          setSaltSaved(e.target.checked);
                          clearError("saltSaved");
                        }}
                        className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="text-[14px] leading-5 text-ink">I&rsquo;ve saved the salt somewhere safe.</span>
                    </label>
                  )}
                  {errors.saltSaved && (
                    <div className="mt-2">
                      <FieldError>{errors.saltSaved}</FieldError>
                    </div>
                  )}
                </div>
              )}
            </Group>

            <Group title="Steward" description="The wallet responsible for the asset from today. It can later hand over to another wallet.">
              <Field
                id={`${id}-steward`}
                label="Steward wallet"
                error={errors.steward}
                aside={
                  viewer.address && steward.trim().toLowerCase() !== viewer.address.toLowerCase() ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSteward(viewer.address!);
                        clearError("steward");
                      }}
                      className="text-[13px] text-accent underline-offset-4 hover:underline"
                    >
                      Use my wallet
                    </button>
                  ) : undefined
                }
              >
                <input
                  id={`${id}-steward`}
                  value={steward}
                  onChange={(e) => {
                    setSteward(e.target.value);
                    clearError("steward");
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={!!errors.steward || undefined}
                  aria-describedby={describedBy(`${id}-steward`, false, !!errors.steward)}
                  className={inputClass(!!errors.steward) + " h-11 font-mono text-[14px]"}
                />
              </Field>
            </Group>

            <Group title="Records and evidence">
              <Field
                id={`${id}-metadataUri`}
                label="Metadata link"
                optional
                helper="A public page or file describing the asset: datasheet, photos, warranty terms."
                error={errors.metadataUri}
              >
                <input
                  id={`${id}-metadataUri`}
                  value={metadataUri}
                  onChange={(e) => {
                    setMetadataUri(e.target.value);
                    clearError("metadataUri");
                  }}
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={!!errors.metadataUri || undefined}
                  aria-describedby={describedBy(`${id}-metadataUri`, true, !!errors.metadataUri)}
                  className={inputClass(!!errors.metadataUri) + " h-11 font-mono text-[14px]"}
                />
              </Field>
              <FileHashInput label="Evidence documents" multiple files={files} onChange={setFiles} />
            </Group>

            <Group title="Starting status">
              <div role="radiogroup" aria-label="Starting status" className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["REGISTERED", "Registered", "Not yet installed or in service."],
                    ["ACTIVE", "Active", "Already installed and running."],
                  ] as const
                ).map(([value, label, help]) => (
                  <label
                    key={value}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-3 rounded-[6px] border p-4 transition-colors",
                      "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                      status === value ? "border-accent bg-accent-wash" : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${id}-status`}
                      value={value}
                      checked={status === value}
                      onChange={() => setStatus(value)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                        status === value ? "border-accent bg-accent text-accent-ink" : "border-line-strong",
                      )}
                    >
                      {status === value && <CheckIcon size={12} weight="bold" />}
                    </span>
                    <span>
                      <span className="block text-[15px] leading-6 font-medium text-ink">{label}</span>
                      <span className="block text-[13px] leading-[18px] text-muted">{help}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Group>

            <details className="group rounded-[10px] border border-line bg-surface lg:hidden">
              <summary className="flex h-12 cursor-pointer list-none items-center gap-2.5 px-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                <EyeIcon size={18} aria-hidden />
                Preview the public record
                <CaretDownIcon size={14} aria-hidden className="ml-auto text-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-line p-4">
                <PassportPlate asset={preview} />
                <div className="mt-4">{onChainList}</div>
              </div>
            </details>

            <div className="flex flex-col gap-3 border-t border-line pt-6">
              {Object.values(errors).some(Boolean) && <FieldError>Fix the highlighted fields to continue.</FieldError>}
              <div>
                <button type="submit" className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
                  Review registration
                  <ArrowRightIcon size={17} aria-hidden />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <aside aria-label="Preview" className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-24 flex flex-col gap-5">
          <div>
            <h2 className="text-[13px] leading-[18px] font-medium text-muted">What will be public</h2>
            <PassportPlate asset={preview} className="mt-2" />
          </div>
          {step === "edit" && (
            <div className="rounded-[10px] border border-line p-5">
              <h2 className="mb-3 text-[13px] leading-[18px] font-medium text-muted">Written to BOT Chain</h2>
              {onChainList}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Missing() {
  return <span className="font-sans text-[color:var(--st-maint-fg)]">Required</span>;
}

function Success({ assetId, name, onAnother }: { assetId: string; name: string; onAnother: () => void }) {
  return (
    <section className="grid gap-10 lg:grid-cols-12 lg:gap-12" aria-labelledby="registered-h">
      <div className="lg:col-span-7">
        <CheckIcon size={28} weight="bold" aria-hidden className="text-accent" />
        <h2 id="registered-h" className="mt-3 text-[26px] leading-8 font-semibold tracking-[-0.015em] text-ink">
          <span className="font-mono">{assetId}</span> is registered.
        </h2>
        <p className="mt-2 max-w-[56ch] text-[16px] leading-[26px] text-muted">
          {name} now has a passport and a public verification page. Print the tag and fix it somewhere visible on the
          equipment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/assets/${assetId}`} className={buttonClass("primary", "md")}>
            Open passport
          </Link>
          <DownloadQrButton assetId={assetId} />
          <button type="button" onClick={onAnother} className={buttonClass("ghost", "md", "px-2")}>
            Register another
          </button>
        </div>
      </div>
      <div className="flex justify-center rounded-[10px] bg-sunk px-6 py-10 lg:col-span-5">
        <PrintTag assetId={assetId} url={verifyUrl(assetId)} />
      </div>
    </section>
  );
}
