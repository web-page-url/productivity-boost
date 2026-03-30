import { useState, useRef, useEffect } from 'react'

interface Profile {
  name: string
  imageBase64: string | null
}

interface ProfileModalProps {
  profile: Profile
  onClose: () => void
  onSave: (profile: Profile) => void
}

export default function ProfileModal({ profile, onClose, onSave }: ProfileModalProps) {
  const [draft, setDraft] = useState<Profile>({ ...profile })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleImage = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setDraft((d) => ({ ...d, imageBase64: e.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    await window.profileAPI.set({ name: draft.name, imageBase64: draft.imageBase64 })
    onSave(draft)
    setSaved(true)
    setTimeout(onClose, 700)
  }

  const handleReset = async () => {
    const empty: Profile = { name: '', imageBase64: null }
    await window.profileAPI.set({ name: '', imageBase64: null })
    onSave(empty)
    onClose()
  }

  const hasCustom = profile.name || profile.imageBase64

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-80 rounded-2xl shadow-2xl"
        style={{ background: '#0d0d12', border: '1px solid rgba(255,255,255,0.07)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-100">Your Profile</span>
            <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              Local only
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Avatar upload */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-dashed transition-all duration-200 hover:border-violet-500/50 group"
              style={{
                borderColor: draft.imageBase64 ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {draft.imageBase64 ? (
                <img src={draft.imageBase64} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-zinc-600 group-hover:text-violet-400 transition-colors">
                    <path d="M8 3v7M8 3L5.5 5.5M8 3L10.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[9px] text-zinc-600 group-hover:text-violet-400 transition-colors">Upload</span>
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 mb-0.5">Profile image</p>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Replaces the app logo in the header. Saved locally on your machine.
              </p>
              {draft.imageBase64 && (
                <button
                  onClick={() => setDraft((d) => ({ ...d, imageBase64: null }))}
                  className="text-[10px] text-red-500/60 hover:text-red-400 mt-1.5 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f) }}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-800/60" />

          {/* Name input */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1.5">
              Your name
            </label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Alex"
              maxLength={40}
              className="w-full text-sm text-zinc-200 placeholder-zinc-600 rounded-lg px-3 py-2 bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <p className="text-[11px] text-zinc-600 mt-1">
              Shows in the header alongside your logo.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200"
              style={{
                background: saved
                  ? 'linear-gradient(135deg, #059669, #10b981)'
                  : 'linear-gradient(135deg, #6d28d9, #7c3aed)',
              }}
            >
              {saved ? '✓ Saved!' : 'Save'}
            </button>
            {hasCustom && (
              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition-all"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
