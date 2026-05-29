"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useArchiveSignal, useMyLeaderProfile, useMySignals } from "@/hooks/use-leaders";
import { useI18n } from "@/lib/i18n";

function formatEditablePrice(value: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed.includes(".")) return trimmed;
  return trimmed.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function formatReturnRate(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "";
  return `${(value * 100).toFixed(2)}%`;
}

const readonlyFieldClass = "cursor-not-allowed border-line/70 bg-panel2/70 text-slate-300 focus:border-line/70";

export default function ArchiveSignalPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { locale, t } = useI18n();
  const profile = useMyLeaderProfile();
  const signals = useMySignals();
  const archiveSignal = useArchiveSignal();
  const signalId = Number(params.id);
  const signal = signals.data?.find((item) => item.id === signalId);
  const [currentPrice, setCurrentPrice] = useState("");

  useEffect(() => {
    if (signal?.exit_price) setCurrentPrice(formatEditablePrice(signal.exit_price));
  }, [signal?.exit_price]);

  const previewReturn = useMemo(() => {
    if (!signal || signal.side === "watch") return null;
    const entry = Number(signal.entry);
    const price = Number(currentPrice);
    if (!entry || entry <= 0 || !price || price <= 0) return null;
    return signal.side === "long" ? (price - entry) / entry : (entry - price) / entry;
  }, [currentPrice, signal]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await archiveSignal.mutateAsync({ id: signalId, current_price: currentPrice.trim() });
      router.push(`/leader-studio?lang=${locale}`);
    } catch {
      // Error is rendered from the mutation state below.
    }
  }

  if (signals.isLoading || profile.isLoading) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-slate-400">{t("loadingProfile")}</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {!profile.data && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold">{t("profileRequired")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{t("profileRequiredCopy")}</p>
          <Link className="mt-5 inline-flex" href={`/leader-studio?lang=${locale}`}>
            <Button>{t("createProfileNow")}</Button>
          </Link>
        </Card>
      )}
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("archiveSignal")}</h1>
        {!signal && <p className="mt-4 text-sm text-slate-400">{t("noPublishedSignals")}</p>}
        {signal && (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input className={readonlyFieldClass} placeholder={t("symbol")} value={signal.symbol} readOnly />
              <Input className={readonlyFieldClass} placeholder={t("code")} value={signal.code ?? ""} readOnly />
              <Input className={readonlyFieldClass} placeholder={t("side")} value={t(signal.side)} readOnly />
              <Input className={readonlyFieldClass} placeholder={t("entry")} value={formatEditablePrice(signal.entry)} readOnly />
              <Input className={readonlyFieldClass} placeholder={t("target")} value={formatEditablePrice(signal.target)} readOnly />
              <Input className={readonlyFieldClass} placeholder={t("stopLoss")} value={formatEditablePrice(signal.stop_loss)} readOnly />
              <Input className={readonlyFieldClass} placeholder={t("timeframe")} value={signal.timeframe} readOnly />
            </div>
            <Textarea className={readonlyFieldClass} placeholder={t("signalThesis")} value={signal.thesis} readOnly />
            <Input placeholder={t("currentPrice")} value={currentPrice} onChange={(event) => setCurrentPrice(event.target.value)} disabled={signal.is_archived} required />
            {signal.side !== "watch" && (
              <p className="text-sm text-slate-300">
                {t("returnRate")}: {formatReturnRate(signal.is_archived ? Number(signal.return_rate) : previewReturn)}
              </p>
            )}
            {signal.is_archived && <p className="text-sm text-gold">{t("archivedSignalLocked")}</p>}
            {archiveSignal.error && <p className="text-sm text-redsignal">{archiveSignal.error.message}</p>}
            <div className="flex flex-wrap gap-3">
              {!signal.is_archived && <Button disabled={archiveSignal.isPending || !profile.data}>{t("archiveAndCalculate")}</Button>}
              <Link href={`/leader-studio?lang=${locale}`}>
                <Button type="button" variant="ghost" disabled={archiveSignal.isPending}>
                  {t("cancel")}
                </Button>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </main>
  );
}
