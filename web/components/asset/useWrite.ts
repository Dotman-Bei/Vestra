"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { parseEventLogs, type TransactionReceipt } from "viem";
import { simulateContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import type { Hex } from "@/lib/types";
import type { WriteResult } from "@/lib/data/actions";
import { registryAddress } from "@/lib/config";
import { registryAbi } from "@/lib/chain/abi";
import { assetIdFromChain } from "@/lib/chain/codec";
import { describeWriteError } from "@/lib/chain/errors";
import { appChain, wagmiConfig } from "@/lib/wagmi";
import { useViewer } from "@/components/shell/Viewer";
import { logTx, settleTx } from "@/components/shell/txLog";

export type TxPhase =
  | { kind: "idle" }
  | { kind: "wallet" }
  | { kind: "submitted"; tx?: Hex }
  | { kind: "confirmed"; tx: Hex; index?: number; assetId?: string }
  | { kind: "failed"; error: string };

type RegistryFunction = "addRecord" | "proposeHandover" | "acceptHandover" | "cancelHandover" | "registerAsset";

/** One write, described for both modes. */
export interface WriteJob {
  label: string;
  assetId?: string;
  /** Demo mode: a server action against the example store. */
  demo: () => Promise<WriteResult>;
  /** Chain mode: the registry call to sign and send. */
  chain: { functionName: RegistryFunction; args: readonly unknown[] };
}

/** Pulls the new record number or asset ID out of the receipt's events. */
function parseReceipt(receipt: TransactionReceipt) {
  const events = parseEventLogs({ abi: registryAbi, logs: receipt.logs });
  const registered = events.find((e) => e.eventName === "AssetRegistered");
  const added = events.find((e) => e.eventName === "RecordAdded");
  return {
    assetId: registered ? assetIdFromChain((registered.args as { assetId: bigint }).assetId) : undefined,
    index: added ? Number((added.args as { index: number }).index) : undefined,
  };
}

/**
 * Runs a write and tracks its transaction phase. Demo mode calls a server action with no wallet step.
 * Chain mode simulates first (so contract rejections surface before the wallet opens), asks the wallet
 * to sign, waits for the receipt, then refreshes the page's server data.
 */
export function useWrite() {
  const { mode, address } = useViewer();
  const router = useRouter();
  const [phase, setPhase] = useState<TxPhase>({ kind: "idle" });

  const run = useCallback(
    async (job: WriteJob) => {
      const logId = logTx({ label: job.label, assetId: job.assetId });
      const fail = (error: string) => {
        setPhase({ kind: "failed", error });
        settleTx(logId, { status: "failed", error });
      };
      const succeed = (tx: Hex, extra: { index?: number; assetId?: string }) => {
        setPhase({ kind: "confirmed", tx, ...extra });
        settleTx(logId, { status: "confirmed", tx, ...(extra.assetId && { assetId: extra.assetId }) });
      };

      if (mode === "demo") {
        setPhase({ kind: "submitted" });
        try {
          const res = await job.demo();
          if (res.ok) succeed(res.tx, { index: res.index, assetId: res.assetId });
          else fail(res.error);
        } catch {
          fail("Couldn’t reach BOT Chain. Nothing was recorded; try again.");
        }
        return;
      }

      if (!registryAddress || !address) {
        fail(registryAddress ? "Connect a wallet first." : "The Vestra contract address isn’t configured.");
        return;
      }
      setPhase({ kind: "wallet" });
      try {
        const { request } = await simulateContract(wagmiConfig, {
          address: registryAddress,
          abi: registryAbi,
          functionName: job.chain.functionName,
          args: job.chain.args,
          account: address,
          chainId: appChain.id,
        } as never);
        const hash = await writeContract(wagmiConfig, request as never);
        setPhase({ kind: "submitted", tx: hash });
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: appChain.id });
        if (receipt.status !== "success") {
          fail("The transaction was reverted on-chain. Nothing was recorded.");
          return;
        }
        succeed(hash, parseReceipt(receipt));
        router.refresh();
      } catch (e) {
        fail(describeWriteError(e));
      }
    },
    [mode, address, router],
  );

  const reset = useCallback(() => setPhase({ kind: "idle" }), []);
  const busy = phase.kind === "wallet" || phase.kind === "submitted";
  return { phase, run, reset, busy, demo: mode === "demo" };
}
