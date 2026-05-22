"use client";

import { LeaderCard } from "@/components/leader-card";
import { useMe } from "@/hooks/use-auth";
import { useLeaders } from "@/hooks/use-leaders";
import { useI18n } from "@/lib/i18n";

export default function LeadersPage() {
  const { t } = useI18n();
  const me = useMe();
  const { data, isLoading, error } = useLeaders();
  const isLocked = !me.data;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-mint">{t("publicDirectory")}</p>
        <h1 className="mt-3 text-3xl font-semibold">{t("leaders")}</h1>
      </div>
      {isLoading && <p className="text-slate-400">{t("loadingLeaders")}</p>}
      {error && <p className="text-redsignal">{error.message}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((leader) => <LeaderCard key={leader.id} leader={leader} locked={isLocked} />)}
      </div>
    </main>
  );
}
