"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, BadgeX, Ban, Copy, KeyRound, ShieldMinus, ShieldPlus, Trash2, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMe } from "@/hooks/use-auth";
import {
  useAdminUsers,
  useAdminSubscriptions,
  useBanUser,
  useCreateInvitationCodes,
  useDeleteInvitationCode,
  useDeleteSubscription,
  useInvitationCodes,
  usePromoteAdmin,
  useRevokeAdmin,
  useUnbanUser,
  useUpdateSubscriptionStatus,
  useUnverifyLeader,
  useVerifyLeader
} from "@/hooks/use-admin";
import { formatDateTime } from "@/lib/datetime";
import { useI18n } from "@/lib/i18n";
import type { AdminUser } from "@/types/api";

const invitationPageSize = 10;
const userActionButtonClass = "h-9 min-w-0 px-3 text-xs";
const userDangerButtonClass = "h-9 min-w-0 border border-redsignal/50 bg-redsignal/15 px-3 text-xs text-redsignal hover:border-redsignal hover:bg-redsignal/25";

type AdminDeletionTarget =
  | { type: "invitation"; id: number; code: string }
  | {
      type: "subscription";
      id: number;
      userName: string;
      leaderHandle: string;
      amount: string;
      billingPeriod: "monthly" | "yearly";
    };

function includesText(value: string | number | null | undefined, query: string) {
  return String(value ?? "").toLowerCase().includes(query.trim().toLowerCase());
}

function getUserRoleLabels(user: AdminUser, t: ReturnType<typeof useI18n>["t"]) {
  const labels: string[] = [];
  if (user.role === "admin") labels.push(t("adminRole"));
  if (user.leader_id) labels.push(t("leaderRole"));
  if (labels.length === 0) labels.push(t("userRole"));
  return labels;
}

function matchesRoleFilter(user: AdminUser, role: "all" | "admin" | "leader" | "user") {
  if (role === "all") return true;
  if (role === "admin") return user.role === "admin";
  if (role === "leader") return Boolean(user.leader_id);
  return user.role !== "admin" && !user.leader_id;
}

