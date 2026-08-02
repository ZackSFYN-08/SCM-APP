import { create } from "zustand";
import type { Locale } from "@/lib/i18n/translations";

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  locale: "id",
  setLocale: (locale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flowchain-locale", locale);
    }
    set({ locale });
  },
  toggleLocale: () =>
    set((state) => {
      const newLocale = state.locale === "id" ? "en" : "id";
      if (typeof window !== "undefined") {
        localStorage.setItem("flowchain-locale", newLocale);
      }
      return { locale: newLocale };
    }),
}));
