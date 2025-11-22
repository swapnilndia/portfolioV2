import type { Metadata } from 'next'
import { LayoutClient } from './LayoutClient'
import '@/styles/globals.scss'

export const metadata: Metadata = {
  title: 'Swapnil Katiyar - Front-End Developer',
  description: 'Portfolio of Swapnil Katiyar, Front-End Developer with 3+ years of experience',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}
