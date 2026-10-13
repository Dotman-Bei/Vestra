import { connection } from "next/server";
import type { Asset, LifecycleRecord } from "../types";
import { dataSource } from "../config";
import { nextBlock, store } from "./fixtures";

/**
 * Read layer. Pages only talk to these functions, so swapping the fixture
 * adapter for chain reads doesn't touch any UI.
 */

/** The chain (or indexer) couldn't be reached. Says nothing about the record itself. */
export class ChainReadError extends Error {
  constructor(message = "Couldn’t reach BOT Chain") {
    super(message);
    this.name = "ChainReadError";
  }
}

export type MetadataStatus = "available" | "unavailable" | "none";

/** Chain state is request-time data: never bake it into a prerendered shell. */
async function guard() {
  await connection();
  if (dataSource === "chain") {
    // The registry contract isn't deployed yet; chain reads land with it.
    throw new ChainReadError("Chain reads are not implemented yet");
  }
  if (process.env.FIXTURE_FAIL_READS === "1") throw new ChainReadError();
}

export async function getAsset(id: string): Promise<Asset | null> {
  await guard();
  const asset = store.assets.get(id);
  return asset ? structuredClone(asset) : null;
}

/** Oldest first, as stored on-chain. */
export async function getRecords(id: string): Promise<LifecycleRecord[]> {
  await guard();
  return structuredClone(store.records.get(id) ?? []);
}

export async function getMetadataStatus(id: string): Promise<MetadataStatus> {
  await guard();
  return store.metadata.get(id) ?? "none";
}

export async function listAssets(): Promise<Asset[]> {
  await guard();
  return structuredClone([...store.assets.values()]);
}

/** The latest block the read was made against, shown as a receipt on the verify page. */
export async function getChainHead(): Promise<{ block: number; timestamp: number }> {
  await guard();
  return nextBlock();
}
