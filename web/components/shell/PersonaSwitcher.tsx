"use client";

import { useId } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { PERSONAS, type PersonaId } from "@/lib/data/personas";
import { useViewer } from "./Viewer";

/** Demo only: choose which example wallet the app acts as. */
export function PersonaSwitcher() {
  const { personaId, setPersona } = useViewer();
  const id = useId();
  return (
    <div className="flex shrink-0 items-center gap-2">
      <label htmlFor={id} className="text-[13px] text-muted">
        Viewing as
      </label>
      <div className="relative">
        <select
          id={id}
          value={personaId}
          onChange={(e) => setPersona(e.target.value as PersonaId)}
          className="h-8 appearance-none rounded-[6px] border border-line-strong bg-surface pr-8 pl-2.5 text-[13px] font-medium text-ink"
        >
          {PERSONAS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <CaretDownIcon
          size={13}
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}
