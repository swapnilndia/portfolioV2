'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { I18nProvider } from '@/components/providers/I18nProvider'
import { useUiStore } from '@/store/uiStore'

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const { chatOpen } = useUiStore()

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

