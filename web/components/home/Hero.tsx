import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { AssetIdLookup } from "@/components/asset/AssetIdLookup";
import { PassportPlate } from "@/components/asset/PassportPlate";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/button";
import { EXAMPLE_ASSET } from "@/lib/data/example";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pt-12 pb-16 md:px-8 lg:min-h-[min(calc(100dvh-64px),720px)] lg:grid-cols-12 lg:gap-8 lg:pt-16 lg:pb-20">
      <div className="lg:col-span-7">
        <h1 className="max-w-[20ch] text-[36px] leading-[40px] font-semibold tracking-[-0.025em] text-balance text-ink sm:text-[44px] sm:leading-[48px] lg:max-w-none lg:text-[48px] lg:leading-[52px]">
          A service record that travels with the equipment.
        </h1>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-7 text-muted sm:text-[18px]">
          Vestra gives each asset a passport on BOT Chain: registration, inspections, repairs and handovers in one
          checkable record.
        </p>
        <AssetIdLookup className="mt-9" />
        <Link href="/assets" className={buttonClass("ghost", "md", "mt-6 text-[15px]")}>
          Browse the registry
          <ArrowRightIcon size={16} aria-hidden />
        </Link>
      </div>

      <Reveal delay={0.15} className="lg:col-span-5">
        <PassportPlate asset={EXAMPLE_ASSET} />
        <p className="mt-3 text-[13px] leading-[18px] text-muted">Example record. Not a registered asset.</p>
      </Reveal>
    </section>
  );
}
