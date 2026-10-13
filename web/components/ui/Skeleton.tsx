import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-[6px] bg-sunk motion-reduce:animate-none", className)} />;
}
