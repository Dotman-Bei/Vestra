"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export function CopyButton({
  value,
  label,
  className,
  size = 15,
}: {
  value: string;
  /** Accessible name, e.g. "Copy address" */
  label: string;
  className?: string;
  size?: number;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1200);
        });
      }}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-sunk hover:text-ink pointer-coarse:size-9",
        className,
      )}
    >
      {copied ? <CheckIcon size={size} weight="bold" aria-hidden className="text-accent" /> : <CopyIcon size={size} aria-hidden />}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
