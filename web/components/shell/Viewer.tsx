"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useConnection } from "wagmi";
import type { Address } from "@/lib/types";
import { dataSource } from "@/lib/config";
import { NO_ROLES, type ViewerRoles } from "@/lib/rules";
import { DEMO_REGISTRARS, DEMO_SERVICE_PROVIDERS, PERSONAS, type PersonaId } from "@/lib/data/personas";

export interface Viewer {
  /** The acting wallet, or null for a visitor. */
  address: Address | null;
  roles: ViewerRoles;
  /** "demo" while the fixture adapter is active; actions then use example wallets. */
  mode: "demo" | "wallet";
  personaId: PersonaId;
  /** False until the saved persona or wallet connection has been restored. */
  ready: boolean;
  setPersona: (id: PersonaId) => void;
}

const ViewerContext = createContext<Viewer | null>(null);
const STORAGE_KEY = "vestra-demo-persona";

export function ViewerProvider({ children }: { children: ReactNode }) {
  const { address, status } = useConnection();
  const [personaId, setPersonaId] = useState<PersonaId>("visitor");
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as PersonaId | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the saved demo persona after hydration
      if (saved && PERSONAS.some((p) => p.id === saved)) setPersonaId(saved);
    } catch {
      // Storage unavailable: start as a visitor.
    }
    setRestored(true);
  }, []);

  const setPersona = useCallback((id: PersonaId) => {
    setPersonaId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Not persisted; still applies for this visit.
    }
  }, []);

  const value = useMemo<Viewer>(() => {
    if (dataSource === "fixtures") {
      const persona = PERSONAS.find((p) => p.id === personaId)!;
      const a = persona.address?.toLowerCase() ?? "";
      return {
        address: persona.address,
        roles: { registrar: DEMO_REGISTRARS.has(a), serviceProvider: DEMO_SERVICE_PROVIDERS.has(a) },
        mode: "demo",
        personaId,
        ready: restored,
        setPersona,
      };
    }
    // Role reads from the registry contract land with the chain adapter.
    return {
      address: address ?? null,
      roles: NO_ROLES,
      mode: "wallet",
      personaId: "visitor",
      ready: status !== "connecting" && status !== "reconnecting",
      setPersona,
    };
  }, [personaId, setPersona, address, status, restored]);

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  const v = useContext(ViewerContext);
  if (!v) throw new Error("useViewer must be used inside ViewerProvider");
  return v;
}
