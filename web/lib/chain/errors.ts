import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";
import { chain } from "../config";

const FIELD: Record<string, string> = {
  name: "display name",
  category: "category",
  assetType: "type",
  manufacturer: "manufacturer",
  model: "model",
  publicSerial: "serial number",
  serial: "serial number",
  steward: "steward wallet",
  initialStatus: "starting status",
  metadataUri: "metadata link",
  evidenceHashes: "evidence list",
  summary: "summary",
  documentUri: "document link",
  providerId: "provider reference",
};

/** Plain sentences for every VestraRegistry custom error. */
const REVERT: Record<string, (args: readonly unknown[]) => string> = {
  UnknownAsset: () => "No asset with this ID is registered.",
  NotAuthorized: () => "Your wallet isn’t allowed to do this on this asset.",
  InvalidInput: ([field]) => `The ${FIELD[String(field)] ?? String(field)} isn’t valid. Check it and try again.`,
  InvalidStatusTransition: () => "That status change isn’t allowed from the asset’s current status.",
  HandoverRecordsUseHandoverFlow: () => "Handover records are created by accepting a handover.",
  InvalidCorrectionTarget: () =>
    "You can only correct a record your wallet submitted that hasn’t already been corrected.",
  AssetRetired: () => "This asset is retired, so it can’t be handed over.",
  NotSteward: () => "Only the registered steward can do this.",
  InvalidRecipient: () => "The recipient must be a different wallet from the current steward.",
  InvalidExpiry: () => "Choose an expiry within the next 30 days.",
  HandoverAlreadyPending: () => "A handover for this asset is already waiting to be accepted.",
  NoPendingHandover: () => "There’s no open handover for this asset.",
  NotRecipient: () => "Only the nominated recipient can accept this handover.",
  HandoverExpired: () => "This handover has expired. Ask the steward to propose it again.",
  StaleHandover: () => "This proposal is out of date. Ask the steward to propose it again.",
  AccessControlUnauthorizedAccount: () => "Your wallet doesn’t have the role needed for this.",
};

/** Turns any wallet, RPC or contract error into one sentence a person can act on. */
export function describeWriteError(e: unknown): string {
  if (e instanceof BaseError) {
    if (e.walk((err) => err instanceof UserRejectedRequestError) || /rejected|denied/i.test(e.shortMessage)) {
      return "You declined the transaction in your wallet. Nothing was recorded.";
    }
    const revert = e.walk((err) => err instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError && revert.data?.errorName) {
      const describe = REVERT[revert.data.errorName];
      if (describe) return describe(revert.data.args ?? []);
    }
    if (/insufficient funds/i.test(e.message)) {
      return `Your wallet doesn’t have enough ${chain.nativeSymbol} to pay the network fee.`;
    }
    if (/chain mismatch|does not match the target chain|switch chain/i.test(e.message)) {
      return `Switch your wallet to ${chain.name} and try again.`;
    }
  }
  return "Couldn’t reach BOT Chain. Nothing was recorded; try again.";
}
