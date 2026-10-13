import "server-only";
import { cache } from "react";
import { createPublicClient, http, BaseError, ContractFunctionRevertedError, type Hex } from "viem";
import { chain, registryAddress } from "../config";
import { appChain } from "../chain/definition";
import { registryAbi } from "../chain/abi";
import {
  assetIdFromChain,
  assetIdToChain,
  toAsset,
  toHandover,
  toRecord,
  type ChainAsset,
  type ChainHandover,
  type ChainRecord,
} from "../chain/codec";
import type { Address, Asset, LifecycleRecord } from "../types";
import { ChainReadError, type MetadataStatus } from "./errors";

/**
 * Reads the deployed VestraRegistry. Contract state is the source of truth; event logs are only used to
 * attach transaction hashes, and are skipped when the RPC doesn't serve them (BOT Chain mainnet).
 */

const client = createPublicClient({ chain: appChain, transport: http(chain.rpcUrl, { timeout: 10_000, retryCount: 1 }) });
const PAGE = 100n;
const LOG_TIMEOUT_MS = 2500;
const METADATA_TIMEOUT_MS = 4000;
const IPFS_GATEWAY = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/").replace(/\/?$/, "/");

function address() {
  if (!registryAddress) throw new ChainReadError("No registry address configured");
  return registryAddress;
}

async function read<T>(functionName: string, args: readonly unknown[] = []): Promise<T> {
  try {
    // The ABI is generated, so viem's literal types are available; the generic wrapper keeps call sites short.
    return (await client.readContract({ address: address(), abi: registryAbi, functionName, args } as never)) as T;
  } catch (e) {
    throw toReadError(e);
  }
}

function revertName(e: unknown) {
  if (e instanceof BaseError) {
    const revert = e.walk((err) => err instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) return revert.data?.errorName;
  }
  return undefined;
}

