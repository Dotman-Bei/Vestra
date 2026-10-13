"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowsLeftRightIcon, CloudSlashIcon, PlusIcon, TrayIcon } from "@phosphor-icons/react";
import type { Asset } from "@/lib/types";
import type { DashboardData } from "@/lib/data";
import { formatDateTime, truncateAddress } from "@/lib/format";
import { useViewer } from "@/components/shell/Viewer";
import { AddressChip } from "@/components/asset/Chips";
import { ConfirmHandoverDialog } from "@/components/asset/HandoverDialogs";
import { buttonClass } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/StateMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { AssetPicker, AssetRows, RecentTransactions, RecordRows, RoleTags, Tabs, relative } from "./parts";

async function fetchDashboard(address: string): Promise<DashboardData> {
  const res = await fetch(`/api/dashboard?address=${address}`, { cache: "no-store" });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
  return res.json();
}

export function DashboardView() {
  const { address } = useViewer();
  const [now] = useState(() => Math.floor(Date.now() / 1000));
  const query = useQuery({
    queryKey: ["dashboard", address],
    queryFn: () => fetchDashboard(address!),
    enabled: !!address,
    staleTime: 0,
    refetchOnMount: "always",
  });

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="flex min-w-0 flex-col gap-10 lg:col-span-8">
        {query.isPending ? (
          <DashboardSkeleton />
        ) : query.isError ? (
          <StateMessage
            icon={CloudSlashIcon}
            title="Couldn’t load your dashboard."
            action={
              <button type="button" onClick={() => query.refetch()} className={buttonClass("primary", "md")}>
                Retry
              </button>
            }
          >
            BOT Chain didn&rsquo;t respond. Your assets and records are unaffected; try again.
          </StateMessage>
        ) : (
          <Content data={query.data} now={now} refetch={() => query.refetch()} />
        )}
      </div>
      <aside aria-label="Recent transactions" className="lg:col-span-4">
        <div className="lg:sticky lg:top-24">
          <RecentTransactions />
        </div>
      </aside>
    </div>
  );
}

