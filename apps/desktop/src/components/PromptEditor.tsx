import { useState, useEffect, useRef } from 'react'
import { X, FileText, ChevronDown, Check } from 'lucide-react'
import { Prompt, Collection } from '../types'

function CollectionDropdown({
  collections,
  value,
  onChange,
}: {
  collections: Collection[]
  value: string | null
  onChange: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const options = [{ id: null, name: 'No collection' }, ...collections.map(c => ({ id: c.id, name: c.name }))]
  const selected = options.find(o => o.id === value) ?? options[0]

  return (
    <div ref={ref} className="relative">
      <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block mb-1.5">
        Collection
      </label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 hover:border-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
      >
        <span className={selected.id === null ? 'text-zinc-400' : 'text-zinc-200'}>{selected.name}</span>
        <ChevronDown size={13} className={`text-zinc-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 bottom-full mb-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl overflow-y-auto max-h-48">
          {options.map(opt => (
            <button
              key={String(opt.id)}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <span className={opt.id === null ? 'text-zinc-400' : 'text-zinc-200'}>{opt.name}</span>
              {value === opt.id && <Check size={12} className="text-violet-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface PromptEditorProps {
  target: Prompt | null
  collections: Collection[]
  defaultCollectionId: string | null
  onSave: (data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }) => void
  onClose: () => void
}

export default function PromptEditor({
  target,
  collections,
  defaultCollectionId,
  onSave,
  onClose,
}: PromptEditorProps) {
  const isEdit = target !== null
  const [title, setTitle] = useState(target?.title ?? '')
  const [content, setContent] = useState(target?.content ?? '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(target?.tags ?? [])
  const [collectionId, setCollectionId] = useState<string | null>(
    target?.collectionId ?? defaultCollectionId
  )
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase()
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag])
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const handleSubmit = () => {
    if (!title.trim() && !content.trim()) return
    onSave({
      ...(isEdit ? { id: target.id, createdAt: target.createdAt } : {}),
      title: title.trim(),
      content: content.trim(),
      tags,
      collectionId,
    })
  }

  const isValid = title.trim().length > 0 || content.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-100 flex-1">
            {isEdit ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block mb-1.5">
              Title
            </label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
              placeholder="Prompt title…"
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Prompt content…"
              rows={7}
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide block mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 min-h-[36px] focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-colors">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/20"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-violet-500 hover:text-violet-200 transition-colors leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => { if (tagInput.trim()) addTag(tagInput) }}
                placeholder={tags.length === 0 ? 'Add tags (Enter or comma)…' : ''}
                className="flex-1 min-w-16 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Collection */}
          {collections.length > 0 && (
            <CollectionDropdown
              collections={collections}
              value={collectionId}
              onChange={setCollectionId}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-800">
          <p className="text-[11px] text-zinc-600 mr-auto">Cmd/Ctrl+Enter to save</p>
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isEdit ? 'Save changes' : 'Create prompt'}
          </button>
        </div>
      </div>
    </div>
  )
}
