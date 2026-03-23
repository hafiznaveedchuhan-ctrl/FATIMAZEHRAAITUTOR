import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'FatimaZehra AI Tutor - Learn Python with AI',
  description: 'Master Python with AI-powered personalized learning paths. Free chapters 1-3, Premium access to all 10 chapters.',
  openGraph: {
    title: 'FatimaZehra AI Tutor',
    description: 'Learn Python with AI coaching',
    url: 'https://fatimazehra-ai-tutor.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
