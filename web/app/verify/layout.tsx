import { Wordmark } from "@/components/shell/Wordmark";
import { BuiltOnBotChain } from "@/components/shell/BuiltOnBotChain";

/** Minimal chrome for QR scans: no nav, nothing between the scan and the answer. */
export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-[560px] items-center px-4">
          <Wordmark />
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[560px] flex-col gap-4 px-4 py-8">
          <p className="text-[13px] leading-5 text-muted">
            Vestra is a lifecycle record for real-world equipment on BOT Chain. A record shows what authorized wallets
            submitted and when. It is not proof of legal ownership, physical condition, location or value.
          </p>
          <BuiltOnBotChain />
        </div>
      </footer>
    </>
  );
}
