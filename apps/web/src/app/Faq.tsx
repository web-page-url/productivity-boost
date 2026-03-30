'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const items = [
  {
    q: 'What are skills?',
    a: (
      <>
        Skills are reusable instruction sets that extend what an AI coding agent can do. They're
        typically markdown or text files that tell the agent how to handle specific tasks — things
        like enforcing a commit message format, following a project's code style, or running a
        custom workflow. Each agent has its own name for them: Claude Code calls them{' '}
        <span className="text-white font-mono text-xs border border-[rgba(255,255,255,0.12)] rounded px-1.5 py-0.5">
          /skills
        </span>
        , Cursor has Rules, Copilot has Instructions — but they're all the same idea.
      </>
    ),
  },
  {
    q: 'What inspired this?',
    a: "The AI coding agent space exploded fast. Within months there were a dozen agents, each with their own way of storing and loading skills. Moving between agents meant re-doing all your configuration from scratch, and discovering good community-built skills meant digging through GitHub manually. Productivity Boost was built to fix that friction — one app that speaks every agent's language, so your knowledge travels with you no matter which tool you're using that day.",
  },
  {
    q: 'Is it free?',
    a: 'Yes. Productivity Boost is fully open source under the MIT license. No accounts, no telemetry, no paywalls — ever.',
  },
  {
    q: 'Which agents are supported?',
    a: 'Currently: Claude Code, Cursor, Gemini CLI, Windsurf, GitHub Copilot, Goose, OpenAI Codex, OpenCode, Kilo Code, Trae, and Antigravity. New agents are added as they gain traction — contributions welcome.',
  },
  {
    q: 'Does it work offline?',
    a: 'Almost entirely. Scanning and managing your local skills works 100% offline. The only features that need internet are: installing skills from a GitHub URL, browsing the marketplace, and fetching the GitHub star count shown in the navbar. Your skill files never leave your machine.',
  },
  {
    q: 'Where are my skills stored?',
    a: (
      <>
        Skills stay exactly where each agent expects them — Productivity Boost reads and writes
        directly to the native directories (e.g.{' '}
        <span className="text-white font-mono text-xs border border-[rgba(255,255,255,0.12)] rounded px-1.5 py-0.5">
          ~/.claude/commands/
        </span>{' '}
        for Claude Code,{' '}
        <span className="text-white font-mono text-xs border border-[rgba(255,255,255,0.12)] rounded px-1.5 py-0.5">
          ~/.cursor/rules/
        </span>{' '}
        for Cursor, and so on). Nothing is copied to a proprietary database or cloud. Disabling a
        skill moves it to a{' '}
        <span className="text-white font-mono text-xs border border-[rgba(255,255,255,0.12)] rounded px-1.5 py-0.5">
          .disabled/
        </span>{' '}
        subfolder so it can be re-enabled at any time.
      </>
    ),
  },
  {
    q: 'How do I install a skill from GitHub?',
    a: 'Open the app, click "Install from GitHub", and paste any public GitHub repository URL. The app uses GitHub\'s recursive tree API to scan for skill files, shows you a checklist to pick which ones you want, then downloads and places them into the correct directory for whichever agents you choose. A GitHub personal access token is optional but recommended to avoid rate limits on large repos.',
  },
  {
    q: 'Can I copy a skill to multiple agents at once?',
    a: 'Yes. Select the skill you want to share, choose "Copy to agent", and pick one or more target agents from the list. The app resolves each agent\'s skill directory automatically and handles any file-format differences. This is the fastest way to keep your best prompts in sync across your whole toolkit.',
  },
  {
    q: 'Is there a Mac version?',
    a: 'Not yet — Windows is available now. Mac support is actively being worked on. The codebase is Electron-based so the port is straightforward; code signing and notarization are the main things being sorted out.',
  },
  {
    q: 'How do I contribute or request a new agent?',
    a: (
      <>
        Open an issue or pull request on the{' '}
        <a
          href="https://github.com/zunalabs/productivity-boost"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 underline hover:text-violet-300 transition-colors"
        >
          GitHub repository
        </a>
        . Adding a new agent typically means adding its skill directory path and file pattern to the
        agent config — usually a one-file change. The codebase is fully TypeScript and the
        contributing guide walks you through the process.
      </>
    ),
  },
  {
    q: 'Does it collect any data or telemetry?',
    a: "None at all. There are no analytics, crash reporters, update pings, or any form of telemetry. The app makes outbound requests only when you explicitly trigger a GitHub install or marketplace browse — and only to GitHub's public API or mcpmarket.com. Your GitHub token (if set) is stored locally in your OS keychain and never transmitted anywhere else.",
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-white/[0.05]">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-start gap-4 py-5 text-left group"
            >
              {/* Number badge */}
              <span
                className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold mt-0.5 transition-colors duration-200"
                style={{
                  background: isOpen ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                  color: isOpen ? '#a78bfa' : '#52525b',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <motion.span
                className="flex-1 font-medium text-[0.9375rem] leading-snug"
                animate={{ color: isOpen ? '#ffffff' : '#94a3b8' }}
                transition={{ duration: 0.15 }}
              >
                {item.q}
              </motion.span>

              {/* Plus / minus icon */}
              <span className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
                <motion.svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <path d="M7 1v12M1 7h12" stroke={isOpen ? '#a78bfa' : '#3f3f46'} strokeWidth="1.6" strokeLinecap="round" />
                </motion.svg>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="pl-10 pb-5 text-sm text-slate-500 leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
