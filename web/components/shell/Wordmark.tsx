import Link from "next/link";

/** The Vestra mark: a rimmed square with a mono V, like a stamped plate. */
export function VestraMark({ size = 24 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.55) }}
      className="inline-flex shrink-0 items-center justify-center rounded-[5px] border-[1.5px] border-current font-mono leading-none font-semibold text-ink"
    >
      V
    </span>
  );
}

export function Wordmark() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 rounded-[6px] text-[18px] font-semibold tracking-[-0.01em] text-ink"
    >
      <VestraMark />
      Vestra
    </Link>
  );
}
