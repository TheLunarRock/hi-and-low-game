import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'

export const viewport: Viewport = {
  themeColor: '#15803d',
}

export const metadata: Metadata = {
  title: 'Hi & Low',
  description: 'Card game',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hi & Low',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="font-rounded">{children}</body>
    </html>
  )
}
