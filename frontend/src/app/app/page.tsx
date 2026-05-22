"use client";

import Link from "next/link";

import { FeedItemCard } from "@/components/feed-item-card";
import { Button } from "@/components/ui/button";
import { useFeed } from "@/hooks/use-leaders";
import { useI18n } from "@/lib/i18n";

export default function AppHomePage() {
  const { t } = useI18n();
  const feed = useFeed();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-mint">{t("subscriberFeed")}</p>
          <h1 className="mt-3 text-3xl font-semibold">{t("latestIntelligence")}</h1>
        </div>
        <Link href="/app/subscriptions">
          <Button variant="ghost">{t("subscriptions")}</Button>
        </Link>
      </div>
      <div className="space-y-4">
        {feed.data?.map((item) => <FeedItemCard key={`${item.type}-${item.item.id}`} item={item} />)}
        {feed.data?.length === 0 && <p className="text-slate-400">{t("emptyFeed")}</p>}
        {feed.error && <p className="text-redsignal">{feed.error.message}</p>}
      </div>
    </main>
  );
}
