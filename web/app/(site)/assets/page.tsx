import { Suspense } from "react";
import type { Metadata } from "next";
import { CloudSlashIcon } from "@phosphor-icons/react/ssr";
import { ChainReadError, listAssets } from "@/lib/data";
import { categoriesOf, filterAssets, parseRegistryQuery } from "@/lib/registry";
import { FilterBar } from "@/components/registry/FilterBar";
import { RegistryPending } from "@/components/registry/RegistryPending";
import { RegistryResults } from "@/components/registry/RegistryResults";
import { StateMessage } from "@/components/ui/StateMessage";
import { RetryButton } from "@/components/ui/RetryButton";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "Registry" };

export default function RegistryPage({ searchParams }: PageProps<"/assets">) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-20 md:px-8 md:pt-12">
      <h1 className="text-[26px] leading-8 font-semibold tracking-[-0.015em] text-ink md:text-[32px] md:leading-[38px]">
        Registry
      </h1>
      <p className="mt-2 max-w-[60ch] text-[16px] leading-[26px] text-muted">
        Every asset registered on Vestra. Open one to see its full history.
      </p>
      <div className="mt-8">
        <Suspense fallback={<RegistrySkeleton />}>
          <Registry searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Registry({ searchParams }: { searchParams: PageProps<"/assets">["searchParams"] }) {
  const query = parseRegistryQuery(await searchParams);

  let all;
  try {
    all = await listAssets();
  } catch (e) {
    if (!(e instanceof ChainReadError)) throw e;
    return (
      <StateMessage icon={CloudSlashIcon} title="Couldn’t load the registry." action={<RetryButton />}>
        BOT Chain didn&rsquo;t respond. The records are unaffected; try again.
      </StateMessage>
    );
  }

  const matches = filterAssets(all, query);
  return (
    <RegistryPending>
      <FilterBar query={query} categories={categoriesOf(all)} />
      <RegistryResults assets={matches} total={all.length} query={query} />
    </RegistryPending>
  );
}

function RegistrySkeleton() {
  return (
    <div role="status" aria-label="Loading the registry" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-[70px] w-full sm:max-w-[440px]" />
          <Skeleton className="h-[70px] w-full sm:w-[220px]" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-28" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-48" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
