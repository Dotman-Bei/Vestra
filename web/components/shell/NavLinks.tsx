"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "./nav";

export function NavLinks() {
  return <NavList pathname={usePathname()} />;
}

/** Rendered while the path is unknown (prerendered shell of dynamic routes). */
export function NavLinksFallback() {
  return <NavList pathname="" />;
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <ul className="flex items-center gap-1">
      {NAV_LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-[6px] px-3 text-[15px] transition-colors",
                active ? "font-medium text-accent" : "text-muted hover:text-ink",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
