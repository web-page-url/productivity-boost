'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Faq from './Faq'
import { AgentIcon } from './AgentIcon'
import ScrollReveal from './ScrollReveal'
import { ShootingStars } from './ShootingStars'
import { motion, useInView, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import Image from 'next/image'
import ThreeScene from './ThreeScene'
import Magnetic from './Magnetic'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
})

// Word-stagger: splits text into individual animated words

// Count-up number animation — bounces on completion
function CountUp({ to, suffix = '', duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const [popped, setPopped] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(ease * to))
      if (t < 1) requestAnimationFrame(tick)
      else { setPopped(true); setTimeout(() => setPopped(false), 450) }
    }
    requestAnimationFrame(tick)
  }, [inView, to, duration])

  return <span ref={ref} className={popped ? 'animate-num-pop inline-block' : 'inline-block'}>{count}{suffix}</span>
}

// Mouse-tracking spotlight inside each card
function MouseSpotCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
        setVisible(true)
      }}
      onMouseLeave={() => setVisible(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: visible ? 1 : 0,
          background: `radial-gradient(280px circle at ${pos.x}px ${pos.y}px, rgba(139,92,246,0.13), transparent 65%)`,
        }}
      />
      {children}
    </div>
  )
}

// Floating sparkles around a child element
function Sparkles({ children }: { children: React.ReactNode }) {
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; size: number }[]>([])
  const add = () => {
    const id = Date.now() + Math.random()
    setSparks(s => [...s, { id, x: 40 + Math.random() * 60, y: Math.random() * 80, size: 6 + Math.random() * 7 }])
    setTimeout(() => setSparks(s => s.filter(p => p.id !== id)), 700)
  }
  return (
    <span className="relative inline-block" onMouseEnter={add}>
      {sparks.map(s => (
        <span
          key={s.id}
          className="sparkle pointer-events-none absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, zIndex: 10 }}
        >
          <svg viewBox="0 0 24 24" fill="none" width={s.size} height={s.size}>
            <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill="#c4b5fd" />
          </svg>
        </span>
      ))}
      {children}
    </span>
  )
}

const agents = [
  'Claude Code',
  'Cursor',
  'Gemini CLI',
  'Windsurf',
  'GitHub Copilot',
  'Goose',
  'OpenAI Codex',
  'OpenCode',
  'Kilo Code',
  'Trae',
  'Antigravity',
]

const agentDetails = [
  { name: 'Claude Code', path: '~/.claude/commands/', status: 'supported' as const },
  { name: 'Cursor', path: '~/.cursor/rules/', status: 'supported' as const },
  { name: 'Gemini CLI', path: '~/.gemini/skills/', status: 'supported' as const },
  { name: 'Windsurf', path: '~/.codeium/windsurf/', status: 'supported' as const },
  { name: 'GitHub Copilot', path: '.github/copilot/', status: 'supported' as const },
  { name: 'Goose', path: '~/.config/goose/', status: 'supported' as const },
  { name: 'OpenAI Codex', path: '~/.codex/', status: 'supported' as const },
  { name: 'OpenCode', path: '~/.opencode/', status: 'supported' as const },
  { name: 'Kilo Code', path: '.kilocode/', status: 'supported' as const },
  { name: 'Trae', path: '~/.trae/', status: 'beta' as const },
  { name: 'Antigravity', path: '~/.antigravity/', status: 'beta' as const },
]


const testimonials = [
  {
    quote: "This solves a real annoyance. Having one place to manage and push skills across agents is a workflow I didn't know I needed.",
    source: 'Product Hunt',
    sourceUrl: 'https://www.producthunt.com/products/ai-skills-manager',
    name: 'Alex Rivers',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    gradientFrom: '#7c3aed',
    gradientTo: '#6366f1',
  },
  {
    quote: "The fragmentation problem across agents is real. The unified view approach makes sense — this is exactly what we needed.",
    source: 'Hacker News',
    sourceUrl: 'https://news.ycombinator.com',
    name: 'Sarah Chen',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    gradientFrom: '#0ea5e9',
    gradientTo: '#6366f1',
  },
  {
    quote: "The skills discoverability problem is real — I end up rediscovering the same prompt patterns across projects.",
    source: 'Hacker News',
    sourceUrl: 'https://news.ycombinator.com',
    name: 'Marcus Thorne',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    gradientFrom: '#059669',
    gradientTo: '#0ea5e9',
  },
  {
    quote: "As someone using agents but not at home with NPM, I like this. Simple, direct, does what it says.",
    source: 'Hacker News',
    sourceUrl: 'https://news.ycombinator.com',
    name: 'Elena Garcia',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    gradientFrom: '#d97706',
    gradientTo: '#dc2626',
  },
  {
    quote: "Every time I want to test the same skill in Cursor or another agent, it's manual file copying and adjusting paths.",
    source: 'Product Hunt',
    sourceUrl: 'https://www.producthunt.com/products/ai-skills-manager',
    name: 'James Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    gradientFrom: '#7c3aed',
    gradientTo: '#ec4899',
  },
  {
    quote: "We need a unified skill marketplace for different agents — good work, this is a step in the right direction.",
    source: 'Hacker News',
    sourceUrl: 'https://news.ycombinator.com',
    name: 'Lila Okafor',
    avatar: 'https://randomuser.me/api/portraits/women/89.jpg',
    gradientFrom: '#0891b2',
    gradientTo: '#059669',
  },
]

const WindowsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 88 88" fill="currentColor" aria-hidden>
    <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.066 41.344-47.318-6.63-.066-34.893z" />
  </svg>
)

const MacIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.65 13.2c-.02-2 1.65-2.96 1.73-3.01-0.94-1.37-2.4-1.56-2.91-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.41 2.43-.36 6.03 1 8 .66.97 1.45 2.06 2.48 2.02 1-.04 1.37-.64 2.58-.64 1.21 0 1.55.64 2.6.62 1.08-.02 1.76-0.98 2.41-1.95.76-1.1 1.07-2.17 1.08-2.23-.02-.01-2.07-.79-2.1-3.27Z" />
    <path d="M14.92 6.82c.54-.65.9-1.56.8-2.46-.77.03-1.7.51-2.25 1.16-.5.58-.94 1.52-.82 2.41.86.07 1.72-.44 2.27-1.11Z" />
  </svg>
)

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
    <path d="M7.5 0C3.36 0 0 3.36 0 7.5c0 3.31 2.15 6.12 5.13 7.11.38.07.52-.16.52-.36v-1.27c-2.1.46-2.54-.99-2.54-.99-.34-.87-.84-1.1-.84-1.1-.69-.47.05-.46.05-.46.76.05 1.16.78 1.16.78.67 1.15 1.77.82 2.2.63.07-.49.26-.82.48-1.01-1.68-.19-3.44-.84-3.44-3.73 0-.82.29-1.5.78-2.02-.08-.19-.34-.96.07-2 0 0 .64-.2 2.08.77a7.26 7.26 0 0 1 1.9-.26c.64 0 1.29.09 1.9.26 1.44-.97 2.08-.77 2.08-.77.41 1.04.15 1.81.07 2 .49.53.78 1.2.78 2.02 0 2.9-1.77 3.54-3.45 3.73.27.23.51.69.51 1.39v2.06c0 .2.13.44.52.36A7.51 7.51 0 0 0 15 7.5C15 3.36 11.64 0 7.5 0Z" />
  </svg>
)

