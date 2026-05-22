"use client";

import Link from "next/link";
import { LogOut, Radar } from "lucide-react";

import { logout, useMe } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function Nav() {
  const { locale, setLocale, t } = useI18n();
  const me = useMe();
  const nextLocale = locale === "zh" ? "en" : "zh";
  const isAdmin = me.data?.role === "admin";

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
          <Link className="px-2 py-2 hover:text-mint" href="/app">
            {t("navFeed")}
          </Link>
          <Link className="px-2 py-2 hover:text-mint" href="/leader">
            {t("navStudio")}
          </Link>
          {isAdmin && (
            <Link className="px-2 py-2 hover:text-mint" href="/admin/invitations">
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
          {me.data && (
            <div className="hidden items-center gap-2 rounded-md border border-line bg-panel/70 px-3 py-2 text-xs text-slate-300 md:flex">
              <span className="max-w-28 truncate text-slate-100">{me.data.display_name}</span>
              <span className="rounded bg-panel2 px-2 py-0.5 uppercase text-mint">{me.data.role}</span>
            </div>
          )}
          <Button className="hidden sm:inline-flex" variant="ghost" onClick={logout} aria-label={t("logout")}>
            <LogOut size={16} />
          </Button>
        </nav>
      </div>
    </header>
  );
}
