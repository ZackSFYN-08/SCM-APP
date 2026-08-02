import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const USD_TO_IDR_RATE = 18059.96;

import { useLanguageStore } from "@/lib/stores/languageStore";

export function formatNumber(num: number): string {
  const locale = useLanguageStore.getState().locale;
  const localeStr = locale === "id" ? "id-ID" : "en-US";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return num.toLocaleString(localeStr);
  }
  return num.toString();
}

export function formatCurrency(amount: number): string {
  const locale = useLanguageStore.getState().locale;
  const localeStr = locale === "id" ? "id-ID" : "en-US";
  const currency = locale === "id" ? "IDR" : "USD";
  
  // Base currency is USD. Convert to IDR using exchange rate when locale is id
  const convertedAmount = locale === "id" ? amount * USD_TO_IDR_RATE : amount;

  return new Intl.NumberFormat(localeStr, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertedAmount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function relativeTime(date: Date | { toDate: () => Date }): string {
  const now = new Date();
  const target = date instanceof Date ? date : date.toDate();
  const diffMs = now.getTime() - target.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 10) return "Baru saja";
  if (diffSecs < 60) return `${diffSecs} detik lalu`;
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return target.toLocaleDateString("id-ID");
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    good: "text-emerald-400",
    low: "text-error",
    depleted: "text-outline",
    active: "text-emerald-400",
    offline: "text-outline",
    preferred: "text-primary-container",
    standard: "text-outline",
    probation: "text-amber-400",
    "in-transit": "text-primary-container",
    delivered: "text-emerald-400",
    delayed: "text-error",
    pending: "text-amber-400",
    draft: "text-outline",
    approved: "text-emerald-400",
    processing: "text-primary-container",
    shipped: "text-inverse-primary",
    cancelled: "text-error",
  };
  return colors[status] || "text-outline";
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    good: "bg-emerald-500/15 text-emerald-400",
    low: "bg-error/15 text-error",
    depleted: "bg-white/5 text-outline",
    active: "bg-emerald-500/15 text-emerald-400",
    offline: "bg-white/5 text-outline",
    preferred: "bg-primary-container/15 text-inverse-primary",
    standard: "bg-white/5 text-outline",
    probation: "bg-amber-500/15 text-amber-400",
    "in-transit": "bg-primary-container/15 text-inverse-primary",
    delivered: "bg-emerald-500/15 text-emerald-400",
    delayed: "bg-error/15 text-error",
    pending: "bg-amber-500/15 text-amber-400",
    admin: "bg-primary-container/20 text-inverse-primary",
    manager: "bg-secondary-container/20 text-secondary-fixed-dim",
    warehouse: "bg-amber-500/15 text-amber-400",
    procurement: "bg-emerald-500/15 text-emerald-400",
    finance: "bg-error/15 text-error",
  };
  return colors[status] || "bg-white/5 text-outline";
}
