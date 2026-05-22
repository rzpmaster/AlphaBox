"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMyLeaderProfile, useMyPosts, useUpdatePost } from "@/hooks/use-leaders";
import { useI18n } from "@/lib/i18n";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { locale, t } = useI18n();
  const profile = useMyLeaderProfile();
  const posts = useMyPosts();
  const updatePost = useUpdatePost();
  const postId = Number(params.id);
  const post = posts.data?.find((item) => item.id === postId);
  const [loadedPostId, setLoadedPostId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!post || loadedPostId === post.id) return;
    setTitle(post.title);
    setBody(post.body);
    setLoadedPostId(post.id);
  }, [loadedPostId, post]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await updatePost.mutateAsync({ id: postId, title: title.trim(), body: body.trim() });
      router.push(`/leader?lang=${locale}`);
    } catch {
      // Error is rendered from the mutation state below.
    }
  }

  if (posts.isLoading || profile.isLoading) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-slate-400">{t("loadingProfile")}</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {!profile.data && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold">{t("profileRequired")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{t("profileRequiredCopy")}</p>
          <Link className="mt-5 inline-flex" href={`/leader?lang=${locale}`}>
            <Button>{t("createProfileNow")}</Button>
          </Link>
        </Card>
      )}
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("edit")} {t("publishedPosts")}</h1>
        {!post && <p className="mt-4 text-sm text-slate-400">{t("noPublishedPosts")}</p>}
        {post && (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Input placeholder={t("title")} value={title} onChange={(event) => setTitle(event.target.value)} required />
            <Textarea placeholder={t("marketContext")} value={body} onChange={(event) => setBody(event.target.value)} required />
            {updatePost.error && <p className="text-sm text-redsignal">{updatePost.error.message}</p>}
            <div className="flex flex-wrap gap-3">
              <Button disabled={updatePost.isPending || !profile.data}>{t("save")}</Button>
              <Link href={`/leader?lang=${locale}`}>
                <Button type="button" variant="ghost" disabled={updatePost.isPending}>
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
