"use client";

import { useState } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CheckIcon,
  CopyIcon,
  SignOutIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { appChain } from "@/lib/wagmi";
import { chain, explorerAddress } from "@/lib/config";
import { truncateAddress } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/z";

const menuClass =
  "min-w-[240px] rounded-[10px] border border-line bg-surface p-1.5 shadow-float";
const itemClass =
  "flex h-10 cursor-default items-center gap-2.5 rounded-[6px] px-3 text-[15px] text-ink outline-none " +
  "data-[highlighted]:bg-sunk";

export function WalletButton({ compact = false }: { compact?: boolean }) {
  const { address, status, chainId } = useConnection();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();
  const [copied, setCopied] = useState(false);

  // Prefer wallets announced through EIP-6963; fall back to the generic injected connector.
  const announced = connectors.filter((c) => c.id !== "injected");
  const options = announced.length ? announced : connectors;

  if (status === "connecting" || status === "reconnecting") {
    return (
      <button disabled className={buttonClass("secondary", compact ? "icon" : "md", compact ? undefined : "min-w-[148px]")}>
        <WalletIcon size={18} aria-hidden />
        {!compact && "Connecting"}
      </button>
    );
  }

  if (status === "connected" && address) {
    if (chainId !== appChain.id) {
      return (
        <button
          onClick={() => switchChain.mutate({ chainId: appChain.id })}
          className={buttonClass("primary", "md")}
        >
          Switch network
        </button>
      );
    }
    const explorer = explorerAddress(address);
    return (
      <Menu.Root>
        <Menu.Trigger
          aria-label={`Wallet ${address}`}
          className={buttonClass("secondary", compact ? "icon" : "md", compact ? undefined : "font-mono text-[14px] font-normal")}
        >
          <WalletIcon size={18} aria-hidden />
          {!compact && truncateAddress(address)}
          {!compact && <CaretDownIcon size={14} aria-hidden className="text-muted" />}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content align="end" sideOffset={8} className={menuClass} style={{ zIndex: Z.overlay }}>
            <div className="px-3 pt-2 pb-3">
              <p className="text-[13px] text-muted">Connected to {chain.name}</p>
              <p className="mt-1 font-mono text-[13px] break-all text-ink">{address}</p>
            </div>
            <Menu.Separator className="mx-1.5 my-1 h-px bg-line" />
            <Menu.Item
              className={itemClass}
              onSelect={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(address).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                });
              }}
            >
              {copied ? <CheckIcon size={18} aria-hidden /> : <CopyIcon size={18} aria-hidden />}
              {copied ? "Copied" : "Copy address"}
            </Menu.Item>
            {explorer && (
              <Menu.Item asChild className={itemClass}>
                <a href={explorer} target="_blank" rel="noreferrer">
                  <ArrowSquareOutIcon size={18} aria-hidden />
                  View on explorer
                </a>
              </Menu.Item>
            )}
            <Menu.Item className={itemClass} onSelect={() => disconnect.mutate()}>
              <SignOutIcon size={18} aria-hidden />
              Disconnect
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
    );
  }

  return (
    <Menu.Root onOpenChange={(open) => open && connect.reset()}>
      <Menu.Trigger
        aria-label="Connect wallet"
        className={buttonClass("secondary", compact ? "icon" : "md", compact ? undefined : "min-w-[148px]")}
      >
        <WalletIcon size={18} aria-hidden />
        {!compact && "Connect wallet"}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" sideOffset={8} className={menuClass} style={{ zIndex: Z.overlay }}>
          <p className="px-3 pt-2 pb-2 text-[13px] text-muted">Choose a browser wallet</p>
          {options.map((connector) => (
            <Menu.Item
              key={connector.uid}
              className={itemClass}
              onSelect={(e) => {
                e.preventDefault();
                connect.mutate({ connector });
              }}
            >
              {connector.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={connector.icon} alt="" width={18} height={18} className="rounded-[4px]" />
              ) : (
                <WalletIcon size={18} aria-hidden />
              )}
              {connector.id === "injected" ? "Browser wallet" : connector.name}
            </Menu.Item>
          ))}
          {connect.error && (
            <p role="alert" className={cn("max-w-[260px] px-3 pt-2 pb-2 text-[13px] leading-5 text-[color:var(--st-danger-fg)]")}>
              {(connect.error.name as string) === "ProviderNotFoundError"
                ? "No browser wallet found. Install one, then reload this page."
                : connect.error.name === "UserRejectedRequestError"
                  ? "You declined the connection in your wallet."
                  : "Couldn't connect. Check your wallet and try again."}
            </p>
          )}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
