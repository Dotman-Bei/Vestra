"use client";

import { useCallback, useState } from "react";
import type { Hex } from "@/lib/types";
import type { WriteResult } from "@/lib/data/actions";
import { useViewer } from "@/components/shell/Viewer";
import { logTx, settleTx } from "@/components/shell/txLog";

export type TxPhase =
  | { kind: "idle" }
  | { kind: "wallet" }
  | { kind: "submitted" }
  | { kind: "confirmed"; tx: Hex; index?: number; assetId?: string }
  | { kind: "failed"; error: string };

/**
 * Runs a write and tracks its transaction phase. In demo mode the write is a
 * server action against the example store; there is no wallet step. Chain
 * writes (wallet signature, then receipt) land with the registry contract.
 */
export function useWrite() {
  const { mode } = useViewer();
  const [phase, setPhase] = useState<TxPhase>({ kind: "idle" });

  const run = useCallback(
    async (write: () => Promise<WriteResult>, meta: { label: string; assetId?: string }) => {
      if (mode !== "demo") {
        setPhase({ kind: "failed", error: "The Vestra contract isn’t deployed yet, so nothing can be written." });
        return;
      }
      setPhase({ kind: "submitted" });
      const logId = logTx(meta);
      try {
        const res = await write();
        if (res.ok) {
          setPhase({ kind: "confirmed", tx: res.tx, index: res.index, assetId: res.assetId });
          settleTx(logId, { status: "confirmed", tx: res.tx, ...(res.assetId && { assetId: res.assetId }) });
        } else {
          setPhase({ kind: "failed", error: res.error });
          settleTx(logId, { status: "failed", error: res.error });
        }
      } catch {
        const error = "Couldn’t reach BOT Chain. Nothing was written; try again.";
        setPhase({ kind: "failed", error });
        settleTx(logId, { status: "failed", error });
      }
    },
    [mode],
  );

  const reset = useCallback(() => setPhase({ kind: "idle" }), []);
  const busy = phase.kind === "wallet" || phase.kind === "submitted";
  return { phase, run, reset, busy, demo: mode === "demo" };
}
