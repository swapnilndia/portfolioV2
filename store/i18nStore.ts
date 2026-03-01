import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "hi";

interface I18nStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "portfolio-language",
      skipHydration: true,
    }
  )
);
