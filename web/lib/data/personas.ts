import type { Address } from "../types";

/**
 * Example wallets used by the fixture adapter. In chain mode none of this is
 * used: the viewer is the connected wallet and roles are read from the contract.
 */
export const DEMO_WALLETS = {
  registrar: "0x9b10d47e2a6c8f13b5e9a0d2c7f4e8b1a3c6e7d2",
  stewardA: "0x4f2a8c1d9e07b3a5c6f18d2e40b7a9c3e5d191c3",
  stewardB: "0x2d71f0a9c4e83b6d1a5f7e92c0b4d8a6e1f35b08",
  service: "0xc71e09b4d2a85f3e6b1c7d9a0e4f2b8c5d3a6e1f",
} as const satisfies Record<string, Address>;

export const DEMO_REGISTRARS: ReadonlySet<string> = new Set([DEMO_WALLETS.registrar]);
export const DEMO_SERVICE_PROVIDERS: ReadonlySet<string> = new Set([DEMO_WALLETS.service]);

export type PersonaId = "visitor" | keyof typeof DEMO_WALLETS;

export const PERSONAS: Array<{ id: PersonaId; label: string; address: Address | null }> = [
  { id: "visitor", label: "Visitor (no wallet)", address: null },
  { id: "registrar", label: "Registrar", address: DEMO_WALLETS.registrar },
  { id: "stewardA", label: "Steward, site operator", address: DEMO_WALLETS.stewardA },
  { id: "stewardB", label: "Steward, incoming operator", address: DEMO_WALLETS.stewardB },
  { id: "service", label: "Service provider", address: DEMO_WALLETS.service },
];
