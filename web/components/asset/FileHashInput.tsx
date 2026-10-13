"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { FileArrowUpIcon, FileIcon, XIcon } from "@phosphor-icons/react";
import type { Hex } from "@/lib/types";
import { truncateHash } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface HashedFile {
  name: string;
  size: number;
  hash: Hex;
}

async function sha256(file: File): Promise<Hex> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return `0x${[...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

/** Hashes evidence files in the browser. Files are never uploaded; only the SHA-256 hash is used. */
export function FileHashInput({
  label,
  multiple = false,
  files,
  onChange,
}: {
  label: string;
  multiple?: boolean;
  files: HashedFile[];
  onChange: (files: HashedFile[]) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hashing, setHashing] = useState(false);

  async function add(list: FileList | null) {
    if (!list?.length) return;
    setHashing(true);
    const hashed = await Promise.all([...list].map(async (f) => ({ name: f.name, size: f.size, hash: await sha256(f) })));
    setHashing(false);
    onChange(multiple ? [...files, ...hashed] : hashed.slice(0, 1));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    add(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-[13px] leading-[18px] font-medium text-ink">
        {label} <span className="font-normal text-muted">(optional)</span>
      </span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-start gap-3 rounded-[6px] border border-dashed px-4 py-4 transition-colors sm:flex-row sm:items-center",
          dragging ? "border-accent bg-accent-wash" : "border-line-strong bg-surface",
        )}
      >
        <FileArrowUpIcon size={22} aria-hidden className="hidden shrink-0 text-muted md:block" />
        <p className="text-[14px] leading-5 text-muted">
          <span className="hidden md:inline">Drop a file here or </span>
          <button
            type="button"
            onClick={() => input.current?.click()}
            aria-describedby={`${id}-label ${id}-note`}
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            <span className="md:hidden">Choose a file</span>
            <span className="hidden md:inline">browse</span>
          </button>
          {hashing && <span className="ml-2 text-ink">Hashing…</span>}
        </p>
        <input
          ref={input}
          type="file"
          multiple={multiple}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      <p id={`${id}-note`} className="-mt-0.5 text-[13px] leading-[18px] text-muted">
        Files stay on your device. Only their SHA-256 hash is recorded.
      </p>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li key={`${f.hash}-${i}`} className="flex items-center gap-2.5 rounded-[6px] bg-sunk px-3 py-2 text-[13px] leading-[18px]">
              <FileIcon size={16} aria-hidden className="shrink-0 text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ink">{f.name}</span>
                <span className="block font-mono text-muted" title={f.hash}>
                  {formatSize(f.size)}, sha256 {truncateHash(f.hash)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-[6px] text-muted hover:bg-surface hover:text-ink"
              >
                <XIcon size={14} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
