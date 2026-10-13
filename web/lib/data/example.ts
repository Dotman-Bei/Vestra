import type { Asset, LifecycleRecord } from "../types";

/**
 * The example passport shown on the Home page. It is always captioned
 * "Example record. Not a registered asset." and never appears in the registry.
 * The contract never assigns ID 0, so VST-0000 can't collide with a real asset.
 */
export const EXAMPLE_ASSET: Asset = {
  id: "VST-0000",
  name: "Rooftop inverter, Block C",
  category: "Solar inverter",
  type: "String inverter, 3-phase",
  manufacturer: "Halden Energy",
  model: "HX-50",
  publicSerial: "HX50-2291-0417",
  steward: "0x4f2a8c1d9e07b3a5c6f18d2e40b7a9c3e5d191c3",
  registrar: "0x9b10d47e2a6c8f13b5e9a0d2c7f4e8b1a3c6e7d2",
  status: "ACTIVE",
  registeredAt: 1772524800,
  registeredBlock: 4_188_302,
  registeredTx: "0x3a9f1c7e2b8d4a6f0e5c9b3d7a1f8e2c4b6d0a9e3f7c1b5d8a2e6f4c0b9d3a7e",
  metadataUri: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  metadataHash: "0x7c1e4f9a2b6d8e0c3a5f7b9d1e4c6a8f0b2d4e6a8c0f2b4d6e8a0c2f4b6da40b",
  evidenceHashes: [],
  recordCount: 6,
  lastRecord: { type: "INSPECTION", at: 1788393600 },
};

export const EXAMPLE_CLAIM: LifecycleRecord = {
  index: 6,
  assetId: "VST-0000",
  type: "INSPECTION",
  submitter: "0xc71e09b4d2a85f3e6b1c7d9a0e4f2b8c5d3a6e1f",
  timestamp: 1788393600,
  block: 4_712_118,
  tx: "0x8e2d6b0f4a1c9e7d3b5f2a8c6e0d4b9f1a7c3e5d2b8f6a0c4e9d1b7f3a5c2e8d",
  summary: "Annual inspection. Terminals torqued, fans cleaned, no faults logged.",
  evidenceHash: "0x51c9e3a7f0b2d4c6e8a1f3b5d7c9e0a2f4b6d8c1e3a5f7b9d0c2e4a6f8b1d3c5",
};
