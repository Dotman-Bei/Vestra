import { connection } from "next/server";
import type { Asset, LifecycleRecord } from "../types";
import { dataSource } from "../config";
import { nextBlock, store } from "./fixtures";
import { DEMO_REGISTRARS, DEMO_SERVICE_PROVIDERS } from "./personas";

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

export interface DashboardRecord extends LifecycleRecord {
  assetName: string;
}

export interface DashboardData {
  address: string;
  roles: { registrar: boolean; serviceProvider: boolean };
  /** Assets this wallet is the registered steward of. */
  stewarded: Asset[];
  /** Assets this wallet registered. */
  registered: Asset[];
  /** Handovers proposed to this wallet that haven't been accepted or cancelled. */
  incoming: Asset[];
  /** Records this wallet submitted, newest first, at most 10. */
  records: DashboardRecord[];
  /** Assets a service provider can add records to: everything not retired. */
  serviceable: Array<Pick<Asset, "id" | "name" | "status">>;
}

/** Everything the dashboard needs for one wallet. A chain deployment serves this from the indexer. */
export async function getDashboard(address: string): Promise<DashboardData> {
  await guard();
  const a = address.toLowerCase();
  const assets = [...store.assets.values()];
  const same = (x?: string) => x?.toLowerCase() === a;
  const records: DashboardRecord[] = [];
  for (const [id, list] of store.records) {
    for (const r of list) if (same(r.submitter)) records.push({ ...r, assetName: store.assets.get(id)?.name ?? id });
  }
  records.sort((x, y) => y.timestamp - x.timestamp);
  const activity = (x: Asset) => x.lastRecord?.at ?? x.registeredAt;
  const byActivity = (list: Asset[]) => list.sort((x, y) => activity(y) - activity(x));
  return structuredClone({
    address,
    roles: { registrar: DEMO_REGISTRARS.has(a), serviceProvider: DEMO_SERVICE_PROVIDERS.has(a) },
    stewarded: byActivity(assets.filter((x) => same(x.steward))),
    registered: byActivity(assets.filter((x) => same(x.registrar))),
    incoming: assets.filter((x) => same(x.pendingHandover?.to)),
    records: records.slice(0, 10),
    serviceable: assets.filter((x) => x.status !== "RETIRED").map(({ id, name, status }) => ({ id, name, status })),
  });
}
