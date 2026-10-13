"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/z";

function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );
}

const SPRING = { type: "spring", stiffness: 380, damping: 36 } as const;

/**
 * Right-hand drawer on desktop, bottom sheet on mobile. `variant="dialog"`
 * centers it on desktop instead (handover confirmations).
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = "drawer",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  variant?: "drawer" | "dialog";
}) {
  const desktop = useIsDesktop();
  const centered = desktop && variant === "dialog";

  const motionProps = !desktop
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
    : centered
      ? { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.97 } }
      : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 bg-[rgb(14_16_19/0.45)]"
                style={{ zIndex: Z.overlay }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <div
              className={cn("pointer-events-none fixed inset-0 flex", centered ? "items-center justify-center p-6" : desktop ? "justify-end" : "items-end")}
              style={{ zIndex: Z.overlay }}
            >
              <Dialog.Content asChild forceMount>
                <motion.div
                  {...motionProps}
                  transition={centered ? { duration: 0.2, ease: [0.16, 1, 0.3, 1] } : SPRING}
                  className={cn(
                    "pointer-events-auto flex flex-col bg-bg shadow-float focus:outline-none",
                    centered && "max-h-[85dvh] w-full max-w-[520px] rounded-[10px] border border-line",
                    desktop && !centered && "h-full w-[480px] border-l border-line",
                    !desktop && "max-h-[92dvh] w-full rounded-t-[10px] border-t border-line",
                  )}
                >
                  {!desktop && <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line-strong" />}
                  <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-4 md:px-6 md:pt-5">
                    <div className="min-w-0">
                      <Dialog.Title className="text-[19px] leading-7 font-semibold tracking-[-0.01em] text-ink">
                        {title}
                      </Dialog.Title>
                      {description ? (
                        <Dialog.Description className="mt-1 text-[14px] leading-5 text-muted">
                          {description}
                        </Dialog.Description>
                      ) : (
                        <Dialog.Description className="sr-only">{title}</Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close
                      aria-label="Close"
                      className="-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-[6px] text-muted hover:bg-sunk hover:text-ink"
                    >
                      <XIcon size={20} aria-hidden />
                    </Dialog.Close>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-line px-5 py-5 md:px-6">
                    {children}
                  </div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
