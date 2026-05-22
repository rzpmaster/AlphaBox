"use client";

import { Activity, FileText } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { FeedItem } from "@/types/api";
import { formatDateTime } from "@/lib/datetime";
import { useI18n } from "@/lib/i18n";

export function FeedItemCard({ item }: { item: FeedItem }) {
  const { locale, t } = useI18n();
  const isSignal = item.type === "signal";
  const sideLabel = isSignal ? t(item.item.side) : "";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
        <span className="flex items-center gap-2 text-mint">
          {isSignal ? <Activity size={16} /> : <FileText size={16} />}
          @{item.leader.handle}
        </span>
        <time>{formatDateTime(item.created_at, locale)}</time>
      </div>
      {isSignal ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold">{item.item.symbol}</h3>
            <span className="rounded bg-mint px-2 py-1 text-xs font-bold uppercase text-ink">{sideLabel}</span>
            <span className="text-sm text-slate-400">{item.item.timeframe}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{item.item.thesis}</p>
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">{item.item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{item.item.body}</p>
        </div>
      )}
    </Card>
  );
}
