import { CheckIcon, CubeIcon, QuestionIcon } from "@phosphor-icons/react/ssr";
import { TimelineEntry } from "@/components/asset/TimelineEntry";
import { EXAMPLE_ASSET, EXAMPLE_CLAIM } from "@/lib/data/example";
import { formatNumber, truncateAddress, truncateHash } from "@/lib/format";

const ON_CHAIN = [
  "Which wallet registered the asset",
  "Who submitted each record, and when",
  "The current recorded status",
  "The registered steward",
  "Every proposed and accepted handover",
  "Hashes of the evidence behind each record",
];

const UNKNOWABLE = ["Legal ownership", "Where it is today", "Its condition right now", "What it’s worth"];

export function ProofBento() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
        <p className="text-[14px] leading-5 font-medium text-accent">Read this before trusting a record</p>
        <h2 className="mt-3 max-w-[26ch] text-[26px] leading-8 font-semibold tracking-[-0.015em] text-ink md:text-[32px] md:leading-[38px]">
          On-chain doesn&rsquo;t mean true. It means accountable.
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-12">
          <article className="flex flex-col rounded-[10px] bg-accent-wash p-6 md:col-span-7 md:row-span-2 md:p-10">
            <CubeIcon size={28} aria-hidden className="text-accent" />
            <h3 className="mt-6 text-[22px] leading-7 font-semibold tracking-[-0.01em] text-ink">
              Recorded on BOT Chain.
            </h3>
            <p className="mt-3 max-w-[46ch] text-[16px] leading-[26px] text-ink/80">
              These are facts about the record itself. Once written, they can&rsquo;t be quietly edited, and anyone can
              check them against the chain.
            </p>
            <ul className="mt-8 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
              {ON_CHAIN.map((item) => (
                <li key={item} className="flex gap-2.5 text-[15px] leading-[22px] text-ink">
                  <CheckIcon size={18} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <figure className="mt-10 rounded-[6px] border border-line bg-surface p-4 md:mt-auto">
              <figcaption className="text-[13px] leading-[18px] text-muted">
                What the chain holds for the example asset {EXAMPLE_ASSET.id}
              </figcaption>
              <dl className="mt-3 grid grid-cols-[96px_1fr] gap-x-4 gap-y-1.5 font-mono text-[13px] leading-5">
                <dt className="text-muted">registrar</dt>
                <dd className="truncate text-ink">{truncateAddress(EXAMPLE_ASSET.registrar)}</dd>
                <dt className="text-muted">steward</dt>
                <dd className="truncate text-ink">{truncateAddress(EXAMPLE_ASSET.steward)}</dd>
                <dt className="text-muted">status</dt>
                <dd className="truncate text-ink">{EXAMPLE_ASSET.status}</dd>
                <dt className="text-muted">block</dt>
                <dd className="truncate text-ink">{formatNumber(EXAMPLE_ASSET.registeredBlock)}</dd>
                <dt className="text-muted">tx</dt>
                <dd className="truncate text-ink">{truncateHash(EXAMPLE_ASSET.registeredTx!)}</dd>
              </dl>
            </figure>
          </article>

          <article className="rounded-[10px] border border-line bg-surface p-6 md:col-span-5 md:p-8">
            <h3 className="text-[19px] leading-7 font-semibold tracking-[-0.01em] text-ink">Claimed by a participant.</h3>
            <p className="mt-2 text-[15px] leading-6 text-muted">
              An inspector&rsquo;s note that work was done, or a registrar&rsquo;s description of the asset. Vestra
              shows who made the claim and the evidence hash, not whether it&rsquo;s correct.
            </p>
            <TimelineEntry record={EXAMPLE_CLAIM} className="mt-6 rounded-[6px] border border-line bg-bg p-4" />
          </article>

          <article className="rounded-[10px] bg-sunk p-6 md:col-span-5 md:p-8">
            <QuestionIcon size={24} aria-hidden className="text-muted" />
            <h3 className="mt-4 text-[19px] leading-7 font-semibold tracking-[-0.01em] text-ink">
              Outside what Vestra can know.
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {UNKNOWABLE.map((item) => (
                <li
                  key={item}
                  className="rounded-[6px] border border-line-strong px-2.5 py-1 text-[14px] leading-5 text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
