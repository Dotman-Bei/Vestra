import type { Metadata } from "next";
import { RoleGate } from "@/components/shell/RoleGate";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-20 md:px-8 md:pt-12">
      <h1 className="text-[26px] leading-8 font-semibold tracking-[-0.015em] text-ink md:text-[32px] md:leading-[38px]">
        Dashboard
      </h1>
      <p className="mt-2 max-w-[60ch] text-[16px] leading-[26px] text-muted">
        The assets, handovers and records tied to your wallet.
      </p>
      <div className="mt-8">
        <RoleGate action="see the assets and actions tied to it">
          <DashboardView />
        </RoleGate>
      </div>
    </div>
  );
}
