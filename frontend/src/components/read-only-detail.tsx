"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import type { Post, Signal } from "@/types/api";

function formatValue(value: string | null) {
  if (!value) return "";
  return value;
}

export function ReadOnlyPostDetail({ post }: { post: Post }) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("post")}</h1>
        <div className="mt-6 space-y-4">
          <Input placeholder={t("title")} value={post.title} readOnly />
          <Textarea placeholder={t("marketContext")} value={post.body} readOnly />
          <Button type="button" variant="ghost" onClick={() => router.back()}>{t("back")}</Button>
        </div>
      </Card>
    </main>
  );
}

export function ReadOnlySignalDetail({ signal }: { signal: Signal }) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("signal")}</h1>
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder={t("symbol")} value={signal.symbol} readOnly />
            <Input placeholder={t("code")} value={signal.code ?? ""} readOnly />
            <Input placeholder={t("side")} value={t(signal.side)} readOnly />
            <Input placeholder={t("entry")} value={formatValue(signal.entry)} readOnly />
            <Input placeholder={t("target")} value={formatValue(signal.target)} readOnly />
            <Input placeholder={t("stopLoss")} value={formatValue(signal.stop_loss)} readOnly />
            <Input placeholder={t("timeframe")} value={signal.timeframe} readOnly />
          </div>
          <Textarea placeholder={t("signalThesis")} value={signal.thesis} readOnly />
          <Button type="button" variant="ghost" onClick={() => router.back()}>{t("back")}</Button>
        </div>
      </Card>
    </main>
  );
}
