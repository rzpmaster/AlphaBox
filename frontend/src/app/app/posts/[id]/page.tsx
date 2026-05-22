"use client";

import { useParams } from "next/navigation";

import { ReadOnlyPostDetail } from "@/components/read-only-detail";
import { usePost } from "@/hooks/use-leaders";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useI18n } from "@/lib/i18n";

export default function PostDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  useRequireAuth();
  const post = usePost(params.id);

  if (post.isLoading) return <main className="mx-auto max-w-3xl px-4 py-10 text-slate-400">{t("loadingProfile")}</main>;
  if (post.error || !post.data) return <main className="mx-auto max-w-3xl px-4 py-10 text-redsignal">{t("leaderNotFound")}</main>;

  return <ReadOnlyPostDetail post={post.data} />;
}
