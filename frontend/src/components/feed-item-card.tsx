"use client";

import { Activity, FileText } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { FeedItem } from "@/types/api";
import { formatDateTime } from "@/lib/datetime";
import { useI18n } from "@/lib/i18n";

function formatValue(value: string | null) {
  if (!value) return "-";
  return Number(value).toFixed(2);
}

function formatReturnRate(value: string | null) {
  if (!value) return "-";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

export function FeedItemCard({ item }: { item: FeedItem }) {
  const { locale, t } = useI18n();
  const isSignal = item.type === "signal";

  if (isSignal) {
    return (
      <Card className="flex min-h-[190px] cursor-pointer flex-col p-4 transition hover:border-mint/50">
        <div className="flex min-h-8 items-start justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Activity size={16} className="shrink-0 text-mint" />
            <span className="truncate font-semibold">{item.item.symbol}</span>
            <span className="rounded bg-panel2 px-2 py-1 text-xs text-slate-300">{item.item.code || "-"}</span>
            <span className="rounded bg-mint/15 px-2 py-1 text-xs font-bold uppercase text-mint">{t(item.item.side)}</span>
          </div>
          <div className="shrink-0 text-right text-xs text-slate-500">
            <p className="text-mint">@{item.leader.handle}</p>
            <time>{formatDateTime(item.created_at, locale)}</time>
          </div>
        </div>
        <div className="mt-3 grid min-h-16 gap-2 text-xs text-slate-300 sm:grid-cols-4">
          <span className="rounded bg-panel2 px-2 py-1">{t("timeframe")}: {item.item.timeframe}</span>
          <span className="rounded bg-panel2 px-2 py-1">{t("entry")}: {formatValue(item.item.entry)}</span>
          <span className="rounded bg-panel2 px-2 py-1">{t("target")}: {formatValue(item.item.target)}</span>
          <span className="rounded bg-panel2 px-2 py-1">{t("stopLoss")}: {formatValue(item.item.stop_loss)}</span>
        </div>
        <div className="mt-2 min-h-7 text-xs">
          {item.item.is_archived && (
            <div className="flex flex-wrap gap-2">
              <span className="rounded border border-line bg-panel/70 px-2 py-1 text-slate-300">{t("archived")}</span>
              <span className="rounded border border-mint/30 bg-mint/10 px-2 py-1 text-mint">{t("returnRate")}: {formatReturnRate(item.item.return_rate)}</span>
            </div>
          )}
        </div>
        <p className="mt-auto line-clamp-2 text-sm leading-6 text-slate-400">{item.item.thesis}</p>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-[150px] cursor-pointer flex-col p-4 transition hover:border-mint/50">
      <div className="flex min-h-8 items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <FileText size={16} className="shrink-0 text-gold" />
          <h3 className="truncate font-semibold">{item.item.title}</h3>
        </div>
        <div className="shrink-0 text-right text-xs text-slate-500">
          <p className="text-mint">@{item.leader.handle}</p>
          <time>{formatDateTime(item.created_at, locale)}</time>
        </div>
      </div>
      <p className="mt-auto line-clamp-3 text-sm leading-6 text-slate-400">{item.item.body}</p>
    </Card>
  );
}
