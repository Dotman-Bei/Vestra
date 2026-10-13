import Link from "next/link";
import { explorerAddress, registryAddress, repoUrl } from "@/lib/config";
import { truncateAddress } from "@/lib/format";
import { Wordmark } from "./Wordmark";
import { ThemeToggle } from "./ThemeToggle";
import { NAV_LINKS } from "./nav";

const linkClass = "text-muted hover:text-ink underline-offset-4 hover:underline";

export function SiteFooter() {
  const contractLink = registryAddress ? explorerAddress(registryAddress) : null;

  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-12 md:gap-8 md:px-8">
        <div className="md:col-span-6">
          <Wordmark />
          <p className="mt-4 max-w-[52ch] text-[15px] leading-6 text-ink">
            Vestra is a lifecycle record for real-world equipment on BOT Chain.
          </p>
          <p className="mt-3 max-w-[52ch] text-[14px] leading-[22px] text-muted">
            A Vestra record shows what authorized wallets submitted and when. It is not proof of legal ownership,
            physical condition, location or value.
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <ul className="space-y-2.5 text-[15px]">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <ul className="space-y-2.5 text-[15px]">
            {repoUrl && (
              <li>
                <a href={repoUrl} target="_blank" rel="noreferrer" className={linkClass}>
                  Source code
                </a>
              </li>
            )}
            <li>
              {registryAddress && contractLink ? (
                <a href={contractLink} target="_blank" rel="noreferrer" className={linkClass}>
                  Contract <span className="font-mono text-[14px]">{truncateAddress(registryAddress)}</span>
                </a>
              ) : (
                <span className="text-muted">Contract not yet deployed</span>
              )}
            </li>
            <li className="text-muted">MIT License</li>
          </ul>
          <div className="mt-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
