"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { useUiStore } from "@/store/uiStore";
import { useThemeStore } from "@/store/themeStore";
import { useI18nStore } from "@/store/i18nStore";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const { chatOpen } = useUiStore();
  const { theme } = useThemeStore();

  // Rehydrate persist stores after mount to prevent hydration mismatch
  useEffect(() => {
    useThemeStore.persist.rehydrate();
    useI18nStore.persist.rehydrate();
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <I18nProvider>
      <div className={`main-layout ${chatOpen ? "main-layout--chat-open" : ""}`}>
        <Header />
        <main className="main-layout__main">{children}</main>
        <Footer />
        <ChatWidget />
      </div>
    </I18nProvider>
  );
}
