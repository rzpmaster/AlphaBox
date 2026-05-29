"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity, CheckCircle2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLeader, useLeaderPosts, useLeaderSignals, useSubscribe, useSubscription } from "@/hooks/use-leaders";
import { formatDateTime } from "@/lib/datetime";
import { useI18n } from "@/lib/i18n";
import { parseStrategyTags } from "@/lib/strategy-tags";

function formatValue(value: string | null) {
  if (!value) return "-";
  return Number(value).toFixed(2);
}

function formatReturnRate(value: string | null) {
  if (!value) return "-";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function riskClassName(riskLevel: string) {
  if (riskLevel === "Low") return "border-mint/40 bg-mint/10 text-mint";
  if (riskLevel === "High") return "border-redsignal/50 bg-redsignal/10 text-redsignal";
  return "border-gold/50 bg-gold/10 text-gold";
}

export default function PublicLeaderDetailPage() {
  const { locale, t } = useI18n();
  const params = useParams<{ id: string }>();
  const leader = useLeader(params.id);
  const posts = useLeaderPosts(params.id);
  const signals = useLeaderSignals(params.id);
  const subscription = useSubscription(params.id);
  const subscribe = useSubscribe();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);
  const isPaid = subscription.data?.status === "paid" && (!subscription.data.expires_at || new Date(subscription.data.expires_at) > new Date());

  async function onSubscribeClick() {
    setOrderNotice(null);
    const result = await subscription.refetch();
    const currentSubscription = result.data;
    const hasActiveOrder =
      currentSubscription?.status === "paid" &&
      (!currentSubscription.expires_at || new Date(currentSubscription.expires_at) > new Date());

    if (hasActiveOrder) {
      setOrderNotice(
        locale === "zh"
          ? `支付成功，订阅有效期至 ${currentSubscription.expires_at ? formatDateTime(currentSubscription.expires_at, locale) : "长期"}。`
          : `Payment confirmed. Subscription is active until ${currentSubscription.expires_at ? formatDateTime(currentSubscription.expires_at, locale) : "no expiry"}.`
      );
      return;
    }

    setIsOrderDialogOpen(true);
  }

  async function confirmOrder() {
    if (!leader.data) return;
    await subscribe.mutateAsync({ leaderId: leader.data.id, billing_period: billingPeriod });
    setIsOrderDialogOpen(false);
    setOrderNotice(locale === "zh" ? "订单已创建，请联系管理员付款。" : "Order created. Please contact an administrator to pay.");
  }

  if (leader.isLoading) return <main className="mx-auto max-w-6xl px-4 py-10 text-slate-400">{t("loadingProfile")}</main>;
  if (leader.error || !leader.data) return <main className="mx-auto max-w-6xl px-4 py-10 text-redsignal">{t("leaderNotFound")}</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-mint">@{leader.data.handle}</p>
              <h1 className="mt-3 text-4xl font-semibold">{leader.data.headline}</h1>
            </div>
            {leader.data.is_verified ? (
              <div className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-md border border-mint/50 bg-mint/15 px-3 py-2 text-sm font-semibold text-mint shadow-sm shadow-mint/10">
                <span className="size-2 rounded-full bg-mint" />
                {t("siteVerified")}
              </div>
            ) : (
              <div className="mt-1 inline-flex shrink-0 rounded-md border border-line bg-panel/70 px-3 py-2 text-sm font-semibold text-slate-400">
                {t("unverifiedLeader")}
              </div>
            )}
          </div>
          <p className="mt-5 leading-7 text-slate-300">{leader.data.bio}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-300">
            {parseStrategyTags(leader.data.strategy).map((tag) => (
              <span key={tag} className="rounded bg-panel2 px-3 py-2">{tag}</span>
            ))}
            <span className={`rounded border px-3 py-2 font-semibold ${riskClassName(leader.data.risk_level)}`}>{t("risk")} {leader.data.risk_level}</span>
          </div>
          <Button
            className="mt-7 min-h-12 min-w-44 bg-mint px-7 text-base shadow-lg shadow-mint/20 hover:bg-[#8affcc]"
            onClick={onSubscribeClick}
            disabled={subscribe.isPending || subscription.isFetching}
          >
            {isPaid ? t("subscribed") : subscription.data?.status === "pending" ? t("pendingPayment") : t("subscribe")}
          </Button>
          {orderNotice && <p className="mt-3 text-sm text-mint">{orderNotice}</p>}
          {subscription.data && (
            <p className="mt-3 text-sm text-slate-400">
              {t("orderStatus")}: <span className={isPaid ? "text-mint" : "text-gold"}>{t(subscription.data.status)}</span>
              {subscription.data.expires_at && <span> · {t("expiresAt")} {formatDateTime(subscription.data.expires_at, locale)}</span>}
            </p>
          )}
          {subscribe.error && <p className="mt-3 text-sm text-redsignal">{subscribe.error.message}</p>}
        </div>
        <div className="relative">
          <div className={isPaid ? "grid gap-4" : "pointer-events-none select-none grid gap-4 blur-[5px]"}>
            <h2 className="text-lg font-semibold">{t("recentSignals")}</h2>
            {signals.data?.slice(0, 3).map((signal) => (
              <Link key={signal.id} href={`/feed/signals/${signal.id}`} className={!isPaid ? "pointer-events-none block" : "block"}>
                <Card className={isPaid ? "flex min-h-[190px] cursor-pointer flex-col p-4 hover:border-mint/50" : "flex min-h-[190px] flex-col p-4"}>
                  <div className="flex min-h-8 items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <Activity size={16} className="shrink-0 text-mint" />
                      <span className="truncate font-semibold">{signal.symbol}</span>
                      <span className="rounded bg-panel2 px-2 py-1 text-xs text-slate-300">{signal.code || "-"}</span>
                      <span className="rounded bg-mint/15 px-2 py-1 text-xs font-bold uppercase text-mint">{t(signal.side)}</span>
                    </div>
                    <time className="shrink-0 text-xs text-slate-500">{formatDateTime(signal.created_at, locale)}</time>
                  </div>
                  <div className="mt-3 grid min-h-16 gap-2 text-xs text-slate-300 sm:grid-cols-4">
                    <span className="rounded bg-panel2 px-2 py-1">{t("timeframe")}: {signal.timeframe}</span>
                    <span className="rounded bg-panel2 px-2 py-1">{t("entry")}: {formatValue(signal.entry)}</span>
                    <span className="rounded bg-panel2 px-2 py-1">{t("target")}: {formatValue(signal.target)}</span>
                    <span className="rounded bg-panel2 px-2 py-1">{t("stopLoss")}: {formatValue(signal.stop_loss)}</span>
                  </div>
                  <div className="mt-2 min-h-7 text-xs">
                    {signal.is_archived && (
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded border border-line bg-panel/70 px-2 py-1 text-slate-300">{t("archived")}</span>
                        <span className="rounded border border-mint/30 bg-mint/10 px-2 py-1 text-mint">{t("returnRate")}: {formatReturnRate(signal.return_rate)}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-auto line-clamp-2 text-sm leading-6 text-slate-400">{signal.thesis}</p>
                </Card>
              </Link>
            ))}
            <h2 className="pt-4 text-lg font-semibold">{t("posts")}</h2>
            {posts.data?.slice(0, 3).map((post) => (
              <Link key={post.id} href={`/feed/posts/${post.id}`} className={!isPaid ? "pointer-events-none" : ""}>
                <Card className={isPaid ? "cursor-pointer p-4 hover:border-mint/50" : "p-4"}>
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gold" />
                    <span className="font-semibold">{post.title}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{post.body}</p>
                </Card>
              </Link>
            ))}
          </div>
          {!isPaid && (
            <div className="absolute inset-0 grid place-items-center rounded-lg bg-ink/20 px-6 text-center backdrop-blur-[2px]">
              <div className="rounded-lg border border-line bg-ink/85 p-5 shadow-2xl shadow-ink/60">
                <p className="font-semibold text-slate-100">{t("paidContentLocked")}</p>
                <p className="mt-2 text-sm text-slate-400">{t("paidContentLockedCopy")}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {isOrderDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-line bg-panel p-5 shadow-2xl shadow-ink/60">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-mint/15 text-mint">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{locale === "zh" ? "选择订阅周期" : "Choose billing period"}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {locale === "zh" ? "请选择按月或按年创建订单。确认后订单会进入待支付状态。" : "Choose a monthly or yearly order. After confirmation, the order will be marked pending payment."}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(["monthly", "yearly"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  className={
                    billingPeriod === period
                      ? "rounded-md border border-mint bg-mint/15 p-4 text-left shadow-sm shadow-mint/10"
                      : "rounded-md border border-line bg-[#08120f] p-4 text-left transition hover:border-mint/60"
                  }
                  onClick={() => setBillingPeriod(period)}
                >
                  <span className="block font-semibold text-slate-100">{t(period)}</span>
                  <span className="mt-2 block text-sm text-mint">¥{Number(period === "monthly" ? leader.data.monthly_price : leader.data.yearly_price).toFixed(2)}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsOrderDialogOpen(false)} disabled={subscribe.isPending}>
                {t("cancel")}
              </Button>
              <Button type="button" onClick={confirmOrder} disabled={subscribe.isPending}>
                {locale === "zh" ? "确认创建" : "Create order"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
