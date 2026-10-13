import Link from "next/link";
import { PrintTag } from "@/components/asset/PrintTag";
import { buttonClass } from "@/components/ui/button";
import { siteUrl } from "@/lib/config";
import { EXAMPLE_ASSET } from "@/lib/data/example";

export function ClosingBand() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 pb-16 md:px-8 md:pb-24">
      <div className="grid overflow-hidden rounded-[10px] border border-line bg-surface md:grid-cols-12">
        <div className="flex items-center justify-center bg-sunk px-6 py-12 md:col-span-5 md:py-16">
          <figure className="flex flex-col items-center">
            <PrintTag assetId={EXAMPLE_ASSET.id} url={`${siteUrl}/verify/${EXAMPLE_ASSET.id}`} className="-rotate-2" />
            <figcaption className="mt-5 text-[13px] leading-[18px] text-muted">
              Each asset gets a printable tag like this one.
            </figcaption>
          </figure>
        </div>
        <div className="flex flex-col justify-center px-6 py-10 md:col-span-7 md:px-12 md:py-16">
          <h2 className="text-[26px] leading-8 font-semibold tracking-[-0.015em] text-ink md:text-[32px] md:leading-[38px]">
            Registering equipment for the pilot?
          </h2>
          <p className="mt-4 max-w-[44ch] text-[17px] leading-7 text-muted">
            Registrar access is granted per organization. Connect the wallet you&rsquo;ll register from to see whether
            it&rsquo;s approved.
          </p>
          <div className="mt-8">
            <Link href="/register" className={buttonClass("primary", "lg")}>
              Register an asset
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
