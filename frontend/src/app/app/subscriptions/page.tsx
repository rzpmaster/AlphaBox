"use client";

import { LeaderCard } from "@/components/leader-card";
import { useSubscriptions } from "@/hooks/use-leaders";
import { useI18n } from "@/lib/i18n";

export default function SubscriptionsPage() {
  const { t } = useI18n();
  const { data, error } = useSubscriptions();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">{t("yourSubscriptions")}</h1>
      {error && <p className="mt-4 text-redsignal">{error.message}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.map(({ subscription, leader }) => (
          <LeaderCard key={subscription.id} leader={leader} hrefPrefix="/app/leaders" />
        ))}
      </div>
    </main>
  );
}