const PHIcon = () => (
  <svg width="14" height="14" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
    <circle cx="29" cy="29" r="29" fill="#DA552F" />
    <path d="M33.138 29.24h-8.284v-8.772h8.284a4.386 4.386 0 1 1 0 8.772m0-14.62H19.006v29.24h5.848v-8.772h8.284c5.652 0 10.234-4.582 10.234-10.234S38.79 14.62 33.138 14.62" fill="#fff" />
  </svg>
)

const HNIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="4 4 188 188" width="14">
    <path d="m4 4h188v188h-188z" fill="#f60" />
    <path d="m73.2521756 45.01 22.7478244 47.39130083 22.7478244-47.39130083h19.56569631l-34.32352071 64.48661468v41.49338532h-15.98v-41.49338532l-34.32352071-64.48661468z" fill="#fff" />
  </svg>
)

// ── Helper: Robust Smooth Scroll ──────────────────────────────────────────
const scrollToSection = (e: React.MouseEvent, id: string, callback?: () => void) => {
  const targetId = id.replace('#', '')
  if (targetId === '/') return

  e.preventDefault()
  if (callback) callback()

  // Small delay to let the menu closing transition begin
  // and ensure any "scroll-lock" is being released.
  setTimeout(() => {
    const element = document.getElementById(targetId)
    if (element) {
      const offset = 80 // header height
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }, 100)
}

// ── Mobile-responsive Nav ─────────────────────────────────────────────────
function MobileNav({ activeSection, stars }: { activeSection: string; stars: number | null }) {
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  const links = [
    { label: 'What is it?', href: '#what-is-it' },
    { label: 'Features', href: '#features' },
    { label: 'Demo', href: '#demo' },
    { label: 'Planner', href: '#daily-planner' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Download', href: '#cta' },
    {
      label: 'GitHub',
      href: 'https://github.com/zunalabs/productivity-boost',
      external: true,
    },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] backdrop-blur-2xl"
      style={{ background: 'rgba(2,2,9,0.88)' }}
    >
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX, transformOrigin: '0%' }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-400 z-10"
      />

      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <Image
            src="/productivity-boost-1.0.jpg"
            alt="Productivity Boost"
            width={28}
            height={28}
            className="rounded-lg object-cover flex-shrink-0"
          />
          <span className="font-heading text-base tracking-tight text-white">
            Productivity Boost
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.slice(0, 6).map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => scrollToSection(e, l.href)}
              className={`text-sm transition-colors duration-200 ${activeSection && l.href === `#${activeSection}` ? 'text-violet-400' : 'text-slate-500 hover:text-slate-200'}`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com/zunalabs/productivity-boost"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-500 hover:text-violet-400 transition-colors duration-200"
            aria-label="GitHub"
          >
            <GitHubIcon />
            {stars != null && (
              <span className="text-[10px] text-slate-600">
                {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}★
              </span>
            )}
          </a>
          <a
            href="#cta"
            onClick={(e) => scrollToSection(e, '#cta')}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white transition-all duration-200 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
          >
            Download
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
            transition={{ duration: 0.22 }}
            className="block w-5 h-[1.5px] bg-slate-300 origin-center"
          />
          <motion.span
            animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
            transition={{ duration: 0.18 }}
            className="block w-5 h-[1.5px] bg-slate-300 origin-center"
          />
          <motion.span
            animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
            transition={{ duration: 0.22 }}
            className="block w-5 h-[1.5px] bg-slate-300 origin-center"
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden overflow-hidden border-t border-white/[0.04]"
        style={{ background: 'rgba(2,2,9,0.96)' }}
      >
        <nav className="flex flex-col px-6 py-4 gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener noreferrer' : undefined}
              onClick={(e) => {
                if (!l.external) {
                  scrollToSection(e, l.href, () => setOpen(false))
                } else {
                  setOpen(false)
                }
              }}
              className="flex items-center gap-3 py-3 text-sm text-slate-400 hover:text-white transition-colors border-b border-white/[0.04] last:border-0"
            >
              {l.label === 'Download' && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                  style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
                >
                  Free
                </span>
              )}
              {l.label}
            </a>
          ))}
        </nav>
      </motion.div>
    </header>
  )
}

