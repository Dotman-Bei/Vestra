"use client";

import { CheckCircleIcon, CircleIcon, WarningOctagonIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { TxLink } from "./Chips";
import type { TxPhase } from "./useWrite";

const STEPS = ["wallet", "submitted", "confirmed"] as const;

/** Inline transaction progress: Waiting for wallet, Submitted, Confirmed or Failed. */
export function TxStatus({ phase, demo, className }: { phase: TxPhase; demo: boolean; className?: string }) {
  if (phase.kind === "idle") return null;

  if (phase.kind === "failed") {
    return (
      <div role="alert" className={cn("flex gap-3 rounded-[6px] p-4", className)} style={{ background: "var(--st-danger-bg)" }}>
        <WarningOctagonIcon size={20} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-[color:var(--st-danger-fg)]" />
        <div className="text-[14px] leading-5 text-ink">
          <p className="font-semibold">Not recorded</p>
          <p className="mt-0.5">{phase.error}</p>
        </div>
      </div>
    );
  }

  const current = STEPS.indexOf(phase.kind);
  const labels: Record<(typeof STEPS)[number], string> = {
    wallet: demo ? "No wallet signature in demo mode" : "Waiting for your wallet",
    submitted: "Submitted to BOT Chain",
    confirmed: "Confirmed",
  };

  return (
    <div className={cn("rounded-[6px] border border-line bg-surface p-4", className)}>
      <ol aria-live="polite" className="flex flex-col gap-2.5">
        {STEPS.map((step, i) => {
          const done = i < current || phase.kind === "confirmed";
          const active = i === current && phase.kind !== "confirmed";
          const skipped = step === "wallet" && demo;
          return (
            <li key={step} className={cn("flex items-center gap-2.5 text-[14px] leading-5", done || active ? "text-ink" : "text-muted")}>
              {done ? (
                <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}>
                  <CheckCircleIcon size={18} weight="fill" aria-hidden className={skipped ? "text-muted" : "text-accent"} />
                </motion.span>
              ) : active ? (
                <span aria-hidden className="size-[18px] animate-spin rounded-full border-2 border-line-strong border-t-accent motion-reduce:animate-none" />
              ) : (
                <CircleIcon size={18} aria-hidden />
              )}
              <span className={cn(active && "font-medium")}>{labels[step]}</span>
            </li>
          );
        })}
      </ol>
      {phase.kind === "confirmed" && (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 border-t border-line pt-3 text-[13px] text-muted">
          Transaction <TxLink hash={phase.tx} />
        </p>
      )}
    </div>
  );
}
