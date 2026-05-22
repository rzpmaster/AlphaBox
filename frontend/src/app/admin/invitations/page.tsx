"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Ban, Copy, KeyRound, ShieldPlus, Trash2, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMe } from "@/hooks/use-auth";
import {
  useAdminUsers,
  useBanUser,
  useCreateInvitationCodes,
  useDeleteInvitationCode,
  useInvitationCodes,
  usePromoteAdmin,
  useUnbanUser
} from "@/hooks/use-admin";
import { formatDateTime } from "@/lib/datetime";
import { useI18n } from "@/lib/i18n";
import type { AdminUser } from "@/types/api";

export default function InvitationAdminPage() {
  const { locale, t } = useI18n();
  const me = useMe();
  const invitations = useInvitationCodes();
  const users = useAdminUsers();
  const createCodes = useCreateInvitationCodes();
  const deleteCode = useDeleteInvitationCode();
  const promoteAdmin = usePromoteAdmin();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const [count, setCount] = useState(5);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await createCodes.mutateAsync({ count });
  }

  async function copyCode(code: string) {
    setCopyNotice(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        return;
      }
      if (fallbackCopy(code)) {
        setCopiedCode(code);
      } else {
        setCopyNotice(t("copyManual"));
      }
    } catch {
      if (fallbackCopy(code)) {
        setCopiedCode(code);
      } else {
        setCopyNotice(t("copyManual"));
      }
    }
  }

  function fallbackCopy(code: string) {
    const textarea = document.createElement("textarea");
    textarea.value = code;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    if (copied) {
      document.body.removeChild(textarea);
    }
    return copied;
  }

  function roleLabel(user: AdminUser) {
    if (user.role === "admin") return t("adminRole");
    if (user.role === "leader") return t("leaderRole");
    return t("followerRole");
  }

  if (me.isLoading) {
    return <main className="mx-auto max-w-6xl px-4 py-10 text-slate-400">{t("checkingAccess")}</main>;
  }

  if (me.data?.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold">{t("adminAccessRequired")}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{t("adminAccessRequiredCopy")}</p>
          <Link className="mt-5 inline-flex" href="/auth/login?lang=zh">
            <Button>{t("login")}</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const currentUserId = me.data.id;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-mint">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold">{t("invitationAdmin")}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{t("invitationAdminCopy")}</p>
      </div>

      <Card className="p-6">
        <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm text-slate-300">
            {t("count")}
            <Input
              className="sm:w-36"
              min={1}
              max={100}
              type="number"
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              required
            />
          </label>
          <Button className="sm:mb-0" disabled={createCodes.isPending}>
            <KeyRound size={16} />
            {t("generateCodes")}
          </Button>
          <Link href="/auth/register?lang=zh">
            <Button type="button" variant="ghost">
              {t("openRegister")}
            </Button>
          </Link>
        </form>
        {createCodes.error && <p className="mt-4 text-sm text-redsignal">{createCodes.error.message}</p>}
      </Card>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{t("generatedCodes")}</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          <table className="w-full min-w-[760px] border-collapse bg-panel/80 text-sm">
            <thead className="bg-panel2 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3">{t("usedBy")}</th>
                <th className="px-4 py-3">{t("createdAt")}</th>
                <th className="px-4 py-3 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {invitations.data?.map((invitation) => (
                <tr key={invitation.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <code className="font-semibold text-mint">{invitation.code}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={invitation.is_used ? "text-gold" : "text-mint"}>
                      {invitation.is_used ? t("used") : t("unused")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{invitation.used_by_id ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(invitation.created_at, locale)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => copyCode(invitation.code)}>
                        <Copy size={16} />
                        {copiedCode === invitation.code ? t("copied") : t("copy")}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        disabled={invitation.is_used || deleteCode.isPending}
                        onClick={() => deleteCode.mutate(invitation.id)}
                      >
                        <Trash2 size={16} />
                        {t("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {invitations.data?.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={5}>
                    {t("noInvitationCodes")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {copyNotice && <p className="mt-3 text-sm text-gold">{copyNotice}</p>}
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{t("userManagement")}</h2>
          <p className="mt-2 text-sm text-slate-400">{t("userManagementCopy")}</p>
        </div>
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full min-w-[980px] border-collapse bg-panel/80 text-sm">
            <thead className="bg-panel2 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("user")}</th>
                <th className="px-4 py-3">{t("role")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3">{t("following")}</th>
                <th className="px-4 py-3">{t("followers")}</th>
                <th className="px-4 py-3 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.data?.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-100">{user.display_name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{roleLabel(user)}</td>
                  <td className="px-4 py-3">
                    <span className={user.is_active ? "text-mint" : "text-redsignal"}>
                      {user.is_active ? t("active") : t("banned")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{user.following_count}</td>
                  <td className="px-4 py-3 text-slate-300">{user.follower_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={user.role === "admin" || promoteAdmin.isPending}
                        onClick={() => promoteAdmin.mutate(user.id)}
                      >
                        <ShieldPlus size={16} />
                        {t("promoteAdmin")}
                      </Button>
                      {user.is_active ? (
                        <Button
                          type="button"
                          variant="danger"
                          disabled={user.id === currentUserId || banUser.isPending}
                          onClick={() => banUser.mutate(user.id)}
                        >
                          <Ban size={16} />
                          {t("ban")}
                        </Button>
                      ) : (
                        <Button type="button" variant="ghost" disabled={unbanUser.isPending} onClick={() => unbanUser.mutate(user.id)}>
                          <UserCheck size={16} />
                          {t("unban")}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.data?.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    {t("noUsers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
