"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/z";
import { NAV_LINKS } from "./nav";
import { Wordmark } from "./Wordmark";

export function MobileMenu() {
  return <Menu pathname={usePathname()} />;
}

export function MobileMenuFallback() {
  return <Menu pathname="" />;
}

function Menu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="inline-flex size-10 items-center justify-center rounded-[6px] text-ink hover:bg-sunk"
      >
        <ListIcon size={22} aria-hidden />
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 bg-[rgb(14_16_19/0.4)]"
                style={{ zIndex: Z.overlay }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed inset-y-0 right-0 flex w-[min(360px,88vw)] flex-col bg-bg shadow-float"
                style={{ zIndex: Z.overlay }}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
              >
                <div className="flex h-16 items-center justify-between border-b border-line px-4">
                  <Dialog.Title asChild>
                    <span onClick={() => setOpen(false)}>
                      <Wordmark />
                    </span>
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label="Close menu"
                    className="inline-flex size-10 items-center justify-center rounded-[6px] text-ink hover:bg-sunk"
                  >
                    <XIcon size={22} aria-hidden />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">Site navigation</Dialog.Description>
                <nav className="px-2 py-4">
                  <ul>
                    {NAV_LINKS.map(({ href, label }) => {
                      const active = pathname === href || pathname.startsWith(`${href}/`);
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex h-12 items-center rounded-[6px] px-3 text-[17px]",
                              active ? "font-medium text-accent" : "text-ink hover:bg-sunk",
                            )}
                          >
                            {label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
