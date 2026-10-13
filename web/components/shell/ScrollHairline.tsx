"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Sticky header wrapper. Shows its bottom hairline once the page has scrolled,
 * using a sentinel + IntersectionObserver instead of a scroll listener.
 */
export function ScrollHairline({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-0" />
      <header
        style={style}
        className={cn(
          "sticky top-0 border-b bg-bg/90 backdrop-blur-[6px] transition-colors duration-200",
          scrolled ? "border-line" : "border-transparent",
        )}
      >
        {children}
      </header>
    </>
  );
}