// ── What is it? ───────────────────────────────────────────────────────────
function WhatIsIt() {
  const [tab, setTab] = useState<'skills' | 'prompts'>('skills')

  return (
    <section id="what-is-it" className="border-t border-white/[0.04] py-28 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-14">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-6"
              style={{ background: 'rgba(88,28,135,0.2)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }} />
              The Essentials
            </span>
            <h2
              className="font-extrabold tracking-tight mb-4 text-white"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', lineHeight: 1.1 }}
            >
              Two things that will change<br />
              <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                how you work with AI
              </span>
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Skills teach your agents new tricks. Prompts store your best thinking.
              Together, they make you dramatically faster — every single day.
            </p>
          </div>
        </ScrollReveal>

        {/* Tab switcher */}
        <ScrollReveal delay={80}>
          <div className="flex items-center justify-center mb-14">
            <div
              className="flex p-1 rounded-2xl gap-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {(['skills', 'prompts'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="relative px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5"
                  style={{
                    background: tab === t
                      ? t === 'skills'
                        ? 'linear-gradient(135deg, rgba(109,40,217,0.7), rgba(124,58,237,0.7))'
                        : 'linear-gradient(135deg, rgba(37,99,235,0.6), rgba(96,165,250,0.6))'
                      : 'transparent',
                    color: tab === t ? '#ffffff' : '#475569',
                    boxShadow: tab === t ? '0 0 24px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                  }}
                >
                  {t === 'skills' ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                      <path d="M7 0L3.5 7h3.5L5.5 14 13 7H9L7 0z" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <rect x="1" y="3" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M3 6.5h4M3 9h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      <path d="M5 3V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  )}
                  {t === 'skills' ? 'Skills' : 'Prompts'}
                  {tab === t && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
                    >
                      {t === 'skills' ? '11 agents' : 'new'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Content panels */}
        <AnimatePresence mode="wait">
          {tab === 'skills' ? (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
            >
              {/* Left — skill file mockup */}
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0a12', border: '1px solid rgba(139,92,246,0.15)', boxShadow: '0 0 40px rgba(139,92,246,0.08)' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]" style={{ background: 'rgba(139,92,246,0.06)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
                  </div>
                  <span className="text-[11px] text-violet-400/60 font-mono ml-1">~/.claude/commands/</span>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { cmd: '/commit', desc: 'Write conventional commit messages automatically', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
                    { cmd: '/review', desc: 'Deep code review: security, perf & readability', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
                    { cmd: '/docs', desc: 'Generate inline documentation from any function', color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
                    { cmd: '/refactor', desc: 'Suggest clean-code improvements', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
                    { cmd: '/test', desc: 'Write unit tests for selected code', color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
                  ].map((skill, i) => (
                    <motion.div
                      key={skill.cmd}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-default"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold font-mono text-sm"
                        style={{ background: skill.bg, color: skill.color }}
                      >
                        /
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white font-mono">{skill.cmd}</div>
                        <div className="text-[11px] text-slate-600 truncate">{skill.desc}</div>
                      </div>
                      <div
                        className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: skill.bg, color: skill.color }}
                      >
                        skill
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right — explanation */}
              <div className="space-y-7">
                <div>
                  <h3 className="text-2xl font-extrabold text-white mb-3 leading-tight">
                    Slash commands that give<br />your AI agent superpowers
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    Skills are markdown instruction files in your agent's config folder. Type{' '}
                    <code className="text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded text-xs font-mono">/commit</code>{' '}
                    in Claude Code or Cursor and the agent follows your exact rules — every time, consistently.
                  </p>
                </div>
                <div className="space-y-5">
                  {[
                    { color: 'rgba(167,139,250,0.15)', textColor: '#a78bfa', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, title: 'Just markdown files', desc: 'No plugins. Skills are plain .md files in a folder your agent already watches.' },
                    { color: 'rgba(96,165,250,0.15)', textColor: '#60a5fa', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, title: 'Reused across every session', desc: 'Write once and it\'s available in every project, every conversation, forever.' },
                    { color: 'rgba(52,211,153,0.15)', textColor: '#34d399', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" /><circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M7.5 5h1.5M7.5 11h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, title: 'Copy across all 11 agents', desc: 'Got a great Claude Code skill? One click copies it to Cursor, Windsurf, Copilot — done.' },
                    { color: 'rgba(251,191,36,0.12)', textColor: '#fbbf24', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 3M10 3h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>, title: 'Share with your team', desc: 'Commit them to your repo. Every developer gets the same AI behaviour automatically.' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.09, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-start gap-4"
                    >
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                        style={{ background: item.color, color: item.textColor }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">{item.title}</p>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
            >
              {/* Left — prompt library mockup */}
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0a12', border: '1px solid rgba(96,165,250,0.15)', boxShadow: '0 0 40px rgba(96,165,250,0.06)' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]" style={{ background: 'rgba(59,130,246,0.05)' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
                    </div>
                    <span className="text-[11px] text-blue-400/60 ml-1">Prompt Library</span>
                  </div>
                  <div className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                    + New
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { title: 'Code Review Checklist', preview: 'Review for readability, edge cases, security issues, and performance bottlenecks...', tags: ['code', 'review'], color: 'rgba(139,92,246,0.07)' },
                    { title: 'Git Commit Message', preview: 'Write a conventional commit. Format: type(scope): description. Types: feat, fix, docs...', tags: ['git'], color: 'rgba(96,165,250,0.07)' },
                    { title: 'Debug Helper', preview: 'Analyze this error: explain what caused it, how to fix it, and how to prevent it next time...', tags: ['debug', 'fix'], color: 'rgba(248,113,113,0.07)' },
                    { title: 'System Prompt', preview: 'You are an expert software engineer. Be concise, direct, and write clean, readable code...', tags: ['system'], color: 'rgba(52,211,153,0.07)' },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="group rounded-xl p-3 cursor-default"
                      style={{ background: card.color, border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-zinc-200">{card.title}</span>
                        <div
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}
                        >
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M3 3V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeWidth="1.4" /></svg>
                          Copy
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-1 leading-relaxed">{card.preview}</p>
                      <div className="flex gap-1 mt-2">
                        {card.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>{tag}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right — explanation */}
              <div className="space-y-7">
                <div>
                  <h3 className="text-2xl font-extrabold text-white mb-3 leading-tight">
                    Your best thinking,<br />always one click away
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    Prompts are the clever instructions you keep retyping into AI chats — the ones that actually work.
                    Stop rewriting them from memory. Store once, find instantly, paste anywhere.
                  </p>
                </div>
                <div className="space-y-5">
                  {[
                    { color: 'rgba(167,139,250,0.15)', textColor: '#a78bfa', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, title: 'Write once, reuse forever', desc: 'Never write "You are an expert..." from scratch again. Save what works.' },
                    { color: 'rgba(96,165,250,0.15)', textColor: '#60a5fa', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, title: 'Search by title, tag or content', desc: 'Tag prompts like "git", "review", "debug" and find any prompt in under a second.' },
                    { color: 'rgba(52,211,153,0.15)', textColor: '#34d399', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 4V3a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeWidth="1.5" /></svg>, title: 'One-click copy to clipboard', desc: 'Hit copy, switch to your AI tool, paste. No hunting through Notion or sticky notes.' },
                    { color: 'rgba(251,191,36,0.12)', textColor: '#fbbf24', icon: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, title: 'Works with any AI — not just agents', desc: 'ChatGPT, Claude, Gemini, Perplexity — prompts work everywhere you chat with AI.' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.09, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-start gap-4"
                    >
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                        style={{ background: item.color, color: item.textColor }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">{item.title}</p>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// ── Mac Waitlist ────────────────────────────────────────────────────────
function MacWaitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <span className="inline-flex items-center gap-2 text-emerald-400 text-sm px-7 py-4">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        You&apos;re on the Mac list!
      </span>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!email) return
        try { localStorage.setItem('mac-waitlist', email) } catch { }
        setSubmitted(true)
      }}
      className="flex items-center gap-2"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email for Mac launch"
        required
        className="text-sm text-slate-300 placeholder-slate-600 bg-transparent border border-white/[0.08] rounded-2xl px-4 py-4 w-44 focus:outline-none focus:border-violet-500/40 transition-colors"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white border border-white/[0.08] hover:border-violet-400/40 px-5 py-4 rounded-2xl transition-all duration-200 hover:bg-violet-500/[0.06] whitespace-nowrap"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <MacIcon />
        Notify me
      </button>
    </form>
  )
}

// ── How It Works ─────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 3v10M11 13l-3.5-3.5M11 13l3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      title: 'Download',
      desc: 'Get the app for Windows or Linux. 60-second install, no account needed.',
      color: 'from-violet-600/20 to-purple-700/10',
      iconColor: '#a78bfa',
    },
    {
      number: '02',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M7 19h8M11 16v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="11" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
      title: 'Open',
      desc: 'Launch the app. It instantly scans your machine and finds all installed agent skills.',
      color: 'from-blue-600/20 to-cyan-600/10',
      iconColor: '#60a5fa',
    },
    {
      number: '03',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="2" y="2" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="12" y="2" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="2" y="12" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="12" y="12" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
      title: 'Manage',
      desc: 'Enable, disable, copy across agents, install from GitHub, and browse the marketplace.',
      color: 'from-cyan-600/20 to-teal-600/10',
      iconColor: '#67e8f9',
    },
  ]

  return (
    <section id="how-it-works" className="border-t border-white/[0.04] py-24 relative overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)' }}
      />
      <div className="max-w-5xl mx-auto px-6 relative">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.25em] text-violet-400/50 font-semibold mb-4 text-center">
            Getting started
          </p>
          <h2 className="font-heading text-[1.75rem] sm:text-[2.25rem] text-center mb-16 tracking-tight">
            Up and running in 3 steps
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div
            className="hidden md:block absolute top-14 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px"
            style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(96,165,250,0.3), rgba(103,232,249,0.3))' }}
          />

          {steps.map((step, i) => (
            <ScrollReveal key={step.title} delay={i * 100}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-2xl p-6 bg-gradient-to-br ${step.color}`}
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Step number */}
                <div
                  className="absolute -top-3 -right-1 text-[10px] font-black tabular-nums"
                  style={{ color: 'rgba(255,255,255,0.12)', fontSize: 52, lineHeight: 1 }}
                >
                  {step.number}
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 relative z-10"
                  style={{ background: 'rgba(255,255,255,0.05)', color: step.iconColor, border: `1px solid ${step.iconColor}22` }}
                >
                  {step.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2 relative z-10">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Supported Agents Grid ─────────────────────────────────────────────────
function AgentsGrid() {
  return (
    <section className="border-t border-white/[0.04] py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.25em] text-violet-400/50 font-semibold mb-4 text-center flex items-center justify-center gap-2">
            <span>⬡</span> Full compatibility
          </p>
          <h2 className="font-heading text-[1.75rem] sm:text-[2.25rem] text-center mb-4 tracking-tight">
            Every major AI coding assistant
          </h2>
          <p className="text-center text-sm text-slate-500 mb-12 max-w-md mx-auto leading-relaxed">
            We track each agent&apos;s skill directory and file format so you don&apos;t have to.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agentDetails.map((agent, i) => (
            <ScrollReveal key={agent.name} delay={i * 50}>
              <motion.div
                whileHover={{ y: -3, borderColor: 'rgba(139,92,246,0.3)' }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.08)' }}
                >
                  <AgentIcon agent={agent.name} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{agent.name}</p>
                  <p className="text-[11px] text-slate-600 font-mono truncate">{agent.path}</p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={
                    agent.status === 'supported'
                      ? { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }
                      : { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }
                  }
                >
                  {agent.status === 'supported' ? 'Supported' : 'Beta'}
                </span>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Comparison Table ──────────────────────────────────────────────────────
function ComparisonTable() {
  const rows = [
    { without: 'Hunt through hidden config folders', with: 'One unified view of all skills' },
    { without: 'Manually copy files between agents', with: 'One-click copy between any agents' },
    { without: 'Re-type skills for each agent', with: 'Install from GitHub to all at once' },
    { without: 'No discovery — use what you know', with: 'Browse marketplace, find community skills' },
    { without: 'Delete to "disable" a skill', with: 'Toggle on/off, re-enable anytime' },
  ]

  return (
    <section className="border-t border-white/[0.04] py-24 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(124,58,237,0.04) 0%, transparent 70%)' }}
      />
      <div className="max-w-3xl mx-auto px-6 relative">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.25em] text-violet-400/50 font-semibold mb-4 text-center flex items-center justify-center gap-2">
            <span>⬡</span> The difference
          </p>
          <h2 className="font-heading text-[1.75rem] sm:text-[2.25rem] text-center mb-14 tracking-tight">
            Managing skills <span className="line-through text-slate-600">without</span> Productivity Boost
          </h2>
        </ScrollReveal>

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Header */}
          <div className="grid grid-cols-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="px-5 py-3 flex items-center gap-2 border-r border-white/[0.04]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 7l6 6M1 7h12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-xs font-bold text-red-400/70 uppercase tracking-wider">Without</span>
            </div>
            <div className="px-5 py-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">With PSM</span>
            </div>
          </div>

          {rows.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 border-t border-white/[0.04]"
              style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
            >
              <div className="px-5 py-4 flex items-center gap-2.5 border-r border-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/40 flex-shrink-0" />
                <span className="text-sm text-slate-500 leading-relaxed">{row.without}</span>
              </div>
              <div className="px-5 py-4 flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 flex-shrink-0" />
                <span className="text-sm text-slate-300 leading-relaxed">{row.with}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Tech Stack Pills ──────────────────────────────────────────────────────
function TechStack() {
  const pills = [
    { label: 'React 18', color: '#67e8f9', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' },
    { label: 'TypeScript 5', color: '#93c5fd', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    { label: 'Electron', color: '#c4b5fd', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
    { label: 'Next.js 16', color: '#f4f4f5', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)' },
    { label: 'Tailwind CSS', color: '#67e8f9', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' },
    { label: 'Turborepo', color: '#f9a8d4', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.3)' },
    { label: 'Vite', color: '#c4b5fd', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
    { label: 'Framer Motion', color: '#f9a8d4', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.3)' },
    { label: 'MIT License', color: '#86efac', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
    { label: 'Open Source', color: '#86efac', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
    { label: 'Monorepo', color: '#fdba74', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
    { label: 'npm workspaces', color: '#fdba74', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
  ]

  return (
    <section className="border-t border-white/[0.04] py-20 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)' }}
      />
      <div className="max-w-4xl mx-auto px-6 relative">
        <ScrollReveal>
          <p
            className="text-[11px] uppercase tracking-[0.25em] font-semibold mb-4 text-center flex items-center justify-center gap-2"
            style={{ color: 'rgba(167,139,250,0.6)' }}
          >
            <span>⬡</span> Technology
          </p>
          <h2 className="font-heading text-[1.6rem] sm:text-[2.1rem] text-center mb-3 tracking-tight">
            Built with best-in-class tools
          </h2>
          <p className="text-center text-sm text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">
            Full TypeScript across the monorepo — fast builds, strict types, zero compromise.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="flex flex-wrap justify-center gap-3">
            {pills.map((p, i) => (
              <motion.span
                key={p.label}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="tech-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.8rem] font-semibold"
                style={{ color: p.color, background: p.bg, border: `1px solid ${p.border}` }}
              >
                {p.label}
              </motion.span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// ── Platform Download Cards ────────────────────────────────────────────────
function PlatformCards() {
  const platforms = [
    {
      emoji: '🪟',
      name: 'Windows',
      formats: ['.exe', 'NSIS installer', 'x64'],
      href: 'https://github.com/zunalabs/productivity-boost/releases/latest/download/Prompt-Skill-Manager-Setup.exe',
      available: true,
      accentColor: 'rgba(59,130,246,0.15)',
      borderColor: 'rgba(59,130,246,0.25)',
      formatColor: '#67e8f9',
      formatBg: 'rgba(6,182,212,0.1)',
      formatBorder: 'rgba(6,182,212,0.25)',
    },
  ]

  return (
    <section className="border-t border-white/[0.04] py-20 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.04) 0%, transparent 70%)' }}
      />
      <div className="max-w-4xl mx-auto px-6 relative">
        <ScrollReveal>
          <p
            className="text-[11px] uppercase tracking-[0.25em] font-semibold mb-4 text-center flex items-center justify-center gap-2"
            style={{ color: 'rgba(167,139,250,0.6)' }}
          >
            <span>⬡</span> Available on
          </p>
          <h2 className="font-heading text-[1.6rem] sm:text-[2.1rem] text-center mb-3 tracking-tight">
            Built for Windows
          </h2>
          <p className="text-center text-sm text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">
            Native desktop installer. Download and run in 60 seconds.
          </p>
        </ScrollReveal>

        <div className="flex justify-center">
          {platforms.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 80}>
              <motion.div
                whileHover={p.available ? { y: -5 } : {}}
                transition={{ duration: 0.2 }}
                className="group rounded-2xl p-8 relative overflow-hidden cursor-default w-72"
                style={{
                  background: p.accentColor,
                  border: `1px solid ${p.borderColor}`,
                  opacity: p.available ? 1 : 0.6,
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
              >
                {/* Spotlight */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at top left, ${p.accentColor.replace('0.1', '0.35').replace('0.12', '0.4')}, transparent 70%)` }}
                />
                <span className="emoji-pop text-4xl mb-3 block relative z-10">{p.emoji}</span>
                <p className="font-bold text-white text-base mb-4 relative z-10">{p.name}</p>
                <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
                  {p.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="font-mono text-[0.72rem] px-2 py-0.5 rounded-md"
                      style={{ color: p.formatColor, background: p.formatBg, border: `1px solid ${p.formatBorder}` }}
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
                {p.available ? (
                  <a
                    href={p.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold transition-all hover:text-white hover:gap-2.5"
                    style={{ color: p.formatColor }}
                  >
                    Download
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 8L8 2M8 2H3M8 2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ) : (
                  <span className="relative z-10 text-xs text-slate-600 font-medium">Waitlist open</span>
                )}
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [downloads, setDownloads] = useState<number | null>(null)
  const [stars, setStars] = useState<number | null>(null)
  const [detectedOS, setDetectedOS] = useState<'windows' | 'linux' | 'mac' | null>(null)
  const [activeSection, setActiveSection] = useState('')
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLElement>(null)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
    return () => el.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  useEffect(() => {
    fetch('/api/downloads')
      .then((r) => r.json())
      .then((d) => setDownloads(d.total))
      .catch(() => { })
  }, [])

  useEffect(() => {
    fetch('/api/stars')
      .then((r) => r.json())
      .then((d) => setStars(d.stars))
      .catch(() => { })
  }, [])

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('win')) setDetectedOS('windows')
    else if (ua.includes('mac')) setDetectedOS('mac')
    else if (ua.includes('linux')) setDetectedOS('linux')
  }, [])

  useEffect(() => {
    const sectionIds = ['what-is-it', 'features', 'daily-planner', 'demo', 'faq', 'cta']
    const observers: IntersectionObserver[] = []
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((obs) => obs.disconnect())
  }, [])

  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      setActiveTestimonial((i) => (i + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(id)
  }, [isPaused])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Productivity Boost',
    'operatingSystem': 'macOS, Windows, Linux',
    'applicationCategory': 'DeveloperApplication',
    'description': 'Universal AI agent skills manager for Claude Code, Cursor, Copilot, and more.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'author': {
      '@type': 'Organization',
      'name': 'Zunalabs',
      'url': 'https://github.com/zunalabs'
    }
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What are skills?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Skills are reusable instruction sets that extend what an AI coding agent can do. They're typically markdown or text files that tell the agent how to handle specific tasks like enforcing commit message formats or following code styles."
        }
      },
      {
        '@type': 'Question',
        'name': 'Which agents are supported?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Currently supported agents include Claude Code, Cursor, Gemini CLI, Windsurf, GitHub Copilot, Goose, OpenAI Codex, OpenCode, Kilo Code, Trae, and Antigravity.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Is it free?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. Productivity Boost is fully open source under the MIT license with no accounts or telemetry.'
        }
      }
    ]
  }

  const YOUTUBE_VIDEO_ID = 'touNnaNVqo8'

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden" style={{ background: '#020209' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── Nav ── */}
      <MobileNav activeSection={activeSection} stars={stars} />

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[100svh] flex items-center grain-overlay">
        {/* Orb 1 — purple, top-right */}
        <div
          className="pointer-events-none absolute -top-20 -right-40 w-[800px] h-[800px] rounded-full blur-[160px] animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }}
        />
        {/* Orb 2 — cyan, bottom-left */}
        <div
          className="pointer-events-none absolute bottom-0 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] animate-orb-slow"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)' }}
        />
        {/* Center glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)' }}
        />
        {/* Grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-100" />
        {/* Cursor spotlight — follows mouse */}
        <div
          className="pointer-events-none absolute inset-0 z-[2] transition-[background] duration-75"
          style={{
            background: `radial-gradient(700px circle at ${cursor.x}px ${cursor.y}px, rgba(139,92,246,0.07), transparent 40%)`,
          }}
        />
        {/* Three.js 3D galaxy */}
        <ThreeScene />

        <ShootingStars minDelay={800} maxDelay={3000} starWidth={14} />

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 text-center relative z-[10] pt-32 pb-24 w-full">

          {/* Badge */}
          <motion.div {...fadeUp(0)} className="flex flex-col items-center gap-3 mb-10">
            {/* Changelog pill */}
            <a
              href="https://github.com/zunalabs/productivity-boost/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold transition-all hover:scale-105 hover:border-emerald-500/30"
              style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
            >
              {/* Pulsing live dot */}
              <span className="relative flex-shrink-0 w-1.5 h-1.5">
                <span className="pulse-ring" style={{ background: 'rgba(52,211,153,0.5)' }} />
                <span className="pulse-ring pulse-ring-2" style={{ background: 'rgba(52,211,153,0.3)' }} />
                <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
              </span>
              v1.0 released — What&apos;s new →
            </a>
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300"
              style={{ background: 'rgba(88,28,135,0.25)', border: '1px solid rgba(139,92,246,0.35)' }}
            >
              <span className="relative flex-shrink-0 w-1.5 h-1.5">
                <span className="pulse-ring" style={{ background: 'rgba(167,139,250,0.5)' }} />
                <span className="pulse-ring pulse-ring-3" style={{ background: 'rgba(167,139,250,0.3)' }} />
                <span className="relative w-1.5 h-1.5 rounded-full block" style={{ background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }} />
              </span>
              Project Deep Dive · 2026{downloads != null && ` · ${downloads.toLocaleString()} downloads`}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-extrabold leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)' }}
            {...fadeUp(0.06)}
          >
            <Sparkles>
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
            </Sparkles>
            <br />
            <Sparkles><span className="text-shimmer-flow">Universal AI Agent Hub</span></Sparkles>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto mb-10 leading-relaxed"
            {...fadeUp(0.14)}
          >
            A cross-platform Electron desktop app providing a single unified interface to manage,
            discover, and install skills across 11+ AI coding assistants.
          </motion.p>

          {/* Divider */}
          <motion.div
            className="w-full max-w-sm h-px mx-auto mb-10"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.22 }}
          />

          {/* Stats row */}
          <motion.div
            className="flex flex-wrap items-end justify-center gap-x-10 gap-y-5 mb-14"
            {...fadeUp(0.28)}
          >
            {[
              { value: 11, suffix: '+', label: 'Supported Agents' },
              { value: 2, suffix: '', label: 'Apps in Monorepo' },
              { value: 3, suffix: '', label: 'Platforms' },
              { value: -1, suffix: 'TS', label: 'Full TypeScript', isText: true },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className="stat-glow-drop font-extrabold leading-none tabular-nums"
                  style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
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

          {/* CTA Buttons */}
          <motion.div
            id="download"
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
            {...fadeUp(0.36)}
          >
            {/* Windows */}
            <div className="relative">
              {detectedOS === 'windows' && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-emerald-400">
                  ★ Recommended for you
                </div>
              )}
              <Magnetic>
                <div className={detectedOS === 'windows' ? 'btn-gradient-border-green' : 'btn-gradient-border'}>
                  <a
                    href="https://github.com/zunalabs/productivity-boost/releases/latest/download/Prompt-Skill-Manager-Setup.exe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-[14px] text-sm font-bold text-white overflow-hidden btn-shimmer transition-all duration-300 hover:scale-105 hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #6366f1 100%)' }}
                  >
                    <WindowsIcon />
                    Download for Windows
                  </a>
                </div>
              </Magnetic>
            </div>

          </motion.div>


          {/* SmartScreen note */}
          <motion.p className="text-[11px] text-slate-600 mb-16" {...fadeUp(0.46)}>
            Windows may show a SmartScreen warning — click &ldquo;More info&rdquo; → &ldquo;Run anyway&rdquo;.{' '}
            <a
              href="https://github.com/zunalabs/productivity-boost"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-400 transition-colors"
            >
              Source code is public.
            </a>
          </motion.p>

          {/* App screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.52 }}
            className="relative hidden sm:block"
          >
            {/* Glow behind screenshot */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-3xl"
              style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(139,92,246,0.3), transparent 65%)' }}
            />
            <div className="animate-float-tilt relative">
              <div className="screenshot-gradient-border">
                <div
                  className="relative rounded-[18px] overflow-hidden"
                  style={{ background: '#0d0d18', boxShadow: '0 40px 100px rgba(0,0,0,0.9)' }}
                >
                  {/* Window chrome */}
                  <div
                    className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.04]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
                    <div className="flex-1 mx-4">
                      <div
                        className="w-44 h-5 mx-auto rounded-md text-[10px] flex items-center justify-center text-slate-600 border border-white/[0.04]"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                      >
                        Productivity Boost
                      </div>
                    </div>
                  </div>
                  <Image
                    src="/productivity-boost-1.0.jpg"
                    alt="Productivity Boost app screenshot"
                    width={1200}
                    height={780}
                    className="w-full block"
                    priority
                  />
                  <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── How It Works ── */}
      <HowItWorks />

      {/* ── What is it? ── */}
      <WhatIsIt />

      {/* ── Agent Grid ── */}
      <section className="border-t border-white/[0.04] py-20">
        <div className="container px-6 max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-violet-400/60 font-semibold mb-3">
                Compatibility
              </span>
              <h2 className="text-2xl font-bold text-white">
                Works with {agents.length} coding agents
              </h2>
              <p className="text-sm text-slate-500 mt-2">One app. Every agent. Zero friction.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {agents.map((agent, i) => (
              <ScrollReveal key={agent} delay={i * 40}>
                <div
                  className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl border border-white/[0.05] hover:border-violet-500/30 transition-all duration-300 cursor-default"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  {/* glow on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12), transparent 70%)' }}
                  />
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                    style={{ background: 'rgba(139,92,246,0.08)', boxShadow: '0 0 0 1px rgba(139,92,246,0.12)' }}
                  >
                    <AgentIcon agent={agent} size={24} />
                  </div>
                  <span className="text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors duration-200 text-center leading-tight font-medium">
                    {agent}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agents Grid ── */}
      <AgentsGrid />

      <div className="container px-6">
        <div className="glow-divider" />
      </div>

      {/* ── Demo Video ── */}
      {YOUTUBE_VIDEO_ID && (
        <section id="demo" className="border-t border-white/[0.04] py-24 relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)' }}
          />
          <div className="max-w-4xl mx-auto px-6 relative">
            <ScrollReveal>
              <p className="text-center text-[11px] uppercase tracking-[0.25em] text-violet-400/50 font-semibold mb-4">
                See it in action
              </p>
              <h2 className="font-heading text-[1.75rem] sm:text-[2.25rem] text-center mb-10 tracking-tight">
                Watch the demo
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div
                className="relative rounded-2xl overflow-hidden card-neon"
                style={{
                  aspectRatio: '16/9',
                  background: '#0a0a14',
                  boxShadow: '0 0 0 1px rgba(139,92,246,0.15), 0 24px 64px rgba(0,0,0,0.7), 0 0 60px rgba(139,92,246,0.08)',
                }}
              >
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                  title="Productivity Boost demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                />
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <div className="container px-6">
        <div className="glow-divider" />
      </div>

      {/* ── What It Does — 6-card grid ── */}
      <section id="features" className="border-t border-white/[0.04] py-28 relative overflow-hidden">
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)' }}
        />
        <div className="max-w-5xl mx-auto px-6 relative">
          <ScrollReveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] mb-4 flex items-center gap-2" style={{ color: '#7c3aed' }}>
              <span>⬡</span> What it does
            </p>
            <h2 className="font-heading text-[1.75rem] sm:text-[2.5rem] mb-4 tracking-tight">
              One App to Rule All Skills
            </h2>
            <p className="text-sm text-slate-400 mb-14 max-w-md leading-relaxed">
              Every AI coding assistant stores skills in its own hidden folder with its own format. Productivity Boost unifies them all into a single, beautiful interface.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                iconBg: 'linear-gradient(135deg, #1e3a5f 0%, #1a2d4a 100%)',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                    <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="2.2" />
                    <path d="M17.5 17.5L23 23" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.2)" />
                  </svg>
                ),
                title: 'Unified Discovery',
                desc: 'Scans all agent skill directories on startup — Claude Code, Cursor, Copilot, Windsurf, Gemini CLI, and more — and displays them in one place.',
              },
              {
                iconBg: 'linear-gradient(135deg, #1a3d2e 0%, #14532d 100%)',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                    <path d="M16 4L8 16h8l-4 8 12-14h-8L16 4z" fill="white" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Enable / Disable',
                desc: 'Toggle skills on and off without deleting them. Disabled skills are safely moved to a .disabled/ subfolder and can be re-enabled anytime.',
              },
              {
                iconBg: 'linear-gradient(135deg, #1e2d4a 0%, #162040 100%)',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                    <path d="M14 4L24 9v10L14 24 4 19V9L14 4z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M14 4v20M4 9l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'GitHub Install',
                desc: "Paste any GitHub repository URL. The app discovers available skills via GitHub's recursive tree API and lets you select which ones to install.",
              },
              {
                iconBg: 'linear-gradient(135deg, #3d1a0f 0%, #4a1a0a 100%)',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                    <rect x="8" y="10" width="13" height="14" rx="2" stroke="white" strokeWidth="2" />
                    <path d="M8 10V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="white" strokeWidth="2" />
                    <path d="M11 16h7M11 20h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Copy Between Agents',
                desc: 'Found a great Claude Code skill? Copy it to Cursor or Windsurf in one click. The app handles all path resolution automatically.',
              },
              {
                iconBg: 'linear-gradient(135deg, #0f2d3d 0%, #0a2433 100%)',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                    <path d="M4 5h3l2.5 12h10L22 9H8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="11.5" cy="22" r="1.5" fill="white" />
                    <circle cx="19.5" cy="22" r="1.5" fill="white" />
                  </svg>
                ),
                title: 'Marketplace',
                desc: 'Browse community-published skill packs from mcpmarket.com directly within the app. Search, preview, and install in a single flow.',
              },
              {
                iconBg: 'linear-gradient(135deg, #2d1a3d 0%, #1f1228 100%)',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                    <circle cx="11" cy="12" r="5" stroke="white" strokeWidth="2" />
                    <path d="M15 15l8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M20 18l2 2M18 20l2 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
                title: 'GitHub Token',
                desc: 'Stores a personal access token locally to lift GitHub API rate limits during skill discovery and installation — no server involved.',
              },
            ].map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 70}>
                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="h-full">
                  <MouseSpotCard
                    className="feature-card group rounded-2xl p-6 h-full cursor-default"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div
                      className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                      style={{ background: f.iconBg }}
                    >
                      {f.icon}
                    </div>
                    <h3 className="relative z-10 text-[15px] font-bold text-white mb-2.5">{f.title}</h3>
                    <p className="relative z-10 text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors duration-200">{f.desc}</p>
                  </MouseSpotCard>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Daily Planner ── */}
      <section id="daily-planner" className="border-t border-white/[0.04] py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full blur-[130px]"
            style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 border border-violet-500/20 mb-5"
                style={{ background: 'rgba(139,92,246,0.08)' }}>
                <span className="text-sm">📅</span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-violet-400 font-semibold">Built-in Feature</span>
              </span>

              <h2 className="font-heading text-3xl sm:text-4xl tracking-tight text-white mb-5 leading-tight">
                Your daily planner,<br />
                <span className="text-shimmer-flow">inside the app</span>
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-md">
                Productivity Boost includes a full daily planner — no extra app needed.
                Plan your day, track habits, review your mood, and stay focused,
                all in one place alongside your AI workflow.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  '✅ Top 3 priorities',
                  '📋 Task checklist',
                  '⏰ Hour-by-hour schedule',
                  '💧 Water & sleep tracker',
                  '⭐ Productivity rating',
                  '😊 Mood check-in',
                  '✨ Daily motivational quote',
                  '💾 Auto-saved locally',
                ].map(f => (
                  <span key={f} className="text-xs px-3 py-1.5 rounded-full border border-white/[0.06] text-slate-400"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {f}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-600">
                Data stays 100% on your machine — no cloud, no account required.
              </p>
            </ScrollReveal>

            {/* Right — visual card */}
            <ScrollReveal delay={80}>
              <div className="rounded-2xl border border-white/[0.06] overflow-hidden"
                style={{ background: 'rgba(10,10,20,0.8)' }}>
                {/* Card header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]"
                  style={{ background: 'rgba(139,92,246,0.06)' }}>
                  <span className="text-xs font-semibold text-zinc-300">📅 Daily Planner — Sunday, March 29</span>
                  <span className="text-[10px] text-emerald-400">✓ Auto-saved</span>
                </div>

                <div className="p-5 space-y-5">
                  {/* Priorities */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">••• Top 3 Priorities</p>
                    <div className="space-y-1.5">
                      {['Ship the new onboarding flow', 'Review PR #42 before standup', 'Write weekly retrospective'].map((t, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <span className="text-[10px] text-violet-500 w-3">{i + 1}.</span>
                          <span className="text-xs text-zinc-300">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schedule preview */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">⏰ Schedule</p>
                    <div className="space-y-1">
                      {[
                        { time: '9 AM', task: 'Team standup & planning' },
                        { time: '10 AM', task: 'Deep work — feature build' },
                        { time: '1 PM', task: 'Code review session' },
                        { time: '3 PM', task: 'Write docs & close issues' },
                      ].map(s => (
                        <div key={s.time} className="flex items-center gap-3">
                          <span className="text-[10px] text-zinc-600 w-10 tabular-nums flex-shrink-0">{s.time}</span>
                          <span className="text-xs text-zinc-400 border-b border-zinc-800/60 flex-1 pb-0.5">{s.task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day review */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-600">Sleep</span>
                      <span className="text-xs font-semibold text-violet-400">8h</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span key={i} className="text-sm">{i <= 4 ? '⭐' : '☆'}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-0.5 text-base">
                      <span className="opacity-40">😢</span>
                      <span className="opacity-40">😐</span>
                      <span className="opacity-40">🙂</span>
                      <span className="opacity-40">😄</span>
                      <span className="scale-125">🤩</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <TechStack />

      {/* ── Platform Download Cards ── */}
      <PlatformCards />

      {/* ── Comparison Table ── */}
      <ComparisonTable />

      {/* ── Prompt Library ── */}
      <section className="border-t border-white/[0.04] py-28 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto px-6 relative">
          {/* Header */}
          <ScrollReveal>
            <div className="flex items-center justify-center gap-2 mb-5">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                New
              </span>
              <p className="text-[11px] uppercase tracking-[0.25em] text-violet-400/50 font-semibold">
                Prompt Library
              </p>
            </div>
            <h2 className="font-heading text-[1.75rem] sm:text-[2.5rem] text-center mb-4 tracking-tight">
              Your personal prompt vault
            </h2>
            <p className="text-center text-sm text-slate-500 mb-16 max-w-md mx-auto leading-relaxed">
              Write once, reuse everywhere. Store your best prompts with tags and collections — find any prompt in seconds and copy it straight to your agent.
            </p>
          </ScrollReveal>

          {/* Two-column: mockup left, feature list right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left — prompt card mockup */}
            <ScrollReveal delay={80}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
              >
                {/* Top bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="text-[11px] text-slate-600 flex-1">Prompt Library</div>
                  <div
                    className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                    style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
                  >
                    + New Prompt
                  </div>
                </div>

                {/* Prompt cards */}
                <div className="p-4 space-y-3">
                  {[
                    { title: 'Code Review Checklist', preview: 'Review this code for: readability, edge cases, security issues, and performance bottlenecks. Provide specific suggestions...', tags: ['code', 'review'], color: 'rgba(139,92,246,0.08)' },
                    { title: 'Git Commit Message', preview: 'Write a conventional commit message for the following changes. Format: type(scope): description...', tags: ['git', 'commit'], color: 'rgba(96,165,250,0.08)' },
                    { title: 'Explain Like I\'m 5', preview: 'Explain the following concept in simple terms a beginner can understand, using analogies where helpful...', tags: ['explain', 'learning'], color: 'rgba(52,211,153,0.08)' },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="group rounded-xl p-3.5"
                      style={{ background: card.color, border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-zinc-200">{card.title}</span>
                        <div
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
                        >
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M3 3V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeWidth="1.4" /></svg>
                          Copy
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed line-clamp-2">{card.preview}</p>
                      <div className="flex gap-1 mt-2.5">
                        {card.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Right — feature bullets */}
            <ScrollReveal delay={160}>
              <div className="space-y-7">
                {[
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    ),
                    color: 'rgba(139,92,246,0.15)',
                    textColor: '#a78bfa',
                    title: 'Create & store prompts',
                    desc: 'Write any prompt — system instructions, templates, workflows — and store it with a title and description so you never lose it.',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5h12M2 8h8M2 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    ),
                    color: 'rgba(96,165,250,0.15)',
                    textColor: '#60a5fa',
                    title: 'Tag and organise',
                    desc: 'Add tags like "git", "review", "coding" and group related prompts into collections — find exactly what you need in seconds.',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    ),
                    color: 'rgba(52,211,153,0.15)',
                    textColor: '#34d399',
                    title: 'Search instantly',
                    desc: 'Real-time search across titles, content, and tags. No folders to dig through — just type and find.',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M5 4V3a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeWidth="1.5" /></svg>
                    ),
                    color: 'rgba(251,191,36,0.12)',
                    textColor: '#fbbf24',
                    title: 'One-click copy',
                    desc: 'Copy any prompt to clipboard instantly. Paste it straight into Claude Code, Cursor, or any agent — no re-typing, ever.',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-start gap-4"
                  >
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                      style={{ background: item.color, color: item.textColor }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="container px-6">
        <div className="glow-divider" />
      </div>

      {/* ── Testimonials — Smooth Carousel ── */}
      <section className="border-t border-white/[0.04] py-24 overflow-hidden relative">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(6,182,212,0.04) 0%, transparent 70%)' }}
        />
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.25em] text-violet-400/50 font-semibold mb-14 text-center">
            What people are saying
          </p>
        </ScrollReveal>

        <div
          className="max-w-4xl mx-auto px-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Card area */}
          <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 260 }}>
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: activeTestimonial === i ? 1 : 0,
                  y: activeTestimonial === i ? 0 : 16,
                  pointerEvents: activeTestimonial === i ? 'auto' : 'none',
                }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center"
              >
                <div
                  className="w-full rounded-3xl p-8 md:p-10"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex flex-col gap-5 max-w-2xl mx-auto text-center">
                    {/* Stars */}
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, si) => (
                        <svg key={si} className="w-3.5 h-3.5 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-light italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    {/* Author */}
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover ring-2"
                        style={{ ringColor: t.gradientFrom, boxShadow: `0 0 0 2px ${t.gradientFrom}55` }}
                      />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">{t.name}</p>
                        <a
                          href={t.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity"
                        >
                          {t.source === 'Product Hunt' ? <PHIcon /> : <HNIcon />}
                          <span className="text-[10px] uppercase tracking-widest">{t.source}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dots + arrows */}
          <div className="flex items-center justify-center gap-5 mt-8">
            <button
              onClick={() => setActiveTestimonial((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-violet-500/40 transition-all"
              aria-label="Previous"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M6.5 2L3.5 5L6.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: activeTestimonial === i ? 20 : 6,
                    height: 6,
                    background: activeTestimonial === i ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.12)',
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveTestimonial((i) => (i + 1) % testimonials.length)}
              className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-violet-500/40 transition-all"
              aria-label="Next"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-white/[0.04] py-24 relative overflow-hidden">
        {/* Background glow blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-3xl mx-auto px-6 relative">
          {/* ── Header — all centered, one block ── */}
          <ScrollReveal>
            <div className="text-center mb-14">
              {/* Glowing badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border border-violet-500/20"
                style={{ background: 'rgba(139,92,246,0.08)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-violet-400 font-semibold">FAQ</span>
              </div>

              {/* Big headline */}
              <h2 className="font-heading text-4xl sm:text-5xl tracking-tight leading-tight mb-4">
                <span className="text-white">Everything you </span>
                <span className="relative inline-block">
                  <span className="text-shimmer-flow">need to know</span>
                </span>
              </h2>

              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                Can't find what you're looking for?{' '}
                <a
                  href="https://github.com/zunalabs/productivity-boost/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
                >
                  Open an issue
                </a>{' '}
                and we'll get back to you.
              </p>
            </div>
          </ScrollReveal>

          {/* ── Accordion ── */}
          <ScrollReveal delay={60}>
            <Faq />
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA — Cinematic ── */}
      <section id="cta" className="border-t border-white/[0.04] py-32 relative overflow-hidden">
        {/* Large purple orb */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
        />
        {/* Cyan accent */}
        <div
          className="pointer-events-none absolute top-1/3 right-1/4 w-[500px] h-[300px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)' }}
        />
        {/* Horizontal glow line */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-px animate-glow-line"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.4) 50%, transparent 100%)' }}
        />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-[0.25em] text-violet-400/50 font-semibold mb-5">
              Start now
            </p>
            <h2 className="font-heading text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] mb-6 tracking-tight leading-tight">
              Take control of your
              <br />
              <Sparkles><span className="text-gradient-bright animate-gradient">AI skills.</span></Sparkles>
            </h2>
            <p className="text-sm text-slate-500 mb-12 max-w-sm mx-auto">
              Free and open source. Windows and Linux available now. Mac coming soon.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <div className="animate-glow-strong btn-gradient-border">
                <a
                  href="https://github.com/zunalabs/productivity-boost/releases/latest/download/Prompt-Skill-Manager-Setup.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-[14px] text-sm font-bold text-white overflow-hidden btn-shimmer transition-all duration-300 hover:scale-105 hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #6366f1 100%)' }}
                >
                  <WindowsIcon />
                  Download for Windows
                </a>
              </div>

            </div>

            <p className="text-[11px] text-slate-700">
              Windows may show a SmartScreen warning — click &ldquo;More info&rdquo; → &ldquo;Run anyway&rdquo;.{' '}
              <a
                href="https://github.com/zunalabs/productivity-boost"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-500 transition-colors"
              >
                Source code is public.
              </a>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04] py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/productivity-boost-1.0.jpg"
              alt=""
              width={24}
              height={24}
              className="rounded-lg object-cover opacity-70"
            />
            <span className="font-heading text-sm text-slate-400">Productivity Boost</span>
            <span className="text-slate-600 text-sm">
              by{' '}
              <a
                href="https://github.com/orgs/zunalabs/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-violet-400 transition-colors"
              >
                Anubhav
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/zunalabs/productivity-boost"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-violet-400 transition-colors"
            >
              GitHub
            </a>
            <a href="/LICENSE" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">
              MIT License
            </a>
            <span className="text-sm text-slate-700">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
