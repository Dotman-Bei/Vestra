"use client";

import { useEffect, useState } from "react";
import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

type Theme = "system" | "light" | "dark";

const OPTIONS: Array<{ value: Theme; label: string; Icon: typeof SunIcon }> = [
  { value: "system", label: "System", Icon: DesktopIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
];

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this visit.
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the attribute the head script set
    if (current === "light" || current === "dark") setTheme(current);
  }, []);

  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-[6px] border border-line p-0.5">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          onClick={() => {
            setTheme(value);
            apply(value);
          }}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-[4px] px-2.5 text-[13px] transition-colors",
            theme === value ? "bg-sunk font-medium text-ink" : "text-muted hover:text-ink",
          )}
        >
          <Icon size={15} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
