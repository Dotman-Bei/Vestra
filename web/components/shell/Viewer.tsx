"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useConnection, useReadContracts } from "wagmi";
import { keccak256, toBytes } from "viem";
import { registryAbi } from "@/lib/chain/abi";
import { appChain } from "@/lib/chain/definition";
import type { Address } from "@/lib/types";
import { dataSource, registryAddress } from "@/lib/config";
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
const REGISTRAR_ROLE = keccak256(toBytes("REGISTRAR_ROLE"));
const SERVICE_PROVIDER_ROLE = keccak256(toBytes("SERVICE_PROVIDER_ROLE"));
const STORAGE_KEY = "vestra-demo-persona";

export function ViewerProvider({ children }: { children: ReactNode }) {
  const { address, status } = useConnection();
  const [personaId, setPersonaId] = useState<PersonaId>("visitor");
  const [restored, setRestored] = useState(false);

  // Chain mode: roles come from the registry contract.
  const roleReads = useReadContracts({
    contracts: [REGISTRAR_ROLE, SERVICE_PROVIDER_ROLE].map((role) => ({
      address: registryAddress!,
      abi: registryAbi,
      functionName: "hasRole" as const,
      args: [role, address!] as const,
      chainId: appChain.id,
    })),
    query: { enabled: dataSource === "chain" && !!registryAddress && !!address },
  });

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
    const [registrar, service] = roleReads.data ?? [];
    return {
      address: address ?? null,
      roles: address
        ? { registrar: registrar?.result === true, serviceProvider: service?.result === true }
        : NO_ROLES,
      mode: "wallet",
      personaId: "visitor",
      ready: status !== "connecting" && status !== "reconnecting" && (!address || !roleReads.isPending),
      setPersona,
    };
  }, [personaId, setPersona, address, status, restored, roleReads.data, roleReads.isPending]);

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  const v = useContext(ViewerContext);
  if (!v) throw new Error("useViewer must be used inside ViewerProvider");
  return v;
}
