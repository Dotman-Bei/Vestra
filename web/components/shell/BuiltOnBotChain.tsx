import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { chain } from "@/lib/config";
import { cn } from "@/lib/cn";

const BOT_CHAIN_SITE = "https://www.botchain.ai/en/";
/** The explorer for the network the app runs on; BOT Mainnet's when none is configured. */
const EXPLORER = chain.explorerUrl ?? "https://scan.botchain.ai";

const linkClass =
  "inline-flex items-center gap-1 font-medium text-ink underline-offset-4 hover:text-accent hover:underline";

/** Footer row naming BOT Chain with links to its official website and explorer. */
export function BuiltOnBotChain({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 text-[14px] leading-5 sm:flex-row sm:items-center sm:gap-6", className)}>
      <p className="text-muted">
        Built on <span className="font-semibold text-ink">BOT Chain</span>
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        <li>
          <a href={BOT_CHAIN_SITE} target="_blank" rel="noreferrer" className={linkClass}>
            BOT Chain website
            <ArrowUpRightIcon size={13} aria-hidden />
          </a>
        </li>
        <li>
          <a href={EXPLORER} target="_blank" rel="noreferrer" className={linkClass}>
            BOT Chain Explorer
            <ArrowUpRightIcon size={13} aria-hidden />
          </a>
        </li>
      </ul>
    </div>
  );
}
