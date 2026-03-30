'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// ── Types ──────────────────────────────────────────────────────────────────
interface Feature {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
}

// ── Count-up animation ─────────────────────────────────────────────────────
function CountUp({ to, suffix = '', duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const steps = 60
    const increment = to / steps
    const interval = (duration * 1000) / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, interval)
    return () => clearInterval(timer)
  }, [inView, to, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// ── Feature icons ──────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="2.2"/>
    <path d="M17.5 17.5L23 23" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.25)"/>
  </svg>
)

const LightningIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M16 4L8 16h8l-4 8 12-14h-8L16 4z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
  </svg>
)

const BoxIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 4L24 9v10L14 24 4 19V9L14 4z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M14 4v20M4 9l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="8" y="10" width="13" height="14" rx="2" stroke="white" strokeWidth="2"/>
    <path d="M8 10V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="white" strokeWidth="2"/>
    <path d="M11 16h7M11 20h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const CartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M4 5h3l2.5 12h10L22 9H8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="11.5" cy="22" r="1.5" fill="white"/>
    <circle cx="19.5" cy="22" r="1.5" fill="white"/>
    <path d="M11 13h8M12 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
)

const KeyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="11" cy="12" r="5" stroke="white" strokeWidth="2"/>
    <path d="M15 15l8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 18l2 2M18 20l2 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// ── Data ───────────────────────────────────────────────────────────────────
const stats = [
  { value: 11, suffix: '+', label: 'Supported Agents' },
  { value: 2, suffix: '', label: 'Apps in Monorepo' },
  { value: 3, suffix: '', label: 'Platforms' },
  { value: 0, suffix: 'TS', label: 'Full TypeScript', isText: true },
]

const features: Feature[] = [
  {
    icon: <SearchIcon />,
    iconBg: 'linear-gradient(135deg, #1e3a5f 0%, #1a2d4a 100%)',
    title: 'Unified Discovery',
    description:
      'Scans all agent skill directories on startup — Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and more — and displays them in one place.',
  },
  {
    icon: <LightningIcon />,
    iconBg: 'linear-gradient(135deg, #1a3d2e 0%, #14532d 100%)',
    title: 'Enable / Disable',
    description:
      'Toggle skills on and off without deleting them. Disabled skills are safely moved to a .disabled/ subfolder and can be re-enabled anytime.',
  },
  {
    icon: <BoxIcon />,
    iconBg: 'linear-gradient(135deg, #1e2d4a 0%, #162040 100%)',
    title: 'GitHub Install',
    description:
      'Paste any GitHub repository URL. The app discovers available skills via GitHub\'s recursive tree API and lets you select which ones to install.',
  },
  {
    icon: <CopyIcon />,
    iconBg: 'linear-gradient(135deg, #3d1a0f 0%, #4a1a0a 100%)',
    title: 'Copy Between Agents',
    description:
      'Found a great Claude Code skill? Copy it to Cursor or Windsurf in one click. The app handles all path resolution automatically.',
  },
  {
    icon: <CartIcon />,
    iconBg: 'linear-gradient(135deg, #0f2d3d 0%, #0a2433 100%)',
    title: 'Marketplace',
    description:
      'Browse community-published skill packs from mcpmarket.com directly within the app. Search, preview, and install in a single flow.',
  },
  {
    icon: <KeyIcon />,
    iconBg: 'linear-gradient(135deg, #2d1a3d 0%, #1f1228 100%)',
    title: 'GitHub Token',
    description:
      'Stores a personal access token locally to lift GitHub API rate limits during skill discovery and installation — no server involved.',
  },
]

// ── Animated gradient text ─────────────────────────────────────────────────
const fadePop = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const, delay },
})

// ── Page ───────────────────────────────────────────────────────────────────
export default function DeepDivePage() {
  return (
    <main
      className="min-h-screen text-white"
      style={{
        background: 'radial-gradient(ellipse 120% 60% at 50% -10%, rgba(88,28,135,0.28) 0%, #08080f 50%, #08080f 100%)',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      }}
    >
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        {/* Badge */}
        <motion.div {...fadePop(0)}>
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-10"
            style={{
              background: 'rgba(88,28,135,0.25)',
              border: '1px solid rgba(139,92,246,0.35)',
              color: '#c4b5fd',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }}
            />
            Project Deep Dive · 2026
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="font-extrabold leading-[1.1] tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          {...fadePop(0.06)}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 55%, #67e8f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Productivity Boost
          </span>
          <br />
          <span style={{ color: '#ffffff' }}>Universal AI Agent Hub</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-slate-400 max-w-lg mx-auto leading-relaxed mb-14"
          style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)' }}
          {...fadePop(0.14)}
        >
          A cross-platform Electron desktop app providing a single unified interface to manage,
          discover, and install skills across 11+ AI coding assistants.
        </motion.p>

        {/* Divider line */}
        <motion.div
          className="w-full max-w-xl h-px mb-14"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.22 }}
        />

        {/* Stats row */}
        <motion.div
          className="flex flex-wrap items-end justify-center gap-x-12 gap-y-6"
          {...fadePop(0.28)}
        >
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="font-extrabold leading-none tabular-nums"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  background: 'linear-gradient(135deg, #818cf8 0%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.isText ? s.suffix : <CountUp to={s.value} suffix={s.suffix} />}
              </span>
              <span className="text-xs text-slate-500 font-medium">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── What it does ────────────────────────────────────────────────── */}
      <WhatItDoes />

      {/* Bottom padding */}
      <div className="h-24" />
    </main>
  )
}

// ── What it does section ───────────────────────────────────────────────────
function WhatItDoes() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="max-w-5xl mx-auto px-6">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-14"
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.25em] mb-4"
          style={{ color: '#7c3aed' }}
        >
          What it does
        </p>
        <h2
          className="font-extrabold leading-tight mb-4"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
        >
          One App to Rule All Skills
        </h2>
        <p className="text-slate-400 max-w-md leading-relaxed" style={{ fontSize: '0.95rem' }}>
          Every AI coding assistant stores skills in its own hidden folder with its own format.
          Productivity Boost unifies them all into a single, beautiful interface.
        </p>
      </motion.div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} parentInView={inView} />
        ))}
      </div>
    </section>
  )
}

// ── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({
  feature,
  index,
  parentInView,
}: {
  feature: Feature
  index: number
  parentInView: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={parentInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 + index * 0.07 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group rounded-2xl p-6 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300"
        style={{ background: feature.iconBg }}
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="font-bold text-white mb-2.5" style={{ fontSize: '1rem' }}>
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-slate-500 leading-relaxed text-sm group-hover:text-slate-400 transition-colors duration-200">
        {feature.description}
      </p>
    </motion.div>
  )
}
