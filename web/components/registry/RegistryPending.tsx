"use client";

import { createContext, useContext, useTransition, type ReactNode, type TransitionStartFunction } from "react";

const Ctx = createContext<{ pending: boolean; start: TransitionStartFunction } | null>(null);

/** Shares the filter transition so results can dim while new ones load. */
export function RegistryPending({ children }: { children: ReactNode }) {
  const [pending, start] = useTransition();
  return (
    <Ctx.Provider value={{ pending, start }}>
      <div className="group/registry flex flex-col gap-8" data-pending={pending || undefined}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function useRegistryPending() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRegistryPending must be used inside RegistryPending");
  return v;
}
