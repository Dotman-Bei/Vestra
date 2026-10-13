import type { Address, Asset, Handover, Hex, LifecycleRecord } from "../types";
import { ASSET_STATUSES, RECORD_TYPES, type AssetStatus, type RecordType } from "../types";

/**
 * Converts between the registry contract's ABI shapes and the app's types.
 * The contract's Status and RecordType enums are declared in the same order as
 * ASSET_STATUSES and RECORD_TYPES, so they map by index.
 */

const ZERO_HASH = `0x${"0".repeat(64)}`;
const ZERO_ADDRESS = `0x${"0".repeat(40)}`;

export const statusFromChain = (n: number): AssetStatus => ASSET_STATUSES[n];
export const statusToChain = (s: AssetStatus) => ASSET_STATUSES.indexOf(s);
export const recordTypeFromChain = (n: number): RecordType => RECORD_TYPES[n];
export const recordTypeToChain = (t: RecordType) => RECORD_TYPES.indexOf(t);

/** "VST-0007" -> 7n. Returns null for anything that isn't a positive asset number. */
export function assetIdToChain(id: string): bigint | null {
  const m = id.match(/^VST-(\d+)$/);
  if (!m) return null;
  const n = BigInt(m[1]);
  return n > 0n ? n : null;
}

export function assetIdFromChain(n: bigint | number): string {
  return `VST-${n.toString().padStart(4, "0")}`;
}

const optHash = (h: Hex) => (h === ZERO_HASH ? undefined : h);
const optText = (s: string) => (s === "" ? undefined : s);

export interface ChainAsset {
  name: string;
  category: string;
  assetType: string;
  manufacturer: string;
  model: string;
  publicSerial: string;
  serialCommitment: Hex;
  registrar: Address;
  steward: Address;
  status: number;
  registeredAt: bigint;
  registeredBlock: bigint;
  metadataUri: string;
  metadataHash: Hex;
  recordCount: number;
}

export interface ChainRecord {
  recordType: number;
  newStatus: number;
  submitter: Address;
  newSteward: Address;
  timestamp: bigint;
  blockNumber: bigint;
  supersedes: number;
  supersededBy: number;
  evidenceHash: Hex;
  summary: string;
  documentUri: string;
  providerId: string;
}

export interface ChainHandover {
  from: Address;
  to: Address;
  expiresAt: bigint;
  proposedAt: bigint;
  evidenceHash: Hex;
}

export function toHandover(h: ChainHandover): Handover | undefined {
  if (h.to === ZERO_ADDRESS) return undefined;
  return { from: h.from, to: h.to, expiresAt: Number(h.expiresAt), evidenceHash: optHash(h.evidenceHash) };
}

export function toRecord(assetId: string, index: number, r: ChainRecord, tx?: Hex): LifecycleRecord {
  const type = recordTypeFromChain(r.recordType);
  return {
    index,
    assetId,
    type,
    submitter: r.submitter,
    timestamp: Number(r.timestamp),
    block: Number(r.blockNumber),
    tx,
    summary: r.summary,
    evidenceHash: optHash(r.evidenceHash),
    documentUri: optText(r.documentUri),
    providerId: optText(r.providerId),
    supersedes: r.supersedes || undefined,
    supersededBy: r.supersededBy || undefined,
    newStatus: type === "STATUS_CHANGE" || type === "RETIREMENT" ? statusFromChain(r.newStatus) : undefined,
    newSteward: r.newSteward === ZERO_ADDRESS ? undefined : r.newSteward,
  };
}

export function toAsset(
  id: bigint,
  a: ChainAsset,
  extra: { handover?: Handover; evidence: Hex[]; lastRecord?: LifecycleRecord; registeredTx?: Hex },
): Asset {
  return {
    id: assetIdFromChain(id),
    name: a.name,
    category: a.category,
    type: a.assetType,
    manufacturer: optText(a.manufacturer),
    model: optText(a.model),
    publicSerial: optText(a.publicSerial) ?? null,
    serialCommitment: optHash(a.serialCommitment),
    steward: a.steward,
    registrar: a.registrar,
    status: statusFromChain(a.status),
    registeredAt: Number(a.registeredAt),
    registeredBlock: Number(a.registeredBlock),
    registeredTx: extra.registeredTx,
    metadataUri: optText(a.metadataUri),
    metadataHash: optHash(a.metadataHash),
    evidenceHashes: extra.evidence,
    recordCount: a.recordCount,
    lastRecord: extra.lastRecord ? { type: extra.lastRecord.type, at: extra.lastRecord.timestamp } : undefined,
    pendingHandover: extra.handover,
  };
}
