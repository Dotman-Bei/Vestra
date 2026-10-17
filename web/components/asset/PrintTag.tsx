"use client";

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/cn";
import { VestraMark } from "@/components/shell/Wordmark";

/**
 * The physical tag fixed to the equipment. It always renders dark-on-light,
 * like the printed label, because inverted QR codes fail on some scanners.
 * The QR encodes only the public verification URL.
 */
export function PrintTag({ assetId, url, className }: { assetId: string; url: string; className?: string }) {
  return (
    <figure
      className={cn(
        "w-[248px] rounded-[10px] border-[1.5px] border-[#14171c] bg-[#fbfbfc] p-5 text-[#14171c]",
        "shadow-[0_1px_0_rgb(20_23_28/0.06),0_10px_24px_-12px_rgb(20_23_28/0.25)]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
          <VestraMark size={20} color="#14171c" />
          Vestra
        </span>
        <span className="text-[11px] font-medium text-[#555b66]">Asset passport</span>
      </div>
      <div className="mt-4 flex justify-center">
        <QRCodeSVG value={url} size={176} level="M" marginSize={0} bgColor="#fbfbfc" fgColor="#14171c" title={`QR code linking to ${url}`} />
      </div>
      <figcaption className="mt-4 border-t border-[#d7dae0] pt-3 text-center">
        <span className="block font-mono text-[19px] leading-7 font-medium">{assetId}</span>
        <span className="block text-[12px] leading-4 text-[#555b66]">Scan to verify this record</span>
      </figcaption>
    </figure>
  );
}
