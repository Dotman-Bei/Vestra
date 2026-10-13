import { ChatTextIcon, LinkSimpleIcon, QuestionIcon } from "@phosphor-icons/react/ssr";
import type { ProvenanceKind } from "@/lib/types";
import { cn } from "@/lib/cn";

const KINDS = {
  onchain: { label: "On-chain", Icon: LinkSimpleIcon },
  claim: { label: "Participant claim", Icon: ChatTextIcon },
  external: { label: "Not verifiable by Vestra", Icon: QuestionIcon },
} as const;

/** Says where a value comes from: chain state, a participant's claim, or outside Vestra's view. */
export function ProvenanceTag({ kind, className }: { kind: ProvenanceKind; className?: string }) {
  const { label, Icon } = KINDS[kind];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[13px] leading-[18px] text-muted", className)}>
      <Icon size={14} aria-hidden />
      {label}
    </span>
  );
}
