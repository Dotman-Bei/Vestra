import Link from "next/link";

/**
 * The Vestra mark: an equipment tag (rounded plate with a punched eyelet) with a V cut through it.
 * One even-odd path on a 64 grid, so the eyelet and V are true knockouts. Source: public/brand/.
 */
export const MARK_PATH =
  "M14 0H50A14 14 0 0 1 64 14V50A14 14 0 0 1 50 64H14A14 14 0 0 1 0 50V14A14 14 0 0 1 14 0Z" +
  "M8.5 12.5A4 4 0 1 0 16.5 12.5A4 4 0 1 0 8.5 12.5Z" +
  "M15 20H24L32 39.5L40 20H49L36.4 50H27.6Z";

export function VestraMark({ size = 24, color = "var(--accent)" }: { size?: number; color?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 64 64" className="shrink-0">
      <path fill={color} fillRule="evenodd" d={MARK_PATH} />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link
      href="/"
      aria-label="Vestra home"
      className="inline-flex items-center gap-2.5 rounded-[6px] text-[18px] font-semibold tracking-[-0.01em] text-ink"
    >
      <VestraMark size={26} />
      Vestra
    </Link>
  );
}
