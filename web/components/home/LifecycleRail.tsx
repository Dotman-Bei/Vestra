import { ArrowsLeftRightIcon, ClipboardTextIcon, QrCodeIcon, TagIcon } from "@phosphor-icons/react/ssr";
import { StaggerItem, StaggerList } from "@/components/ui/Reveal";

const STAGES = [
  {
    title: "Register.",
    body: "An authorized registrar creates the asset and its passport ID on BOT Chain.",
    Icon: TagIcon,
  },
  {
    title: "Record.",
    body: "Technicians and inspectors append service and inspection entries with evidence hashes.",
    Icon: ClipboardTextIcon,
  },
  {
    title: "Hand over.",
    body: "The current steward proposes a handover. It completes only when the recipient accepts.",
    Icon: ArrowsLeftRightIcon,
  },
  {
    title: "Verify.",
    body: "Anyone scans the QR tag and reads the record straight from the chain.",
    Icon: QrCodeIcon,
  },
];

export function LifecycleRail() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
        <h2 className="max-w-[30ch] text-balance text-[26px] leading-8 font-semibold tracking-[-0.015em] text-ink md:text-[32px] md:leading-[38px]">
          One record, from install to handover.
        </h2>

        <StaggerList className="mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
          {STAGES.map(({ title, body, Icon }, i) => (
            <StaggerItem
              key={title}
              className="relative grid grid-cols-[40px_1fr] gap-x-4 md:block"
            >
              {/* Connector to the next stage: vertical on mobile, horizontal from md up. */}
              {i < STAGES.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-12 -bottom-6 left-5 w-px bg-line-strong md:top-5 md:right-[-24px] md:bottom-auto md:left-14 md:h-px md:w-auto"
                />
              )}
              <span className="relative flex size-10 items-center justify-center rounded-[6px] border border-line-strong bg-surface text-ink">
                <Icon size={20} aria-hidden />
              </span>
              <div className="md:mt-5">
                <h3 className="text-[17px] leading-6 font-semibold text-ink md:leading-10 md:mt-0">{title}</h3>
                <p className="mt-1 max-w-[34ch] text-[15px] leading-6 text-muted">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
