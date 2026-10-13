import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CaretRightIcon, CloudSlashIcon, MagnifyingGlassIcon, QrCodeIcon } from "@phosphor-icons/react/ssr";
import { ChainReadError, getAsset, getMetadataStatus, getRecords } from "@/lib/data";
import { normalizeAssetId } from "@/lib/format";
import { StatusChip } from "@/components/asset/StatusChip";
import { PassportActions } from "@/components/asset/PassportActions";
import { KeyFacts, Limitations } from "@/components/asset/KeyFacts";
import { Timeline } from "@/components/asset/Timeline";
import { QRPlate } from "@/components/asset/QRPlate";
import { AssetIdLookup } from "@/components/asset/AssetIdLookup";
import { CopyButton } from "@/components/ui/CopyButton";
import { StateMessage } from "@/components/ui/StateMessage";
import { RetryButton } from "@/components/ui/RetryButton";
import { Skeleton } from "@/components/ui/Skeleton";

export async function generateMetadata({ params }: PageProps<"/assets/[assetId]">): Promise<Metadata> {
  const { assetId } = await params;
  return { title: `Passport ${normalizeAssetId(decodeURIComponent(assetId)) ?? ""}`.trim() };
}

export default function PassportPage({ params }: PageProps<"/assets/[assetId]">) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-20 md:px-8 md:pt-8">
      <Suspense fallback={<PassportSkeleton />}>
        <Passport params={params} />
      </Suspense>
    </div>
  );
}

function Breadcrumb({ id }: { id: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[14px] leading-5">
      <ol className="flex items-center gap-1.5 text-muted">
        <li>
          <Link href="/assets" className="hover:text-ink hover:underline underline-offset-4">
            Registry
          </Link>
        </li>
        <CaretRightIcon size={12} aria-hidden />
        <li aria-current="page" className="font-mono text-[13px] text-ink">
          {id}
        </li>
      </ol>
    </nav>
  );
}

async function Passport({ params }: { params: PageProps<"/assets/[assetId]">["params"] }) {
  const { assetId: raw } = await params;
  const id = normalizeAssetId(decodeURIComponent(raw));

  if (!id) {
    return (
      <StateMessage icon={MagnifyingGlassIcon} as="h1" title="That isn’t a Vestra asset ID." className="py-12" action={<AssetIdLookup />}>
        Vestra IDs look like VST-0007.
      </StateMessage>
    );
  }

  let data;
  try {
    const [asset, records, metadata] = await Promise.all([getAsset(id), getRecords(id), getMetadataStatus(id)]);
    data = { asset, records, metadata };
  } catch (e) {
    if (!(e instanceof ChainReadError)) throw e;
    return (
      <>
        <Breadcrumb id={id} />
        <StateMessage icon={CloudSlashIcon} as="h1" title="Couldn’t reach BOT Chain." className="py-12" action={<RetryButton />}>
          Nothing is wrong with the record. The connection failed; try again.
        </StateMessage>
      </>
    );
  }

  const { asset, records, metadata } = data;
  if (!asset) {
    return (
      <>
        <Breadcrumb id={id} />
        <StateMessage icon={MagnifyingGlassIcon} as="h1" title={`No asset with ID ${id}.`} className="py-12" action={<AssetIdLookup />}>
          Nothing with this ID is registered on Vestra. Check the ID under the QR tag.
        </StateMessage>
      </>
    );
  }

  const meta = [asset.category, asset.manufacturer, asset.model].filter(Boolean).join(", ");

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="flex min-w-0 flex-col gap-8 lg:col-span-8">
        <header>
          <Breadcrumb id={asset.id} />
          <h1 className="mt-5 text-[26px] leading-8 font-semibold tracking-[-0.015em] text-balance text-ink md:text-[32px] md:leading-[38px]">
            {asset.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-0.5">
              <span className="font-mono text-[20px] leading-7 font-medium text-ink">{asset.id}</span>
              <CopyButton value={asset.id} label="Copy asset ID" />
            </span>
            <StatusChip status={asset.status} />
          </div>
          {meta && <p className="mt-2 text-[14px] leading-5 text-muted">{meta}</p>}

          <details className="group mt-5 rounded-[10px] border border-line bg-surface lg:hidden">
            <summary className="flex h-12 cursor-pointer list-none items-center gap-2.5 px-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
              <QrCodeIcon size={20} aria-hidden />
              Show QR
              <CaretRightIcon size={14} aria-hidden className="ml-auto text-muted transition-transform group-open:rotate-90" />
            </summary>
            <QRPlate assetId={asset.id} className="rounded-t-none border-x-0 border-b-0" />
          </details>
        </header>

        <PassportActions asset={asset} records={records} />
        <KeyFacts asset={asset} metadata={metadata} />
        <Timeline asset={asset} records={records} />
        <Limitations />
      </div>

      <aside aria-label="QR code" className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-24">
          <QRPlate assetId={asset.id} />
        </div>
      </aside>
    </div>
  );
}

function PassportSkeleton() {
  return (
    <div role="status" aria-label="Loading passport" className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="flex flex-col gap-8 lg:col-span-8">
        <div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-6 h-9 w-3/4" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-7 w-24" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-6 w-44" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-7">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="grid grid-cols-[32px_1fr] gap-3">
              <Skeleton className="size-8" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-5 w-full max-w-[480px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden lg:col-span-4 lg:block">
        <Skeleton className="h-[380px] w-full rounded-[10px]" />
      </div>
    </div>
  );
}
