"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole, LogIn, LucideIcon, RadioTower, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const features: { titleKey: "privateNetwork" | "signalFeed" | "noExecution"; copyKey: "privateNetworkCopy" | "signalFeedCopy" | "noExecutionCopy"; Icon: LucideIcon }[] = [
  { titleKey: "privateNetwork", copyKey: "privateNetworkCopy", Icon: LockKeyhole },
  { titleKey: "signalFeed", copyKey: "signalFeedCopy", Icon: RadioTower },
  { titleKey: "noExecution", copyKey: "noExecutionCopy", Icon: ShieldAlert }
];

export default function HomePage() {
  const { t } = useI18n();

  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-12 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-mint">{t("homeEyebrow")}</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">{t("homeTitle")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            {t("homeCopy")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/register">
              <Button className="min-w-32">
                {t("requestAccess")} <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button className="min-w-32" variant="ghost">
                {t("loginAction")} <LogIn size={16} />
              </Button>
            </Link>
            <Link href="/leaders">
              <Button variant="ghost">{t("browseLeaders")}</Button>
            </Link>
          </div>
        </div>
        <div className="grid content-center gap-4">
          {features.map(({ titleKey, copyKey, Icon }) => (
            <div key={titleKey} className="rounded-lg border border-line bg-panel/80 p-5 shadow-glow">
              <Icon className="text-mint" size={22} />
              <h2 className="mt-4 text-lg font-semibold">{t(titleKey)}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{t(copyKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
