import { InfoIcon } from "@phosphor-icons/react/ssr";
import { dataSource } from "@/lib/config";

/** Shown on every page while the app reads the fixture adapter instead of the chain. */
export function DemoBanner() {
  if (dataSource !== "fixtures") return null;
  return (
    <div className="border-b border-line bg-sunk">
      <p className="mx-auto flex max-w-[1200px] items-start gap-2 px-4 py-2 text-[13px] leading-5 text-ink md:items-center md:px-8">
        <InfoIcon size={16} aria-hidden className="mt-0.5 shrink-0 text-muted md:mt-0" />
        <span>
          <strong className="font-semibold">Demo data.</strong> These records are examples and are not on BOT
          Chain.
        </span>
      </p>
    </div>
  );
}
