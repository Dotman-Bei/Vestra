import { BuildingsIcon, MagnifyingGlassIcon, UserCircleIcon, WrenchIcon } from "@phosphor-icons/react/ssr";

const ROLES = [
  {
    name: "Registrar",
    Icon: BuildingsIcon,
    body: "Manufacturers, distributors and pilot operators approved by the Vestra administrator. They register assets and set the initial record.",
  },
  {
    name: "Steward",
    Icon: UserCircleIcon,
    body: "The wallet currently responsible for the asset. Proposes handovers and reports status changes. Being the steward is an operational role, not legal title.",
  },
  {
    name: "Service provider",
    Icon: WrenchIcon,
    body: "Approved technicians and inspectors. They append maintenance and inspection records signed by their own wallet.",
  },
  {
    name: "Verifier",
    Icon: MagnifyingGlassIcon,
    body: "Anyone with the link or QR code. No wallet and no account needed.",
  },
];

export function Roles() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 md:grid-cols-12 md:gap-8 md:px-8 md:py-24">
        <h2 className="max-w-[16ch] text-[26px] leading-8 font-semibold tracking-[-0.015em] text-ink md:col-span-4 md:text-[32px] md:leading-[38px]">
          Four roles, checked by the contract.
        </h2>
        <dl className="divide-y divide-line border-y border-line md:col-span-8">
          {ROLES.map(({ name, Icon, body }) => (
            <div key={name} className="grid gap-2 py-6 sm:grid-cols-[200px_1fr] sm:gap-8">
              <dt className="flex items-center gap-2.5 self-start text-[17px] leading-7 font-semibold text-ink">
                <Icon size={20} aria-hidden className="text-muted" />
                {name}
              </dt>
              <dd className="max-w-[58ch] text-[16px] leading-[26px] text-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
