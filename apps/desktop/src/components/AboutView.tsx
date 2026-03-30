import { Github, Globe, Heart, Zap, Shield, RefreshCw } from 'lucide-react'

const VERSION = '1.0.0'
const GITHUB_URL = 'https://github.com/zunalabs/productivity-boost'
const WEBSITE_URL = 'https://sm.idoevergreen.me'

const AGENTS = [
  'Claude Code', 'Cursor', 'Gemini CLI', 'Windsurf',
  'GitHub Copilot', 'Goose', 'OpenAI Codex', 'OpenCode',
  'Kilo Code', 'Trae', 'Antigravity',
]

const FEATURES = [
  { icon: <Zap size={14} />, label: 'Manage skills across 11+ agents' },
  { icon: <RefreshCw size={14} />, label: 'Install from any GitHub repo' },
  { icon: <Shield size={14} />, label: 'No telemetry · 100% local · MIT license' },
]

export default function AboutView() {
  const open = (url: string) => window.skillsAPI.openExternal(url)

  return (
    <div className="flex flex-1 overflow-hidden p-2">
      <div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-800/40 bg-[#0a0a0c] flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo + name */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-700 shadow-lg shadow-violet-900/20">
              <img
                src="./productivity-boost-1.0.jpg"
                alt="Productivity Boost"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">
                Productivity Boost
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Version {VERSION} · Windows
              </p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-center text-sm text-zinc-400 leading-relaxed">
            One app to manage, install, and sync AI agent skills
            across every coding assistant you use.
          </p>

          {/* Features */}
          <div className="space-y-2">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-xs text-zinc-400"
              >
                <span className="text-violet-400 flex-shrink-0">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* Supported agents */}
          <div>
            <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider mb-2 text-center">
              Supported agents
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {AGENTS.map((a) => (
                <span
                  key={a}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-800/60" />

          {/* Creator */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <span>Made with</span>
            <Heart size={12} className="text-rose-400 fill-rose-400" />
            <span>by</span>
            <span className="text-zinc-200 font-medium">Anubhav</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-600">2026</span>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => open(GITHUB_URL)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            >
              <Github size={13} />
              GitHub
            </button>
            <button
              onClick={() => open(WEBSITE_URL)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            >
              <Globe size={13} />
              Website
            </button>
          </div>

          {/* License */}
          <p className="text-center text-[11px] text-zinc-700">
            Open source under the MIT License · © 2026 ANUBHAV          </p>

        </div>
      </div>
    </div>
  )
}
