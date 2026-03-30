import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Instrument_Serif } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

const BASE_URL = 'https://sm.idoevergreen.me'
const OG_IMAGE = `${BASE_URL}/productivity-boost-1.0.jpg`
const TITLE = 'Productivity Boost — Universal AI Agent Skills Hub'
const DESCRIPTION =
  'Manage, install, and sync AI agent skills across Claude Code, Cursor, GitHub Copilot, Windsurf, Gemini CLI, and more — in one free desktop app for Windows.'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'AI agent skills', 'prompt manager', 'Claude Code skills', 'Cursor rules',
    'GitHub Copilot instructions', 'Windsurf skills', 'Gemini CLI', 'AI coding agent',
    'productivity boost', 'AI skills manager', 'coding agent tools', 'developer tools',
  ],
  authors: [{ name: 'Zunalabs', url: BASE_URL }],
  creator: 'Zunalabs',
  publisher: 'Zunalabs',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: '/' },

  icons: {
    icon: '/productivity-boost-1.0.jpg',
    apple: '/productivity-boost-1.0.jpg',
    shortcut: '/productivity-boost-1.0.jpg',
  },

  // ── Open Graph (Facebook, WhatsApp, LinkedIn, Instagram) ──────────────────
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: BASE_URL,
    siteName: 'Productivity Boost',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        secureUrl: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Productivity Boost — One place for all your AI agent skills',
        type: 'image/jpeg',
      },
    ],
  },

  // ── Twitter / X ───────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    creator: '@zunalabs',
    site: '@zunalabs',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans antialiased">{children}<Analytics /></body>
    </html>
  )
}
