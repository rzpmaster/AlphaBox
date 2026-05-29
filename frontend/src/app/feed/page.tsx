"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FeedItemCard } from "@/components/feed-item-card";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFeed } from "@/hooks/use-leaders";
import { useI18n } from "@/lib/i18n";

export default function AppHomePage() {
  const { t } = useI18n();
  useRequireAuth();
  const feed = useFeed();
  const [typeFilter, setTypeFilter] = useState<"all" | "signal" | "post">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "7d" | "30d">("all");
  const filteredFeed = useMemo(() => {
    const now = Date.now();
    return (feed.data ?? []).filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (timeFilter === "7d") return now - new Date(item.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000;
      if (timeFilter === "30d") return now - new Date(item.created_at).getTime() <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  }, [feed.data, timeFilter, typeFilter]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-mint">{t("subscriberFeed")}</p>
          <h1 className="mt-3 text-3xl font-semibold">{t("latestIntelligence")}</h1>
        </div>
        <Link href="/feed/subscriptions">
          <Button variant="ghost">{t("subscriptions")}</Button>
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        {(["all", "signal", "post"] as const).map((type) => (
          <button key={type} className={typeFilter === type ? "rounded-md bg-mint px-3 py-2 text-sm font-semibold text-ink" : "rounded-md border border-line bg-panel/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-mint/50"} onClick={() => setTypeFilter(type)}>
            {t(type)}
          </button>
        ))}
        {(["all", "7d", "30d"] as const).map((time) => (
          <button key={time} className={timeFilter === time ? "rounded-md bg-mint px-3 py-2 text-sm font-semibold text-ink" : "rounded-md border border-line bg-panel/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-mint/50"} onClick={() => setTimeFilter(time)}>
            {t(time)}
          </button>
        ))}
      </div>
      <div className="grid gap-4">
        {filteredFeed.map((item) => (
          <Link key={`${item.type}-${item.item.id}`} href={`/feed/${item.type === "signal" ? "signals" : "posts"}/${item.item.id}`}>
            <FeedItemCard item={item} />
          </Link>
        ))}
        {filteredFeed.length === 0 && <p className="text-slate-400">{t("emptyFeed")}</p>}
        {feed.error && <p className="text-redsignal">{feed.error.message}</p>}
      </div>
    </main>
  );
}
