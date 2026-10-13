import {
  ArchiveIcon,
  CheckCircleIcon,
  BinocularsIcon,
  TagIcon,
  WarningOctagonIcon,
  WrenchIcon,
} from "@phosphor-icons/react/ssr";
import type { CSSProperties } from "react";
import type { AssetStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/format";
import { cn } from "@/lib/cn";

const STYLE: Record<AssetStatus, { style: CSSProperties; Icon: typeof TagIcon }> = {
  REGISTERED: {
    style: { color: "var(--st-registered-fg)", background: "var(--st-registered-bg)" },
    Icon: TagIcon,
  },
  ACTIVE: {
    style: { color: "var(--st-active-fg)", background: "var(--st-active-bg)" },
    Icon: CheckCircleIcon,
  },
  UNDER_MAINTENANCE: {
    style: { color: "var(--st-maint-fg)", background: "var(--st-maint-bg)" },
    Icon: WrenchIcon,
  },
  REPORTED_DAMAGED: {
    style: { color: "var(--st-danger-fg)", background: "var(--st-danger-bg)" },
    Icon: WarningOctagonIcon,
  },
  REPORTED_LOST: {
    style: { color: "var(--st-danger-fg)", boxShadow: "inset 0 0 0 1px var(--st-danger-fg)" },
    Icon: BinocularsIcon,
  },
  RETIRED: {
    style: { color: "var(--ink-muted)", boxShadow: "inset 0 0 0 1px var(--line-strong)" },
    Icon: ArchiveIcon,
  },
};

export function StatusChip({ status, className }: { status: AssetStatus; className?: string }) {
  const { style, Icon } = STYLE[status];
  return (
    <span
      style={style}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-[13px] font-medium leading-none whitespace-nowrap",
        className,
      )}
    >
      <Icon size={15} weight="bold" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
