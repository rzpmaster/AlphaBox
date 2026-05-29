"use client";

import { useParams } from "next/navigation";

import { ReadOnlySignalDetail } from "@/components/read-only-detail";
import { useSignal } from "@/hooks/use-leaders";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useI18n } from "@/lib/i18n";

export default function SignalDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  useRequireAuth();
  const signal = useSignal(params.id);

  if (signal.isLoading) return <main className="mx-auto max-w-3xl px-4 py-10 text-slate-400">{t("loadingProfile")}</main>;
  if (signal.error || !signal.data) return <main className="mx-auto max-w-3xl px-4 py-10 text-redsignal">{t("leaderNotFound")}</main>;

  return <ReadOnlySignalDetail signal={signal.data} />;
}
