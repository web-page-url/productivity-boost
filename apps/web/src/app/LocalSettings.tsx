'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export interface LocalSettingsData {
  name: string
  image: string | null
}

const KEY = 'psm_local_settings'

export function useLocalSettings() {
  const [settings, setSettings] = useState<LocalSettingsData>({ name: '', image: null })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setSettings(JSON.parse(raw))
    } catch {}
    setMounted(true)
  }, [])

  const save = (data: LocalSettingsData) => {
    setSettings(data)
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
  }

  const clear = () => {
    setSettings({ name: '', image: null })
    try { localStorage.removeItem(KEY) } catch {}
  }

  return { settings, save, clear, mounted }
}

export function SettingsTrigger() {
  const { settings, save, clear, mounted } = useLocalSettings()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<LocalSettingsData>({ name: '', image: null })
  const [saved, setSaved] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setDraft({ ...settings })
  }, [open, settings])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleImage = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setDraft((d) => ({ ...d, image: e.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    save(draft)
    setSaved(true)
    setTimeout(() => { setSaved(false); setOpen(false) }, 800)
  }

  if (!mounted) {
    return (
      <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
        <Image src="/productivity-boost-1.0.jpg" alt="Profile" width={28} height={28} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div ref={panelRef} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 group"
        title="Edit profile"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors flex-shrink-0">
          {settings.image ? (
            <img src={settings.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Image src="/productivity-boost-1.0.jpg" alt="Productivity Boost" width={28} height={28} className="w-full h-full object-cover" />
          )}
        </div>
        {settings.name && (
          <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors hidden sm:block max-w-[80px] truncate">
            {settings.name}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-72 rounded-2xl shadow-2xl z-50 border border-white/8 p-4 space-y-4"
          style={{ background: '#0d0d12' }}>
          {/* Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-dashed transition-all hover:border-violet-500/50 group"
              style={{
                borderColor: draft.image ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {draft.image ? (
                <img src={draft.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-slate-600 group-hover:text-violet-400 transition-colors">
                    <path d="M8 3v7M8 3L5.5 5.5M8 3L10.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[9px] text-slate-600 group-hover:text-violet-400 transition-colors">Upload</span>
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 mb-0.5">Profile image</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">Replaces the app logo. Saved locally in your browser.</p>
              {draft.image && (
                <button onClick={() => setDraft((d) => ({ ...d, image: null }))}
                  className="text-[10px] text-red-500/60 hover:text-red-400 mt-1 transition-colors">
                  Remove
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f) }} />
          </div>

          <div className="h-px bg-white/5" />

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Your name</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Alex"
              maxLength={40}
              className="w-full text-sm text-slate-200 placeholder-slate-600 rounded-lg px-3 py-2 bg-slate-900 border border-slate-800 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-all"
              style={{ background: saved ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#6d28d9,#7c3aed)' }}
            >
              {saved ? '✓ Saved!' : 'Save'}
            </button>
            {(settings.name || settings.image) && (
              <button onClick={clear}
                className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-all">
                Reset
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 border border-slate-800 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
