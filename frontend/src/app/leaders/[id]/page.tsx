"use client";

import { useParams } from "next/navigation";
import { Activity, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLeader, useLeaderPosts, useLeaderSignals, useSubscribe } from "@/hooks/use-leaders";
import { useI18n } from "@/lib/i18n";
import { parseStrategyTags } from "@/lib/strategy-tags";

export default function PublicLeaderDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const leader = useLeader(params.id);
  const posts = useLeaderPosts(params.id);
  const signals = useLeaderSignals(params.id);
  const subscribe = useSubscribe();

  if (leader.isLoading) return <main className="mx-auto max-w-6xl px-4 py-10 text-slate-400">{t("loadingProfile")}</main>;
  if (leader.error || !leader.data) return <main className="mx-auto max-w-6xl px-4 py-10 text-redsignal">{t("leaderNotFound")}</main>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-mint">@{leader.data.handle}</p>
          <h1 className="mt-3 text-4xl font-semibold">{leader.data.headline}</h1>
          <p className="mt-5 leading-7 text-slate-300">{leader.data.bio}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-300">
            {parseStrategyTags(leader.data.strategy).map((tag) => (
              <span key={tag} className="rounded bg-panel2 px-3 py-2">{tag}</span>
            ))}
            <span className="rounded bg-panel2 px-3 py-2">{t("risk")} {leader.data.risk_level}</span>
          </div>
          <Button className="mt-7" onClick={() => subscribe.mutate(leader.data.id)} disabled={subscribe.isPending}>
            {t("subscribeFree")}
          </Button>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("recentSignals")}</h2>
          {signals.data?.slice(0, 3).map((signal) => (
            <Card key={signal.id} className="p-4">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-mint" />
                <span className="font-semibold">{signal.symbol}</span>
                <span className="text-xs uppercase text-slate-400">{t(signal.side)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{signal.thesis}</p>
            </Card>
          ))}
          <h2 className="pt-4 text-lg font-semibold">{t("posts")}</h2>
          {posts.data?.slice(0, 3).map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-gold" />
                <span className="font-semibold">{post.title}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{post.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
