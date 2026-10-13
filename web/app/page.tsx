import { Hero } from "@/components/home/Hero";
import { LifecycleRail } from "@/components/home/LifecycleRail";
import { ProofBento } from "@/components/home/ProofBento";
import { Roles } from "@/components/home/Roles";
import { ClosingBand } from "@/components/home/ClosingBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LifecycleRail />
      <ProofBento />
      <Roles />
      {/* Registry figures render here once the chain adapter is live and counts are real. */}
      <ClosingBand />
    </>
  );
}
