import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

// Sentry is initialised client-side via @sentry/nextjs when NEXT_PUBLIC_SENTRY_DSN is set.
// The DSN is safe to expose publicly — it only allows sending events, not reading them.

export const metadata: Metadata = {
  metadataBase: new URL('https://fatimazehraaitutor-yci1.vercel.app'),
  title: 'FatimaZehra AI Tutor - Learn Python with AI',
  description: 'Master Python with AI-powered personalized learning paths. Free chapters 1-3, Premium access to all 10 chapters.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'FatimaZehra AI Tutor - Learn Python with AI',
    description: 'Master Python with AI-powered personalized learning paths, quizzes, and weakness analysis.',
    url: 'https://fatimazehraaitutor-yci1.vercel.app',
    siteName: 'FatimaZehra AI Tutor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FatimaZehra AI Tutor',
    description: 'Master Python with AI-powered personalized learning paths.',
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
