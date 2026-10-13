"use client";

import { useRef } from "react";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { QRCodeSVG } from "qrcode.react";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { siteUrl } from "@/lib/config";
import { buttonClass } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/z";

export function verifyUrl(assetId: string) {
  return `${siteUrl}/verify/${assetId}`;
}

const QR_COLORS = { bgColor: "#fbfbfc", fgColor: "#14171c" } as const;

function download(name: string, href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
}

/** "Download QR" menu offering SVG (for print) and PNG. Encodes only the public verification URL. */
export function DownloadQrButton({ assetId, className }: { assetId: string; className?: string }) {
  const hidden = useRef<HTMLDivElement>(null);

  function svgString() {
    const svg = hidden.current?.querySelector("svg");
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new XMLSerializer().serializeToString(clone);
  }

  function downloadSvg() {
    const s = svgString();
    if (!s) return;
    const blobUrl = URL.createObjectURL(new Blob([s], { type: "image/svg+xml" }));
    download(`${assetId}-qr.svg`, blobUrl);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }

  function downloadPng() {
    const s = svgString();
    if (!s) return;
    const img = new Image();
    img.onload = () => {
      const size = 1024;
      const pad = 64;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size + pad * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = QR_COLORS.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, pad, pad, size, size);
      download(`${assetId}-qr.png`, canvas.toDataURL("image/png"));
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
  }

  const itemClass =
    "flex h-10 cursor-default items-center rounded-[6px] px-3 text-[15px] text-ink outline-none data-[highlighted]:bg-sunk";

  return (
    <>
      <div ref={hidden} aria-hidden className="hidden">
        <QRCodeSVG value={verifyUrl(assetId)} size={256} level="M" marginSize={0} {...QR_COLORS} />
      </div>
      <Menu.Root>
        <Menu.Trigger className={buttonClass("secondary", "md", className)}>
          <DownloadSimpleIcon size={17} aria-hidden />
          Download QR
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content
            align="center"
            sideOffset={6}
            style={{ zIndex: Z.overlay }}
            className="min-w-[220px] rounded-[10px] border border-line bg-surface p-1.5 shadow-float"
          >
            <Menu.Item className={itemClass} onSelect={downloadSvg}>
              SVG, for printing
            </Menu.Item>
            <Menu.Item className={itemClass} onSelect={downloadPng}>
              PNG, 1152 px
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
    </>
  );
}

/** QR code for the public verification page, with copy and download. */
export function QRPlate({ assetId, className }: { assetId: string; className?: string }) {
  const url = verifyUrl(assetId);
  return (
    <div className={cn("rounded-[10px] border border-line bg-surface p-5", className)}>
      <div className="mx-auto w-fit rounded-[6px] bg-[#fbfbfc] p-3">
        <QRCodeSVG
          value={url}
          size={176}
          level="M"
          marginSize={0}
          {...QR_COLORS}
          title={`QR code linking to the verification page for ${assetId}`}
        />
      </div>
      <p className="mt-4 text-center text-[14px] leading-5 font-medium text-ink">Scan to verify this record</p>
      <div className="mt-1 flex items-center justify-center gap-1">
        <span className="truncate font-mono text-[12px] text-muted" title={url}>
          {url.replace(/^https?:\/\//, "")}
        </span>
        <CopyButton value={url} label="Copy verification link" size={14} />
      </div>
      <DownloadQrButton assetId={assetId} className="mt-4 w-full" />
      <p className="mt-4 text-[13px] leading-[18px] text-muted">
        The QR is a pointer to this record. It is not proof by itself.
      </p>
    </div>
  );
}
