"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Leader } from "@/types/api";
import { useI18n } from "@/lib/i18n";
import { parseStrategyTags } from "@/lib/strategy-tags";

export function LeaderCard({ leader, hrefPrefix = "/leaders" }: { leader: Leader; hrefPrefix?: string }) {
  const { t } = useI18n();

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-mint">@{leader.handle}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{leader.headline}</h3>
        </div>
        <ShieldCheck className="text-gold" size={22} />
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{leader.bio}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
        {parseStrategyTags(leader.strategy).map((tag) => (
          <span key={tag} className="rounded bg-panel2 px-2 py-1">{tag}</span>
        ))}
        <span className="rounded bg-panel2 px-2 py-1">{t("risk")} {leader.risk_level}</span>
      </div>
      <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-mint" href={`${hrefPrefix}/${leader.id}`}>
        {t("viewProfile")} <ArrowUpRight size={16} />
      </Link>
    </Card>
  );
}
