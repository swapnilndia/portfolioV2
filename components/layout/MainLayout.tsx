import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import './MainLayout.scss'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-layout__main">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

