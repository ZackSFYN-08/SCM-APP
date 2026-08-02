"use client";

import { useLanguageStore } from "@/lib/stores/languageStore";
import { translations, Locale } from "./translations";

export function useTranslation() {
  const { locale, setLocale, toggleLocale } = useLanguageStore();

  const t = (key: string): string => {
    const translation = translations[locale]?.[key];
    if (translation === undefined) {
      // Fallback to English, then to the key itself
      return translations["en"]?.[key] ?? key;
    }
    return translation;
  };

  return { t, locale, setLocale, toggleLocale };
}
