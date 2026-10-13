import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] font-medium " +
  "transition-[background-color,border-color,color,transform] duration-150 ease-out " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hover",
  secondary: "bg-surface text-ink border border-line-strong hover:border-muted",
  ghost: "text-accent hover:underline underline-offset-4 decoration-1",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-[15px] pointer-coarse:h-11",
  lg: "h-12 px-5 text-base",
  icon: "size-10 shrink-0 [&_svg]:shrink-0 pointer-coarse:size-11",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(base, variants[variant], variant === "ghost" ? "h-auto px-0" : sizes[size], extra);
}
