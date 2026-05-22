import type { Locale } from "@/lib/i18n";

const DEFAULT_TIME_ZONE = "UTC+8";

function normalizeTimeZone(timeZone: string) {
  const value = timeZone.trim();
  const offsetMatch = value.match(/^UTC([+-])(\d{1,2})$/i);
  if (!offsetMatch) return value || DEFAULT_TIME_ZONE;

  const sign = offsetMatch[1];
  const hours = Number(offsetMatch[2]);
  if (!Number.isInteger(hours) || hours < 0 || hours > 14) return DEFAULT_TIME_ZONE;

  // IANA Etc/GMT signs are inverted: Etc/GMT-8 means UTC+8.
  return `Etc/GMT${sign === "+" ? "-" : "+"}${hours}`;
}

function parseApiDateTime(value: string) {
  const trimmed = value.trim();
  const hasTimeZone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  return new Date(hasTimeZone ? trimmed : `${trimmed}Z`);
}

export function appTimeZone() {
  return process.env.NEXT_PUBLIC_TIME_ZONE ?? DEFAULT_TIME_ZONE;
}

export function formatDateTime(value: string, locale: Locale) {
  const date = parseApiDateTime(value);
  const timeZone = normalizeTimeZone(appTimeZone());
  const language = locale === "zh" ? "zh-CN" : "en-US";

  try {
    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(language, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: normalizeTimeZone(DEFAULT_TIME_ZONE)
    }).format(date);
  }
}
