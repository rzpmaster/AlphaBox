"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, LogOut, Radar, UserRound } from "lucide-react";

import { logout, useMe } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export function Nav() {
  const { locale, setLocale, t } = useI18n();
  const me = useMe();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const nextLocale = locale === "zh" ? "en" : "zh";
  const isAdmin = me.data?.role === "admin";
  const feedHref = me.data ? "/feed" : "/auth/login";
  const studioHref = me.data ? "/leader-studio" : "/auth/login";

  useEffect(() => {
    if (!me.data) {
      setAvatarUrl("");
      return;
    }
    setAvatarUrl(getAvatarUrl(me.data.id));
  }, [me.data]);

  function roleLabel(role: string) {
    if (role === "admin") return t("adminRole");
    if (role === "leader") return t("leaderRole");
    return t("followerRole");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line/80 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-md bg-mint text-ink">
            <Radar size={18} />
          </span>
          <span>AlphaBox</span>
          <span className="hidden text-sm text-slate-400 sm:inline">{t("brandCn")}</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm text-slate-300">
          <Link className="px-2 py-2 hover:text-mint" href="/leaders">
            {t("navLeaders")}
          </Link>
          <Link className="px-2 py-2 hover:text-mint" href={feedHref}>
            {t("navFeed")}
          </Link>
          <Link className="px-2 py-2 hover:text-mint" href={studioHref}>
            {t("navStudio")}
          </Link>
          {isAdmin && (
            <Link className="px-2 py-2 hover:text-mint" href="/admin">
              {t("navAdmin")}
            </Link>
          )}
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-panel/70 px-3 text-sm font-semibold text-slate-100 transition hover:border-mint/50"
            onClick={() => setLocale(nextLocale)}
            aria-label="Switch language"
          >
            {t("language")}
          </button>
          {!me.data && (
            <Link href="/auth/login">
              <Button variant="ghost">
                <LogIn size={16} />
                <span className="hidden sm:inline">{t("loginAction")}</span>
              </Button>
            </Link>
          )}
          {me.data && (
            <div className="group relative">
              <button
                type="button"
                className="flex h-11 items-center gap-2 rounded-md border border-line bg-panel/80 px-2 pr-3 text-left shadow-sm shadow-ink/30 transition hover:border-mint/50 hover:bg-panel2/80"
              >
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md border border-mint/30 bg-mint/15 text-xs font-semibold text-mint shadow-inner shadow-mint/10">
                  {avatarUrl ? <img className="size-full object-cover" src={avatarUrl} alt="" /> : me.data.display_name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden min-w-0 md:block">
                  <span className="block max-w-28 truncate text-sm font-semibold text-slate-100">{me.data.display_name}</span>
                  <span className="block text-[11px] text-mint/80">{roleLabel(me.data.role)}</span>
                </span>
              </button>
              <div className="pointer-events-none absolute right-0 top-full w-48 pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="overflow-hidden rounded-lg border border-line/90 bg-ink/95 p-1 shadow-2xl shadow-ink/70 backdrop-blur-md">
                  <Link
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-panel2 hover:text-mint"
                    href="/account"
                  >
                    <UserRound size={15} />
                    {t("profile")}
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-200 transition hover:bg-redsignal/10 hover:text-redsignal"
                    onClick={() => setIsLogoutConfirmOpen(true)}
                  >
                    <LogOut size={15} />
                    {t("logout")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[100] grid min-h-screen place-items-center bg-ink/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-5 shadow-2xl shadow-ink/60">
            <h2 className="text-lg font-semibold text-slate-100">{t("confirmLogoutTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{t("confirmLogoutCopy")}</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsLogoutConfirmOpen(false)}>{t("cancel")}</Button>
              <Button variant="danger" onClick={logout}>{t("logout")}</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
