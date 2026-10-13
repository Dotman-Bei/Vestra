import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

/** Empty, not-found and error states: icon, one heading, one sentence, one action. */
export function StateMessage({
  icon: IconCmp,
  title,
  children,
  action,
  className,
  as: Heading = "h2",
}: {
  icon: Icon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("max-w-[52ch]", className)}>
      <IconCmp size={28} aria-hidden className="text-muted" />
      <Heading className="mt-4 text-[22px] leading-7 font-semibold tracking-[-0.01em] text-ink">{title}</Heading>
      {children && <div className="mt-2 text-[16px] leading-[26px] text-muted">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
