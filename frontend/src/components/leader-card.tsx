"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Leader } from "@/types/api";
import { useI18n } from "@/lib/i18n";
import { parseStrategyTags } from "@/lib/strategy-tags";

function riskClassName(riskLevel: string) {
  if (riskLevel === "Low") return "border-mint/40 bg-mint/10 text-mint";
  if (riskLevel === "High") return "border-redsignal/50 bg-redsignal/10 text-redsignal";
  return "border-gold/50 bg-gold/10 text-gold";
}

function riskIconClassName(riskLevel: string) {
  if (riskLevel === "Low") return "text-mint";
  if (riskLevel === "High") return "text-redsignal";
  return "text-gold";
}

export function LeaderCard({ leader, hrefPrefix = "/leaders", locked = false }: { leader: Leader; hrefPrefix?: string; locked?: boolean }) {
  const { t } = useI18n();
  const href = locked ? "/auth/login" : `${hrefPrefix}/${leader.id}`;

  return (
    <Card
      className={
        locked
          ? "relative overflow-hidden border-mint/10 bg-panel/45 p-5 backdrop-blur-md transition hover:border-mint/40"
          : leader.is_verified
            ? "relative overflow-hidden border-mint/60 bg-mint/[0.04] p-5 shadow-lg shadow-mint/10 transition hover:border-mint"
            : "relative p-5 transition hover:border-mint/50"
      }
    >
      <Link className="absolute inset-0 z-10" href={href} aria-label={`${t("viewProfile")} ${leader.handle}`} />
      <div className={locked ? "pointer-events-none select-none blur-[5px]" : ""}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-mint">@{leader.handle}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{leader.headline}</h3>
            {leader.is_verified && (
              <span className="mt-2 inline-flex rounded border border-mint/40 bg-mint/15 px-2 py-1 text-xs font-semibold text-mint">{t("verifiedLeader")}</span>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              title={`${t("risk")} ${leader.risk_level}`}
              aria-label={`${t("risk")} ${leader.risk_level}`}
            >
              <ShieldCheck className={riskIconClassName(leader.risk_level)} size={22} />
            </span>
          </div>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{leader.bio}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
          {parseStrategyTags(leader.strategy).map((tag) => (
            <span key={tag} className="rounded bg-panel2 px-2 py-1">{tag}</span>
          ))}
          <span className={`rounded border px-2 py-1 font-semibold ${riskClassName(leader.risk_level)}`}>{t("risk")} {leader.risk_level}</span>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-mint">
            {t("viewProfile")} <ArrowUpRight size={16} />
          </span>
          {leader.is_verified && !locked && (
            <span className="inline-flex items-center gap-1 rounded-full border border-mint/50 bg-mint/10 px-3 py-1 text-xs font-bold text-mint">
              <span className="size-1.5 rounded-full bg-mint" />
              {t("siteVerified")}
            </span>
          )}
        </div>
      </div>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/20 px-5 text-center backdrop-blur-[2px]">
          <span className="rounded-md border border-line bg-ink/80 px-4 py-2 text-sm font-semibold text-mint shadow-xl shadow-ink/60">
            {t("loginToView")}
          </span>
        </div>
      )}
    </Card>
  );
}
