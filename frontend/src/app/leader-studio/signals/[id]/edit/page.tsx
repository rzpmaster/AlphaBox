"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMyLeaderProfile, useMySignals, useUpdateSignal } from "@/hooks/use-leaders";
import { useI18n } from "@/lib/i18n";

type SignalSide = "long" | "short" | "watch";
const signalSideOptions = ["long", "short", "watch"] as const;

function formatEditablePrice(value: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed.includes(".")) return trimmed;
  return trimmed.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export default function EditSignalPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { locale, t } = useI18n();
  const profile = useMyLeaderProfile();
  const signals = useMySignals();
  const updateSignal = useUpdateSignal();
  const signalId = Number(params.id);
  const signal = signals.data?.find((item) => item.id === signalId);
  const isLocked = Boolean(signal?.is_archived);
  const [loadedSignalId, setLoadedSignalId] = useState<number | null>(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [form, setForm] = useState<{
    symbol: string;
    code: string;
    side: SignalSide;
    thesis: string;
    entry: string;
    target: string;
    stop_loss: string;
    timeframe: string;
  }>({
    symbol: "",
    code: "",
    side: "long",
    thesis: "",
    entry: "",
    target: "",
    stop_loss: "",
    timeframe: ""
  });

  useEffect(() => {
    if (!signal || loadedSignalId === signal.id) return;
    setForm({
      symbol: signal.symbol,
      code: signal.code ?? "",
      side: signal.side,
      thesis: signal.thesis,
      entry: formatEditablePrice(signal.entry),
      target: formatEditablePrice(signal.target),
      stop_loss: formatEditablePrice(signal.stop_loss),
      timeframe: signal.timeframe
    });
    setLoadedSignalId(signal.id);
  }, [loadedSignalId, signal]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await updateSignal.mutateAsync({
        id: signalId,
        ...form,
        symbol: form.symbol.trim().toUpperCase(),
        code: form.code.trim().toUpperCase(),
        thesis: form.thesis.trim(),
        timeframe: form.timeframe.trim()
      });
      router.push(`/leader-studio?lang=${locale}`);
    } catch {
      // Error is rendered from the mutation state below.
    }
  }

  function sideLabel(side: SignalSide) {
    return t(side);
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
        <h1 className="text-2xl font-semibold">{t("edit")} {t("publishedSignals")}</h1>
        {!signal && <p className="mt-4 text-sm text-slate-400">{t("noPublishedSignals")}</p>}
        {signal && (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder={t("symbol")} value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value.toUpperCase() })} readOnly={isLocked} required />
              <Input placeholder={t("code")} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} readOnly={isLocked} />
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={isSideMenuOpen}
                  aria-haspopup="listbox"
                  disabled={isLocked}
                  className="flex h-11 w-full items-center justify-between rounded-md border border-line bg-[#08120f] px-3 text-left text-sm text-slate-100 outline-none transition hover:border-mint/50 focus:border-mint"
                  onClick={() => setIsSideMenuOpen((isOpen) => !isOpen)}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-slate-500">{t("side")}</span>
                    <span>{sideLabel(form.side)}</span>
                  </span>
                  <ChevronDown className={isSideMenuOpen ? "rotate-180 text-mint transition" : "text-slate-500 transition"} size={16} />
                </button>
                {isSideMenuOpen && !isLocked && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-line bg-panel shadow-xl shadow-ink/50" role="listbox" aria-label={t("side")}>
                    {signalSideOptions.map((side) => (
                      <button
                        key={side}
                        type="button"
                        role="option"
                        aria-selected={form.side === side}
                        className="flex h-10 w-full items-center justify-between px-3 text-left text-sm text-slate-100 transition hover:bg-panel2"
                        onClick={() => {
                          setForm({ ...form, side });
                          setIsSideMenuOpen(false);
                        }}
                      >
                        <span>{sideLabel(side)}</span>
                        {form.side === side && <Check className="text-mint" size={16} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input placeholder={t("entry")} value={form.entry} onChange={(event) => setForm({ ...form, entry: event.target.value })} readOnly={isLocked} />
              <Input placeholder={t("target")} value={form.target} onChange={(event) => setForm({ ...form, target: event.target.value })} readOnly={isLocked} />
              <Input placeholder={t("stopLoss")} value={form.stop_loss} onChange={(event) => setForm({ ...form, stop_loss: event.target.value })} readOnly={isLocked} />
              <Input placeholder={t("timeframe")} value={form.timeframe} onChange={(event) => setForm({ ...form, timeframe: event.target.value })} readOnly={isLocked} />
            </div>
            <Textarea placeholder={t("signalThesis")} value={form.thesis} onChange={(event) => setForm({ ...form, thesis: event.target.value })} readOnly={isLocked} />
            {isLocked && <p className="text-sm text-gold">{t("archivedSignalLocked")}</p>}
            {updateSignal.error && <p className="text-sm text-redsignal">{updateSignal.error.message}</p>}
            <div className="flex flex-wrap gap-3">
              {!isLocked && <Button disabled={updateSignal.isPending || !profile.data}>{t("save")}</Button>}
              <Link href={`/leader-studio?lang=${locale}`}>
                <Button type="button" variant="ghost" disabled={updateSignal.isPending}>
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
