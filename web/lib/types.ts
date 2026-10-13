export type Address = `0x${string}`;
export type Hex = `0x${string}`;

export const ASSET_STATUSES = [
  "REGISTERED",
  "ACTIVE",
  "UNDER_MAINTENANCE",
  "REPORTED_DAMAGED",
  "REPORTED_LOST",
  "RETIRED",
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const RECORD_TYPES = [
  "INSPECTION",
  "MAINTENANCE",
  "WARRANTY",
  "INSTALLATION",
  "INCIDENT",
  "STATUS_CHANGE",
  "HANDOVER",
  "RETIREMENT",
  "CORRECTION",
] as const;
export type RecordType = (typeof RECORD_TYPES)[number];

export type ProvenanceKind = "onchain" | "claim" | "external";

export interface Handover {
  from: Address;
  to: Address;
  /** Unix seconds */
  expiresAt: number;
  evidenceHash?: Hex;
  /** Unknown when the chain was read without event logs. */
  proposedTx?: Hex;
}

export interface Asset {
  /** Display ID, e.g. VST-0007 */
  id: string;
  name: string;
  category: string;
  type: string;
  manufacturer?: string;
  model?: string;
  /** Null when the registrar chose to store only a serial commitment. */
  publicSerial: string | null;
  serialCommitment?: Hex;
  steward: Address;
  registrar: Address;
  status: AssetStatus;
  /** Unix seconds */
  registeredAt: number;
  registeredBlock: number;
  /** Unknown when the chain was read without event logs; show the block instead. */
  registeredTx?: Hex;
  metadataUri?: string;
  metadataHash?: Hex;
  evidenceHashes: Hex[];
  recordCount: number;
  lastRecord?: { type: RecordType; at: number };
  pendingHandover?: Handover;
}

export interface LifecycleRecord {
  /** 1-based position in the asset's history */
  index: number;
  assetId: string;
  type: RecordType;
  submitter: Address;
  /** Unix seconds, from the block */
  timestamp: number;
  block: number;
  /** Unknown when the chain was read without event logs; show the block instead. */
  tx?: Hex;
  summary: string;
  evidenceHash?: Hex;
  documentUri?: string;
  providerId?: string;
  /** Index of the record this one corrects */
  supersedes?: number;
  /** Index of the record that corrected this one */
  supersededBy?: number;
  newStatus?: AssetStatus;
  newSteward?: Address;
}
