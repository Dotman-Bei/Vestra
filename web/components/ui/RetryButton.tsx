"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { buttonClass } from "./button";

export function RetryButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => router.refresh())}
      className={buttonClass("primary", "md")}
    >
      <ArrowClockwiseIcon size={17} aria-hidden className={pending ? "animate-spin motion-reduce:animate-none" : ""} />
      Retry
    </button>
  );
}