function Content({ data, now, refetch }: { data: DashboardData; now: number; refetch: () => void }) {
  const [dialog, setDialog] = useState<{ asset: Asset; action: "accept" | "cancel" } | null>(null);
  const [picker, setPicker] = useState(false);

  const outgoing = data.stewarded.filter((a) => a.pendingHandover);
  const hasActions = data.incoming.length > 0 || outgoing.length > 0;
  const isSteward = data.stewarded.length > 0;

  const tabs = [
    isSteward && {
      id: "care",
      label: "In your care",
      count: data.stewarded.length,
      content: (
        <AssetRows
          assets={data.stewarded}
          data={data}
          now={now}
          showHandover
          empty="No assets in your care yet. When a handover to this wallet is accepted, the asset appears here."
        />
      ),
    },
    data.roles.registrar && {
      id: "registered",
      label: "Registered by you",
      count: data.registered.length,
      content: (
        <div className="flex flex-col gap-4">
          <div>
            <Link href="/register" className={buttonClass("secondary", "md", "h-9 px-3 text-[14px]")}>
              <PlusIcon size={15} weight="bold" aria-hidden />
              Register an asset
            </Link>
          </div>
          <AssetRows assets={data.registered} data={data} now={now} empty="You haven’t registered any assets yet." />
        </div>
      ),
    },
    data.roles.serviceProvider && {
      id: "records",
      label: "Your records",
      count: data.records.length,
      content: (
        <div className="flex flex-col gap-4">
          <div>
            <button type="button" onClick={() => setPicker(true)} className={buttonClass("secondary", "md", "h-9 px-3 text-[14px]")}>
              <PlusIcon size={15} weight="bold" aria-hidden />
              Add record
            </button>
          </div>
          <RecordRows records={data.records} />
        </div>
      ),
    },
  ].filter(Boolean) as Array<{ id: string; label: string; count: number; content: React.ReactNode }>;

  const nothing = !hasActions && tabs.length === 0;

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-[13px] leading-[18px] font-medium text-muted">Your wallet</p>
        <AddressChip address={data.address} />
        <RoleTags data={data} />
      </div>

      {hasActions && (
        <section aria-labelledby="actions-h">
          <h2 id="actions-h" className="text-[20px] leading-7 font-semibold tracking-[-0.01em] text-ink">
            Needs your action
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {data.incoming.map((a) => (
              <ActionCard
                key={`in-${a.id}`}
                asset={a}
                tone="accent"
                title="Handover waiting for you"
                body={
                  <>
                    From <span className="font-mono text-[13px]">{truncateAddress(a.pendingHandover!.from)}</span>. Expires{" "}
                    {relative(a.pendingHandover!.expiresAt, now)}, {formatDateTime(a.pendingHandover!.expiresAt)}.
                  </>
                }
                actions={
                  <button type="button" onClick={() => setDialog({ asset: a, action: "accept" })} className={buttonClass("primary", "md", "h-9 px-3 text-[14px]")}>
                    Accept handover
                  </button>
                }
              />
            ))}
            {outgoing.map((a) => {
              const h = a.pendingHandover!;
              const expired = h.expiresAt <= now;
              return (
                <ActionCard
                  key={`out-${a.id}`}
                  asset={a}
                  title={expired ? "Handover expired" : "Waiting for the recipient"}
                  body={
                    expired ? (
                      <>
                        The proposal to <span className="font-mono text-[13px]">{truncateAddress(h.to)}</span> expired{" "}
                        {relative(h.expiresAt, now)} without being accepted.
                      </>
                    ) : (
                      <>
                        Proposed to <span className="font-mono text-[13px]">{truncateAddress(h.to)}</span>. Expires{" "}
                        {relative(h.expiresAt, now)}.
                      </>
                    )
                  }
                  actions={
                    expired ? (
                      <Link href={`/assets/${a.id}?do=handover`} className={buttonClass("secondary", "md", "h-9 px-3 text-[14px]")}>
                        Propose again
                      </Link>
                    ) : (
                      <button type="button" onClick={() => setDialog({ asset: a, action: "cancel" })} className={buttonClass("secondary", "md", "h-9 px-3 text-[14px]")}>
                        Cancel proposal
                      </button>
                    )
                  }
                />
              );
            })}
          </ul>
        </section>
      )}

      {tabs.length > 1 ? (
        <Tabs tabs={tabs} />
      ) : tabs.length === 1 ? (
        <section aria-labelledby="role-h">
          <h2 id="role-h" className="text-[20px] leading-7 font-semibold tracking-[-0.01em] text-ink">
            {tabs[0].label}
          </h2>
          <div className="mt-4">{tabs[0].content}</div>
        </section>
      ) : null}

      {nothing && (
        <StateMessage icon={TrayIcon} title="Nothing here for this wallet yet.">
          It isn&rsquo;t a registrar or service provider and isn&rsquo;t the steward of any asset. If someone proposes a
          handover to <span className="font-mono text-[15px] text-ink">{truncateAddress(data.address)}</span>, it will
          appear here.
        </StateMessage>
      )}

      {dialog && (
        <ConfirmHandoverDialog
          open
          onOpenChange={(o) => {
            if (!o) {
              setDialog(null);
              refetch();
            }
          }}
          asset={dialog.asset}
          action={dialog.action}
        />
      )}
      {data.roles.serviceProvider && <AssetPicker open={picker} onOpenChange={setPicker} assets={data.serviceable} />}
    </>
  );
}

function ActionCard({
  asset,
  title,
  body,
  actions,
  tone,
}: {
  asset: Asset;
  title: string;
  body: React.ReactNode;
  actions: React.ReactNode;
  tone?: "accent";
}) {
  return (
    <li
      className="flex flex-col gap-3 rounded-[10px] border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      style={{
        borderColor: tone ? "var(--accent)" : "var(--line)",
        background: tone ? "var(--accent-wash)" : "var(--surface)",
      }}
    >
      <div className="flex min-w-0 gap-3">
        <ArrowsLeftRightIcon size={20} aria-hidden className="mt-0.5 shrink-0 text-muted" />
        <div className="min-w-0">
          <p className="text-[15px] leading-6 font-semibold text-ink">{title}</p>
          <p className="text-[14px] leading-5 text-ink">
            <Link href={`/assets/${asset.id}`} className="font-medium hover:underline underline-offset-4">
              {asset.name}
            </Link>{" "}
            <span className="font-mono text-[13px] text-muted">{asset.id}</span>
          </p>
          <p className="mt-1 text-[13px] leading-5 text-muted">{body}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2 pl-8 sm:pl-0">{actions}</div>
    </li>
  );
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading your dashboard" className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-36" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-[10px]" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-80 max-w-full" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
