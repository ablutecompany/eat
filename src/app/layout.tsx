import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'eat — Planeamento Alimentar Familiar',
  description: 'Planeamento alimentar inteligente para toda a família. Receitas, ingredientes e lista de compras sincronizados com as necessidades de cada membro.',
  keywords: ['planeamento alimentar', 'família', 'receitas', 'nutrição', 'lista de compras'],
  authors: [{ name: 'eat' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#446656',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-PT">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#faf9f8] text-[#303333] antialiased">
        {children}
      </body>
    </html>
  )
}
