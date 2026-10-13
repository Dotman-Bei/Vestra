import { isAddress } from "viem";
import type { Hex } from "./types";

/** Categories for the pilot cohort (commercial solar and backup power). */
export const CATEGORIES = ["Solar inverter", "Battery storage", "Generator", "Charge controller", "Other"] as const;

export const LIMITS = { name: 80, type: 80, maker: 60, serial: 64, uri: 256 } as const;

export interface RegistrationInput {
  name: string;
  category: string;
  type: string;
  manufacturer?: string;
  model?: string;
  /** Present only when the registrar chose to publish the serial. */
  publicSerial?: string;
  /** keccak256(salt, serial), present only when the serial is kept private. The raw serial never leaves the browser. */
  serialCommitment?: Hex;
  steward: string;
  metadataUri?: string;
  evidenceHashes: Hex[];
  status: "REGISTERED" | "ACTIVE";
}

export type RegistrationErrors = Partial<Record<keyof RegistrationInput | "serial" | "saltSaved", string>>;

const URI = /^(https:\/\/|ipfs:\/\/)\S+$/;

/** The same checks run in the browser before review and again on write. */
export function validateRegistration(input: RegistrationInput): RegistrationErrors {
  const e: RegistrationErrors = {};
  const name = input.name.trim();
  if (!name) e.name = "Give the asset a display name.";
  else if (name.length > LIMITS.name) e.name = `Keep the name to ${LIMITS.name} characters.`;

  if (!(CATEGORIES as readonly string[]).includes(input.category)) e.category = "Choose a category.";

  const type = input.type.trim();
  if (!type) e.type = "Describe the type, for example “String inverter, 3-phase”.";
  else if (type.length > LIMITS.type) e.type = `Keep the type to ${LIMITS.type} characters.`;

  if ((input.manufacturer ?? "").length > LIMITS.maker) e.manufacturer = `Keep this to ${LIMITS.maker} characters.`;
  if ((input.model ?? "").length > LIMITS.maker) e.model = `Keep this to ${LIMITS.maker} characters.`;
  if ((input.publicSerial ?? "").length > LIMITS.serial) e.serial = `Keep the serial to ${LIMITS.serial} characters.`;
  if (input.publicSerial && input.serialCommitment) e.serial = "Publish the serial or keep it private, not both.";

  if (!isAddress(input.steward.trim())) e.steward = "Enter a full wallet address starting with 0x.";

  const uri = (input.metadataUri ?? "").trim();
  if (uri && !URI.test(uri)) e.metadataUri = "Use an https:// or ipfs:// link.";
  else if (uri.length > LIMITS.uri) e.metadataUri = "That link is too long.";

  if (input.status !== "REGISTERED" && input.status !== "ACTIVE") e.status = "Choose a starting status.";
  return e;
}
