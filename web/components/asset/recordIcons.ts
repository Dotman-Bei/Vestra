import {
  ArrowsLeftRightIcon,
  ArchiveIcon,
  ClipboardTextIcon,
  PencilSimpleLineIcon,
  PlugsConnectedIcon,
  ShieldCheckIcon,
  SwapIcon,
  WarningIcon,
  WrenchIcon,
} from "@phosphor-icons/react/ssr";
import type { RecordType } from "@/lib/types";

export const RECORD_ICON: Record<RecordType, typeof WrenchIcon> = {
  INSPECTION: ClipboardTextIcon,
  MAINTENANCE: WrenchIcon,
  WARRANTY: ShieldCheckIcon,
  INSTALLATION: PlugsConnectedIcon,
  INCIDENT: WarningIcon,
  STATUS_CHANGE: SwapIcon,
  HANDOVER: ArrowsLeftRightIcon,
  RETIREMENT: ArchiveIcon,
  CORRECTION: PencilSimpleLineIcon,
};

/** Record types whose content is a participant's statement about the physical world. */
export const CLAIM_TYPES: ReadonlySet<RecordType> = new Set([
  "INSPECTION",
  "MAINTENANCE",
  "WARRANTY",
  "INSTALLATION",
  "INCIDENT",
  "RETIREMENT",
  "CORRECTION",
]);
