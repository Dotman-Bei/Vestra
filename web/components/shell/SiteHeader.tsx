import { Z } from "@/lib/z";
import { Wordmark } from "./Wordmark";
import { NavLinks } from "./NavLinks";
import { WalletButton } from "./WalletButton";
import { MobileMenu } from "./MobileMenu";
import { ScrollHairline } from "./ScrollHairline";

export function SiteHeader() {
  return (
    <ScrollHairline style={{ zIndex: Z.header }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 md:px-8">
        <Wordmark />
        <nav aria-label="Main" className="hidden md:block">
          <NavLinks />
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <div className="hidden md:block">
            <WalletButton />
          </div>
          <div className="md:hidden">
            <WalletButton compact />
          </div>
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </ScrollHairline>
  );
}
