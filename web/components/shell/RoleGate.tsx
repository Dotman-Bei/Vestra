"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useConnection } from "wagmi";
import { LockKeyIcon, PlugsIcon, WalletIcon } from "@phosphor-icons/react";
import { appChain } from "@/lib/wagmi";
import { truncateAddress } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/StateMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { useViewer } from "./Viewer";
import { WalletButton } from "./WalletButton";

/**
 * Renders children only for a connected wallet on the right network, and,
 * when `role` is set, only if that wallet holds the role on-chain.
 */
export function RoleGate({
  role,
  action,
  noRoleTitle,
  noRoleBody,
  children,
}: {
  role?: "registrar";
  /** What the gate protects, e.g. "register assets". */
  action: string;
  noRoleTitle?: string;
  noRoleBody?: ReactNode;
  children: ReactNode;
}) {
  const viewer = useViewer();
  const { chainId, status } = useConnection();
  const demo = viewer.mode === "demo";

  if (!viewer.ready) {
    return (
      <div role="status" aria-label="Checking your wallet" className="flex flex-col gap-3">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
    );
  }

  const asRegistrar =
    demo && role === "registrar" ? (
      <button type="button" onClick={() => viewer.setPersona("registrar")} className={buttonClass("primary", "md")}>
        View as registrar
      </button>
    ) : null;
  const demoNote = demo ? (
    <p className="mt-3 text-[13px] leading-[18px] text-muted">
      Demo: this switches the example wallet in &ldquo;Viewing as&rdquo; at the top of the page.
    </p>
  ) : null;

  if (!viewer.address) {
    return (
      <StateMessage
        icon={WalletIcon}
        title="Connect a wallet to continue."
        action={
          <>
            {asRegistrar ?? <WalletButton />}
            {demoNote}
          </>
        }
      >
        {role === "registrar"
          ? "Registration is limited to approved registrar wallets."
          : `Connect a wallet to ${action}.`}
      </StateMessage>
    );
  }

  if (!demo && status === "connected" && chainId !== appChain.id) {
    return (
      <StateMessage icon={PlugsIcon} title="Switch network to continue." action={<WalletButton />}>
        Your wallet is on a different network. Switch to {appChain.name} to {action}.
      </StateMessage>
    );
  }

  if (role === "registrar" && !viewer.roles.registrar) {
    return (
      <StateMessage
        icon={LockKeyIcon}
        title={noRoleTitle ?? "This wallet isn’t an approved registrar."}
        action={
          <div className="flex flex-col items-start">
            <div className="flex flex-wrap gap-3">
              {asRegistrar}
              <Link href="/assets" className={buttonClass("secondary", "md")}>
                Browse the registry
              </Link>
            </div>
            {demoNote}
          </div>
        }
      >
        {noRoleBody ?? (
          <>
            <span className="font-mono text-[15px] text-ink">{truncateAddress(viewer.address)}</span> doesn&rsquo;t have
            the registrar role on Vestra. Registrar access is granted by the Vestra administrator.
          </>
        )}
      </StateMessage>
    );
  }

  return <>{children}</>;
}
