import { ArrowSquareOutIcon } from "@phosphor-icons/react/ssr";
import { explorerAddress, explorerBlock, explorerTx } from "@/lib/config";
import { formatNumber, truncateAddress, truncateHash } from "@/lib/format";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/cn";

function ExplorerLink({ href, label }: { href: string | null; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-[6px] text-muted hover:bg-sunk hover:text-ink pointer-coarse:size-9"
    >
      <ArrowSquareOutIcon size={15} aria-hidden />
    </a>
  );
}

/** Truncated wallet address with copy and (when configured) an explorer link. */
export function AddressChip({ address, className }: { address: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span className="font-mono text-[14px] text-ink" title={address}>
        <span aria-hidden>{truncateAddress(address)}</span>
        <span className="sr-only">{address}</span>
      </span>
      <CopyButton value={address} label="Copy address" />
      <ExplorerLink href={explorerAddress(address)} label="View address on explorer" />
    </span>
  );
}

export function HashChip({ hash, prefix = "", className }: { hash: string; prefix?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span className="font-mono text-[13px] text-ink" title={hash}>
        <span aria-hidden>{truncateHash(hash, prefix)}</span>
        <span className="sr-only">{hash}</span>
      </span>
      <CopyButton value={hash} label="Copy hash" />
    </span>
  );
}

/** Transaction hash: links to the explorer when one is configured, otherwise copyable text. */
export function TxLink({ hash, className }: { hash: string; className?: string }) {
  const href = explorerTx(hash);
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        title={hash}
        className={cn("inline-flex items-center gap-1 font-mono text-[13px] text-accent hover:underline", className)}
      >
        {truncateHash(hash)}
        <ArrowSquareOutIcon size={13} aria-hidden />
      </a>
    );
  }
  return <HashChip hash={hash} className={className} />;
}

/** Links a transaction when its hash is known, otherwise the block it landed in. */
export function ChainRef({ tx, block, className }: { tx?: string; block: number; className?: string }) {
  if (tx) return <TxLink hash={tx} className={className} />;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[13px]", className)}>
      Block <BlockLink block={block} />
    </span>
  );
}

export function BlockLink({ block }: { block: number }) {
  const href = explorerBlock(block);
  const text = <span className="font-mono text-[13px]">{formatNumber(block)}</span>;
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
      {text}
    </a>
  ) : (
    text
  );
}
