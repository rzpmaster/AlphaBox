"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost, useMyLeaderProfile } from "@/hooks/use-leaders";
import { useI18n } from "@/lib/i18n";

export default function NewPostPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const profile = useMyLeaderProfile();
  const createPost = useCreatePost();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await createPost.mutateAsync({ title: title.trim(), body: body.trim() });
      router.push(`/leader?lang=${locale}`);
    } catch {
      // Error is rendered from the mutation state below.
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {!profile.data && !profile.isLoading && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold">{t("profileRequired")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{t("profileRequiredCopy")}</p>
          <Link className="mt-5 inline-flex" href="/leader">
            <Button>{t("createProfileNow")}</Button>
          </Link>
        </Card>
      )}
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("newPost")}</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input placeholder={t("title")} value={title} onChange={(event) => setTitle(event.target.value)} required />
          <Textarea placeholder={t("marketContext")} value={body} onChange={(event) => setBody(event.target.value)} required />
          {createPost.error && <p className="text-sm text-redsignal">{createPost.error.message}</p>}
          {createPost.isSuccess && <p className="text-sm text-mint">{t("postPublished")}</p>}
          <Button disabled={createPost.isPending || !profile.data}>{t("publishPost")}</Button>
        </form>
      </Card>
    </main>
  );
}
