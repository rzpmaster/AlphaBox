"use client";

import { FormEvent, useEffect, useState } from "react";
import { Camera, KeyRound, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdateMe } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getAvatarUrl, storeAvatarUrl } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function AccountPage() {
  const { t } = useI18n();
  const me = useRequireAuth();
  const updateMe = useUpdateMe();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!me.data) return;
    setDisplayName(me.data.display_name);
    setAvatarUrl(getAvatarUrl(me.data.id));
  }, [me.data]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!me.data) return;
    setMessage("");
    storeAvatarUrl(me.data.id, avatarUrl.trim());
    await updateMe.mutateAsync({
      display_name: displayName,
      current_password: currentPassword || undefined,
      new_password: newPassword || undefined
    });
    setCurrentPassword("");
    setNewPassword("");
    setMessage(t("profileSaved"));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-mint">{t("profile")}</p>
      <h1 className="mt-3 text-3xl font-semibold">{t("accountSettings")}</h1>

      <Card className="mt-8 p-6">
        <form className="grid gap-6" onSubmit={onSubmit}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 place-items-center overflow-hidden rounded-lg border border-mint/30 bg-mint/15 text-2xl font-semibold text-mint">
              {avatarUrl ? <img className="size-full object-cover" src={avatarUrl} alt="" /> : displayName.slice(0, 1).toUpperCase() || <UserRound />}
            </div>
            <div className="min-w-0 flex-1">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Camera size={16} />
                {t("avatarUrl")}
              </label>
              <Input placeholder="https://..." value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <UserRound size={16} />
                {t("displayName")}
              </label>
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <KeyRound size={16} />
                {t("currentPassword")}
              </label>
              <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">{t("newPassword")}</label>
              <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </div>
          </div>

          {updateMe.error && <p className="text-sm text-redsignal">{updateMe.error.message}</p>}
          {message && <p className="text-sm text-mint">{message}</p>}
          <Button className="w-fit" disabled={updateMe.isPending}>{t("saveProfile")}</Button>
        </form>
      </Card>
    </main>
  );
}
