"use client";

import { useSyncExternalStore } from "react";
import type { Hex } from "@/lib/types";

/** Transactions sent from this browser session, newest first. Kept in sessionStorage. */
export interface TxEntry {
  id: string;
  label: string;
  assetId?: string;
  status: "pending" | "confirmed" | "failed";
  tx?: Hex;
  error?: string;
  /** Unix ms */
  at: number;
}

const KEY = "vestra-tx-log";
const EMPTY: TxEntry[] = [];
let entries: TxEntry[] | null = null;
const listeners = new Set<() => void>();

function load(): TxEntry[] {
  if (entries) return entries;
  try {
    entries = JSON.parse(sessionStorage.getItem(KEY) ?? "[]") as TxEntry[];
  } catch {
    entries = [];
  }
  return entries;
}

function save(next: TxEntry[]) {
  entries = next.slice(0, 20);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Not persisted; still shown for this page view.
  }
  listeners.forEach((l) => l());
}

export function logTx(entry: Omit<TxEntry, "id" | "at" | "status">) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  save([{ ...entry, id, at: Date.now(), status: "pending" }, ...load()]);
  return id;
}

export function settleTx(id: string, patch: Pick<TxEntry, "status"> & Partial<Pick<TxEntry, "tx" | "error" | "assetId">>) {
  save(load().map((e) => (e.id === id ? { ...e, ...patch } : e)));
}

export function useTxLog() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    load,
    () => EMPTY,
  );
}
