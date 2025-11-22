'use client'

import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { I18nProvider } from '@/components/providers/I18nProvider'
import { useUiStore } from '@/store/uiStore'
import { useThemeStore } from '@/store/themeStore'

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const { chatOpen } = useUiStore()
  const { theme } = useThemeStore()

  // Initialize theme on mount to prevent hydration mismatch
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <I18nProvider>
      <div className={`main-layout ${chatOpen ? 'main-layout--chat-open' : ''}`}>
        <Header />
        <main className="main-layout__main">{children}</main>
        <Footer />
        <ChatWidget />
      </div>
    </I18nProvider>
  )
}