function toReadError(e: unknown) {
  if (revertName(e)) return e; // a contract-level answer, handled by the caller
  return new ChainReadError(e instanceof Error ? e.message : undefined);
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | undefined> {
  return Promise.race([p, new Promise<undefined>((r) => setTimeout(() => r(undefined), ms))]).catch(() => undefined);
}

// ---------------------------------------------------------------- tx hash enrichment

async function recordTxHashes(id: bigint, fromBlock: bigint): Promise<Map<number, Hex>> {
  const map = new Map<number, Hex>();
  const logs = await withTimeout(
    client.getContractEvents({
      address: address(),
      abi: registryAbi,
      eventName: "RecordAdded",
      args: { assetId: id },
      fromBlock,
      toBlock: "latest",
    }),
    LOG_TIMEOUT_MS,
  );
  for (const log of logs ?? []) {
    const index = Number((log.args as { index: number }).index);
    if (log.transactionHash) map.set(index, log.transactionHash);
  }
  return map;
}

async function registrationTx(id: bigint, block: bigint): Promise<Hex | undefined> {
  const logs = await withTimeout(
    client.getContractEvents({
      address: address(),
      abi: registryAbi,
      eventName: "AssetRegistered",
      args: { assetId: id },
      fromBlock: block,
      toBlock: block,
    }),
    LOG_TIMEOUT_MS,
  );
  return logs?.[0]?.transactionHash ?? undefined;
}

// ---------------------------------------------------------------- reads

async function chainRecords(id: bigint, count: number): Promise<ChainRecord[]> {
  const pages: Promise<ChainRecord[]>[] = [];
  for (let offset = 0n; offset < BigInt(count); offset += PAGE) {
    pages.push(read<ChainRecord[]>("getRecords", [id, offset, PAGE]));
  }
  return (await Promise.all(pages)).flat();
}

async function assetById(id: bigint, opts: { withTx: boolean }): Promise<{ asset: Asset; records: LifecycleRecord[] } | null> {
  let raw: ChainAsset;
  try {
    raw = await read<ChainAsset>("getAsset", [id]);
  } catch (e) {
    if (revertName(e) === "UnknownAsset") return null;
    throw toReadError(e);
  }
  const [handover, evidence, list, txs, regTx] = await Promise.all([
    read<ChainHandover>("getHandover", [id]),
    read<Hex[]>("getRegistrationEvidence", [id]),
    chainRecords(id, raw.recordCount),
    opts.withTx ? recordTxHashes(id, raw.registeredBlock) : Promise.resolve(new Map<number, Hex>()),
    opts.withTx ? registrationTx(id, raw.registeredBlock) : Promise.resolve(undefined),
  ]);
  const assetId = assetIdFromChain(id);
  const records = list.map((r, i) => toRecord(assetId, i + 1, r, txs.get(i + 1)));
  const asset = toAsset(id, raw, {
    handover: toHandover(handover),
    evidence,
    lastRecord: records.at(-1),
    registeredTx: regTx,
  });
  return { asset, records };
}

/** One read per asset per request, shared by getAsset, getRecords and getMetadataStatus. */
const passport = cache((n: bigint) => assetById(n, { withTx: true }));

export async function getAsset(id: string): Promise<Asset | null> {
  const n = assetIdToChain(id);
  if (n === null) return null;
  return (await passport(n))?.asset ?? null;
}

export async function getRecords(id: string): Promise<LifecycleRecord[]> {
  const n = assetIdToChain(id);
  if (n === null) return [];
  return (await passport(n))?.records ?? [];
}

/** Every asset with its records. Pilot scale; an indexer replaces this past a few hundred assets (ADR-001). */
export async function listAssetsWithRecords(): Promise<Array<{ asset: Asset; records: LifecycleRecord[] }>> {
  const count = await read<bigint>("assetCount");
  const ids = Array.from({ length: Number(count) }, (_, i) => BigInt(i + 1));
  const all = await Promise.all(ids.map((id) => assetById(id, { withTx: false })));
  return all.filter((x): x is NonNullable<typeof x> => x !== null);
}

export async function listAssets(): Promise<Asset[]> {
  return (await listAssetsWithRecords()).map((x) => x.asset);
}

export async function getChainHead() {
  try {
    const block = await client.getBlock({ blockTag: "latest" });
    return { block: Number(block.number), timestamp: Number(block.timestamp) };
  } catch (e) {
    throw new ChainReadError(e instanceof Error ? e.message : undefined);
  }
}

export async function getRoles(account: Address) {
  const [registrarRole, serviceRole] = await Promise.all([
    read<Hex>("REGISTRAR_ROLE"),
    read<Hex>("SERVICE_PROVIDER_ROLE"),
  ]);
  const [registrar, serviceProvider] = await Promise.all([
    read<boolean>("hasRole", [registrarRole, account]),
    read<boolean>("hasRole", [serviceRole, account]),
  ]);
  return { registrar, serviceProvider };
}

// ---------------------------------------------------------------- metadata

async function sha256(buf: ArrayBuffer): Promise<Hex> {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return `0x${[...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** Loads the linked metadata and, when the asset records a hash, checks the content against it. */
export async function getMetadataStatus(id: string): Promise<MetadataStatus> {
  const asset = await getAsset(id);
  if (!asset?.metadataUri) return "none";
  const url = asset.metadataUri.startsWith("ipfs://")
    ? `${IPFS_GATEWAY}${asset.metadataUri.slice("ipfs://".length)}`
    : asset.metadataUri;
  if (!/^https:\/\//.test(url)) return "unavailable";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(METADATA_TIMEOUT_MS), cache: "no-store" });
    if (!res.ok) return "unavailable";
    if (!asset.metadataHash) return "available";
    return (await sha256(await res.arrayBuffer())) === asset.metadataHash.toLowerCase() ? "available" : "mismatch";
  } catch {
    return "unavailable";
  }
}