export default function InvitationAdminPage() {
  const { locale, t } = useI18n();
  const me = useMe();
  const invitations = useInvitationCodes();
  const users = useAdminUsers();
  const subscriptions = useAdminSubscriptions();
  const createCodes = useCreateInvitationCodes();
  const deleteCode = useDeleteInvitationCode();
  const promoteAdmin = usePromoteAdmin();
  const revokeAdmin = useRevokeAdmin();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const verifyLeader = useVerifyLeader();
  const unverifyLeader = useUnverifyLeader();
  const updateSubscriptionStatus = useUpdateSubscriptionStatus();
  const deleteSubscription = useDeleteSubscription();
  const [count, setCount] = useState(5);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [invitationQuery, setInvitationQuery] = useState("");
  const [invitationStatus, setInvitationStatus] = useState<"all" | "used" | "unused">("all");
  const [invitationPage, setInvitationPage] = useState(1);
  const [userQuery, setUserQuery] = useState("");
  const [userRole, setUserRole] = useState<"all" | "admin" | "leader" | "user">("all");
  const [userStatus, setUserStatus] = useState<"all" | "active" | "banned">("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState<"all" | "pending" | "paid" | "cancelled" | "expired">("all");
  const [orderPeriod, setOrderPeriod] = useState<"all" | "monthly" | "yearly">("all");
  const [pendingDeletion, setPendingDeletion] = useState<AdminDeletionTarget | null>(null);

  const filteredInvitations = useMemo(() => {
    return (invitations.data ?? []).filter((invitation) => {
      if (invitationStatus === "used" && !invitation.is_used) return false;
      if (invitationStatus === "unused" && invitation.is_used) return false;
      if (!invitationQuery.trim()) return true;
      return includesText(invitation.code, invitationQuery) || includesText(invitation.used_by_name, invitationQuery);
    });
  }, [invitationQuery, invitationStatus, invitations.data]);
  const invitationPageCount = Math.max(1, Math.ceil(filteredInvitations.length / invitationPageSize));
  const pagedInvitations = filteredInvitations.slice((Math.min(invitationPage, invitationPageCount) - 1) * invitationPageSize, Math.min(invitationPage, invitationPageCount) * invitationPageSize);

  const filteredUsers = useMemo(() => {
    return (users.data ?? []).filter((user) => {
      if (!matchesRoleFilter(user, userRole)) return false;
      if (userStatus === "active" && !user.is_active) return false;
      if (userStatus === "banned" && user.is_active) return false;
      if (!userQuery.trim()) return true;
      return includesText(user.display_name, userQuery) || includesText(user.email, userQuery);
    });
  }, [userQuery, userRole, userStatus, users.data]);

  const filteredSubscriptions = useMemo(() => {
    return (subscriptions.data ?? []).filter(({ subscription, leader, user }) => {
      if (orderStatus !== "all" && subscription.status !== orderStatus) return false;
      if (orderPeriod !== "all" && subscription.billing_period !== orderPeriod) return false;
      if (!orderQuery.trim()) return true;
      return includesText(user.display_name, orderQuery) || includesText(user.email, orderQuery) || includesText(leader.handle, orderQuery);
    });
  }, [orderPeriod, orderQuery, orderStatus, subscriptions.data]);

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

  function confirmDeletion() {
    if (!pendingDeletion) return;
    if (pendingDeletion.type === "invitation") {
      deleteCode.mutate(pendingDeletion.id, { onSuccess: () => setPendingDeletion(null) });
      return;
    }
    deleteSubscription.mutate(pendingDeletion.id, { onSuccess: () => setPendingDeletion(null) });
  }

  function deletionCopy() {
    if (!pendingDeletion) return "";
    if (pendingDeletion.type === "invitation") {
      return locale === "zh"
        ? `确认删除邀请码 ${pendingDeletion.code} 吗？删除后不可恢复。`
        : `Delete invitation code ${pendingDeletion.code}? This action cannot be undone.`;
    }
    return locale === "zh"
      ? `确认删除 ${pendingDeletion.userName} 订阅 @${pendingDeletion.leaderHandle} 的订单吗？金额 ${pendingDeletion.amount}，周期 ${t(pendingDeletion.billingPeriod)}。删除后不可恢复。`
      : `Delete ${pendingDeletion.userName}'s order for @${pendingDeletion.leaderHandle}? Amount ${pendingDeletion.amount}, period ${t(pendingDeletion.billingPeriod)}. This action cannot be undone.`;
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
  const isDeleting = deleteCode.isPending || deleteSubscription.isPending;

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
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-line bg-panel/50 p-4 md:flex-row md:items-center">
          <Input className="md:max-w-xs" placeholder={t("filterKeyword")} value={invitationQuery} onChange={(event) => { setInvitationQuery(event.target.value); setInvitationPage(1); }} />
          <div className="flex flex-wrap gap-2">
            {(["all", "used", "unused"] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={invitationStatus === status ? "rounded-md bg-mint px-3 py-2 text-sm font-semibold text-ink" : "rounded-md border border-line bg-panel/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-mint/50"}
                onClick={() => { setInvitationStatus(status); setInvitationPage(1); }}
              >
                {t(status)}
              </button>
            ))}
          </div>
        </div>
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
              {pagedInvitations.map((invitation) => (
                <tr key={invitation.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <code className="font-semibold text-mint">{invitation.code}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={invitation.is_used ? "text-gold" : "text-mint"}>
                      {invitation.is_used ? t("used") : t("unused")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{invitation.used_by_name ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(invitation.created_at, locale)}</td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => copyCode(invitation.code)}>
                        <Copy size={16} />
                        {copiedCode === invitation.code ? t("copied") : t("copy")}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        disabled={invitation.is_used || deleteCode.isPending}
                        onClick={() => setPendingDeletion({ type: "invitation", id: invitation.id, code: invitation.code })}
                      >
                        <Trash2 size={16} />
                        {t("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvitations.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={5}>
                    {t("noInvitationCodes")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-400">
          <span>{t("page")} {Math.min(invitationPage, invitationPageCount)} / {invitationPageCount}</span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" disabled={invitationPage <= 1} onClick={() => setInvitationPage((page) => Math.max(1, page - 1))}>{t("previous")}</Button>
            <Button type="button" variant="ghost" disabled={invitationPage >= invitationPageCount} onClick={() => setInvitationPage((page) => Math.min(invitationPageCount, page + 1))}>{t("next")}</Button>
          </div>
        </div>
        {copyNotice && <p className="mt-3 text-sm text-gold">{copyNotice}</p>}
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{t("userManagement")}</h2>
          <p className="mt-2 text-sm text-slate-400">{t("userManagementCopy")}</p>
        </div>
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-line bg-panel/50 p-4 xl:flex-row xl:items-center">
          <Input className="xl:max-w-xs" placeholder={t("filterKeyword")} value={userQuery} onChange={(event) => setUserQuery(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            {(["all", "admin", "leader", "user"] as const).map((role) => (
              <button key={role} type="button" className={userRole === role ? "rounded-md bg-mint px-3 py-2 text-sm font-semibold text-ink" : "rounded-md border border-line bg-panel/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-mint/50"} onClick={() => setUserRole(role)}>
                {role === "all" ? t("all") : role === "admin" ? t("adminRole") : role === "leader" ? t("leaderRole") : t("userRole")}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "active", "banned"] as const).map((status) => (
              <button key={status} type="button" className={userStatus === status ? "rounded-md bg-mint px-3 py-2 text-sm font-semibold text-ink" : "rounded-md border border-line bg-panel/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-mint/50"} onClick={() => setUserStatus(status)}>
                {t(status)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full min-w-[1080px] border-collapse bg-panel/80 text-sm">
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-100">{user.display_name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {getUserRoleLabels(user, t).map((label) => (
                        <span key={label} className="rounded bg-panel2 px-2 py-1 text-xs text-slate-200">
                          {label}
                        </span>
                      ))}
                      {user.leader_is_verified && (
                        <span className="rounded bg-mint/15 px-2 py-1 text-xs font-semibold text-mint">
                          {t("siteVerified")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={user.is_active ? "text-mint" : "text-redsignal"}>
                      {user.is_active ? t("active") : t("banned")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{user.following_count}</td>
                  <td className="px-4 py-3 text-slate-300">{user.follower_count}</td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex min-w-[260px] flex-col items-end gap-2">
                      <div className="flex flex-wrap justify-end gap-2">
                        {user.role === "admin" ? (
                          <Button
                            className={userActionButtonClass}
                            type="button"
                            variant="ghost"
                            disabled={user.id === currentUserId || revokeAdmin.isPending}
                            onClick={() => revokeAdmin.mutate(user.id)}
                          >
                            <ShieldMinus size={15} />
                            {t("revokeAdmin")}
                          </Button>
                        ) : (
                          <Button
                            className={userActionButtonClass}
                            type="button"
                            variant="ghost"
                            disabled={promoteAdmin.isPending}
                            onClick={() => promoteAdmin.mutate(user.id)}
                          >
                            <ShieldPlus size={15} />
                            {t("promoteAdmin")}
                          </Button>
                        )}
                        {user.leader_id && (
                          user.leader_is_verified ? (
                            <Button className={userActionButtonClass} type="button" variant="ghost" disabled={unverifyLeader.isPending} onClick={() => unverifyLeader.mutate(user.leader_id!)}>
                              <BadgeX size={15} />
                              {t("unverifyLeader")}
                            </Button>
                          ) : (
                            <Button className={userActionButtonClass} type="button" variant="ghost" disabled={verifyLeader.isPending} onClick={() => verifyLeader.mutate(user.leader_id!)}>
                              <BadgeCheck size={15} />
                              {t("verifyLeader")}
                            </Button>
                          )
                        )}
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        {user.is_active ? (
                          <Button
                            className={userDangerButtonClass}
                            type="button"
                            variant="ghost"
                            disabled={user.id === currentUserId || banUser.isPending}
                            onClick={() => banUser.mutate(user.id)}
                          >
                            <Ban size={15} />
                            {t("ban")}
                          </Button>
                        ) : (
                          <Button className={userActionButtonClass} type="button" variant="ghost" disabled={unbanUser.isPending} onClick={() => unbanUser.mutate(user.id)}>
                            <UserCheck size={15} />
                            {t("unban")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={8}>
                    {t("noUsers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{t("orderManagement")}</h2>
          <p className="mt-2 text-sm text-slate-400">{t("orderManagementCopy")}</p>
        </div>
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-line bg-panel/50 p-4 xl:flex-row xl:items-center">
          <Input className="xl:max-w-xs" placeholder={t("filterKeyword")} value={orderQuery} onChange={(event) => setOrderQuery(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "paid", "cancelled", "expired"] as const).map((status) => (
              <button key={status} type="button" className={orderStatus === status ? "rounded-md bg-mint px-3 py-2 text-sm font-semibold text-ink" : "rounded-md border border-line bg-panel/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-mint/50"} onClick={() => setOrderStatus(status)}>
                {t(status)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "monthly", "yearly"] as const).map((period) => (
              <button key={period} type="button" className={orderPeriod === period ? "rounded-md bg-mint px-3 py-2 text-sm font-semibold text-ink" : "rounded-md border border-line bg-panel/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-mint/50"} onClick={() => setOrderPeriod(period)}>
                {t(period)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full min-w-[980px] border-collapse bg-panel/80 text-sm">
            <thead className="bg-panel2 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">{t("user")}</th>
                <th className="px-4 py-3">{t("leaderRole")}</th>
                <th className="px-4 py-3">{t("amount")}</th>
                <th className="px-4 py-3">{t("billingPeriod")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3">{t("expiresAt")}</th>
                <th className="px-4 py-3">{t("createdAt")}</th>
                <th className="px-4 py-3 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map(({ subscription, leader, user }) => (
                <tr key={subscription.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-100">{user.display_name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">@{leader.handle}</td>
                  <td className="px-4 py-3 text-slate-300">¥{Number(subscription.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">{t(subscription.billing_period)}</td>
                  <td className="px-4 py-3">
                    <span className={subscription.status === "paid" ? "text-mint" : subscription.status === "cancelled" ? "text-redsignal" : "text-gold"}>
                      {t(subscription.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{subscription.expires_at ? formatDateTime(subscription.expires_at, locale) : "-"}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDateTime(subscription.created_at, locale)}</td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <div className="inline-grid grid-cols-2 overflow-hidden rounded-md border border-line bg-panel/70">
                        {(["pending", "paid", "cancelled", "expired"] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            className={
                              subscription.status === status
                                ? "bg-mint px-3 py-2 text-xs font-semibold text-ink"
                                : status === "cancelled" || status === "expired"
                                  ? "px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-redsignal/10 hover:text-redsignal disabled:cursor-not-allowed disabled:opacity-50"
                                  : "px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-panel2 hover:text-mint disabled:cursor-not-allowed disabled:opacity-50"
                            }
                            disabled={subscription.status === status || updateSubscriptionStatus.isPending}
                            onClick={() => updateSubscriptionStatus.mutate({ id: subscription.id, status })}
                          >
                            {t(status)}
                          </button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="danger"
                        disabled={deleteSubscription.isPending}
                        onClick={() =>
                          setPendingDeletion({
                            type: "subscription",
                            id: subscription.id,
                            userName: user.display_name,
                            leaderHandle: leader.handle,
                            amount: `¥${Number(subscription.amount).toFixed(2)}`,
                            billingPeriod: subscription.billing_period
                          })
                        }
                      >
                        <Trash2 size={16} />
                        {t("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={8}>
                    {t("noOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {pendingDeletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-5 shadow-2xl shadow-redsignal/10">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-redsignal/15 text-redsignal">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{t("confirmDeletionTitle")}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{deletionCopy()}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button className="min-w-20" type="button" variant="ghost" onClick={() => setPendingDeletion(null)} disabled={isDeleting}>
                {t("cancel")}
              </Button>
              <Button className="min-w-20" type="button" variant="danger" onClick={confirmDeletion} disabled={isDeleting}>
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
