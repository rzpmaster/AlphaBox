"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCancelSubscription, useSubscriptions } from "@/hooks/use-leaders";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useI18n } from "@/lib/i18n";

export default function SubscriptionsPage() {
  const { t } = useI18n();
  useRequireAuth();
  const { data, error } = useSubscriptions();
  const cancelSubscription = useCancelSubscription();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">{t("yourSubscriptions")}</h1>
      {error && <p className="mt-4 text-redsignal">{error.message}</p>}
      <div className="mt-8 grid gap-4">
        {data?.map(({ subscription, leader }) => (
          <Card key={subscription.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-mint">@{leader.handle}</p>
                <h2 className="mt-1 text-xl font-semibold">{leader.headline}</h2>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded bg-panel2 px-2 py-1">{t(subscription.billing_period)}</span>
                  <span className="rounded bg-panel2 px-2 py-1">¥{Number(subscription.amount).toFixed(2)}</span>
                  <span className="rounded bg-panel2 px-2 py-1">{t(subscription.status)}</span>
                  {subscription.expires_at && <span className="rounded bg-panel2 px-2 py-1">{t("expiresAt")} {new Date(subscription.expires_at).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/leaders/${leader.id}`}>
                  <Button variant="ghost">{t("viewProfile")}</Button>
                </Link>
                {subscription.status === "paid" && (
                  <Button variant="danger" disabled={cancelSubscription.isPending} onClick={() => cancelSubscription.mutate(leader.id)}>
                    {t("cancelSubscription")}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
