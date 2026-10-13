import { connection } from "next/server";
import type { Asset, LifecycleRecord } from "../types";
import { dataSource } from "../config";
import { nextBlock, store } from "./fixtures";
import { DEMO_REGISTRARS, DEMO_SERVICE_PROVIDERS } from "./personas";
import { ChainReadError, type MetadataStatus } from "./errors";
import * as chain from "./chain";

/**
 * Read layer. Pages only talk to these functions. With NEXT_PUBLIC_DATA_SOURCE=chain they read the
 * deployed VestraRegistry; otherwise they serve the labeled example data.
 */

export { ChainReadError, type MetadataStatus };

const onChain = dataSource === "chain";

/** Chain state is request-time data: never bake it into a prerendered shell. */
async function guard() {
  await connection();
  if (!onChain && process.env.FIXTURE_FAIL_READS === "1") throw new ChainReadError();
}

export async function getAsset(id: string): Promise<Asset | null> {
  await guard();
  if (onChain) return chain.getAsset(id);
  const asset = store.assets.get(id);
  return asset ? structuredClone(asset) : null;
}

/** Oldest first, as stored on-chain. */
export async function getRecords(id: string): Promise<LifecycleRecord[]> {
  await guard();
  if (onChain) return chain.getRecords(id);
  return structuredClone(store.records.get(id) ?? []);
}

export async function getMetadataStatus(id: string): Promise<MetadataStatus> {
  await guard();
  if (onChain) return chain.getMetadataStatus(id);
  return store.metadata.get(id) ?? "none";
}

export async function listAssets(): Promise<Asset[]> {
  await guard();
  if (onChain) return chain.listAssets();
  return structuredClone([...store.assets.values()]);
}

/** The latest block the read was made against, shown as a receipt on the verify page. */
export async function getChainHead(): Promise<{ block: number; timestamp: number }> {
  await guard();
  if (onChain) return chain.getChainHead();
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
  /** Live handovers proposed to this wallet. */
  incoming: Asset[];
  /** Records this wallet submitted, newest first, at most 10. */
  records: DashboardRecord[];
  /** Assets a service provider can add records to: everything not retired. */
  serviceable: Array<Pick<Asset, "id" | "name" | "status">>;
}

function buildDashboard(
  address: string,
  roles: DashboardData["roles"],
  entries: Array<{ asset: Asset; records: LifecycleRecord[] }>,
): DashboardData {
  const a = address.toLowerCase();
  const same = (x?: string) => x?.toLowerCase() === a;
  const now = Math.floor(Date.now() / 1000);
  const assets = entries.map((e) => e.asset);
  const records: DashboardRecord[] = entries.flatMap(({ asset, records }) =>
    records.filter((r) => same(r.submitter)).map((r) => ({ ...r, assetName: asset.name })),
  );
  records.sort((x, y) => y.timestamp - x.timestamp);
  const activity = (x: Asset) => x.lastRecord?.at ?? x.registeredAt;
  const byActivity = (list: Asset[]) => list.sort((x, y) => activity(y) - activity(x));
  return {
    address,
    roles,
    stewarded: byActivity(assets.filter((x) => same(x.steward))),
    registered: byActivity(assets.filter((x) => same(x.registrar))),
    incoming: assets.filter((x) => same(x.pendingHandover?.to) && x.pendingHandover!.expiresAt > now),
    records: records.slice(0, 10),
    serviceable: assets.filter((x) => x.status !== "RETIRED").map(({ id, name, status }) => ({ id, name, status })),
  };
}

/** Everything the dashboard needs for one wallet. Past pilot scale, an indexer serves this (ADR-001). */
export async function getDashboard(address: string): Promise<DashboardData> {
  await guard();
  if (onChain) {
    const [entries, roles] = await Promise.all([
      chain.listAssetsWithRecords(),
      chain.getRoles(address as `0x${string}`),
    ]);
    return buildDashboard(address, roles, entries);
  }
  const a = address.toLowerCase();
  const entries = [...store.assets.values()].map((asset) => ({
    asset,
    records: store.records.get(asset.id) ?? [],
  }));
  return structuredClone(
    buildDashboard(address, { registrar: DEMO_REGISTRARS.has(a), serviceProvider: DEMO_SERVICE_PROVIDERS.has(a) }, entries),
  );
}
