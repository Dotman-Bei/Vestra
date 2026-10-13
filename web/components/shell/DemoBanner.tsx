import { InfoIcon } from "@phosphor-icons/react/ssr";
import { dataSource } from "@/lib/config";
import { PersonaSwitcher } from "./PersonaSwitcher";

/** Shown on every page while the app reads the fixture adapter instead of the chain. */
export function DemoBanner() {
  if (dataSource !== "fixtures") return null;
  return (
    <div className="border-b border-line bg-sunk">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-8">
        <p className="flex items-start gap-2 text-[13px] leading-5 text-ink sm:items-center">
          <InfoIcon size={16} aria-hidden className="mt-0.5 shrink-0 text-muted sm:mt-0" />
          <span>
            <strong className="font-semibold">Demo data.</strong> These records are examples and are not on BOT
            Chain.
          </span>
        </p>
        <PersonaSwitcher />
      </div>
    </div>
  );
}
