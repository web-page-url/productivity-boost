import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, Copy, Pencil, Trash2, Check, FolderPlus } from 'lucide-react'
import { Prompt, Collection, PromptsData } from '../types'
import PromptEditor from './PromptEditor'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function now(): string {
  return new Date().toISOString()
}

export default function PromptsView() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeCollectionId, setActiveCollectionId] = useState<string | null | 'all'>('all')
  const [editorTarget, setEditorTarget] = useState<Prompt | 'new' | null>(null)

  useEffect(() => {
    window.promptsAPI.load().then((data) => {
      setPrompts(data.prompts)
      setCollections(data.collections)
      setLoading(false)
    })
  }, [])

  const persist = useCallback((data: PromptsData) => {
    window.promptsAPI.save(data)
  }, [])

  // ── Prompt mutations ────────────────────────────────────────────────────────
  const handleSavePrompt = (
    draft: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }
  ) => {
    setPrompts((prev) => {
      let next: Prompt[]
      if (draft.id) {
        next = prev.map((p) =>
          p.id === draft.id
            ? { ...p, ...draft, id: p.id, createdAt: p.createdAt, updatedAt: now() }
            : p
        )
      } else {
        const newPrompt: Prompt = {
          id: generateId(),
          title: draft.title,
          content: draft.content,
          tags: draft.tags,
          collectionId: draft.collectionId ?? null,
          createdAt: now(),
          updatedAt: now(),
        }
        next = [newPrompt, ...prev]
      }
      persist({ prompts: next, collections })
      return next
    })
    setEditorTarget(null)
  }

  const handleDeletePrompt = (id: string) => {
    setPrompts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      persist({ prompts: next, collections })
      return next
    })
  }

  // ── Collection mutations ────────────────────────────────────────────────────
  const handleCreateCollection = useCallback((name: string) => {
    const newCol: Collection = { id: generateId(), name: name.trim(), createdAt: now() }
    setCollections((prev) => {
      const next = [...prev, newCol]
      setPrompts((p) => { persist({ prompts: p, collections: next }); return p })
      return next
    })
  }, [persist])

  const handleRenameCollection = useCallback((id: string, name: string) => {
    setCollections((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, name } : c))
      setPrompts((p) => { persist({ prompts: p, collections: next }); return p })
      return next
    })
  }, [persist])

  const handleDeleteCollection = useCallback((id: string) => {
    setPrompts((prevPrompts) => {
      const updatedPrompts = prevPrompts.map((p) =>
        p.collectionId === id ? { ...p, collectionId: null } : p
      )
      setCollections((prevCols) => {
        const updatedCols = prevCols.filter((c) => c.id !== id)
        persist({ prompts: updatedPrompts, collections: updatedCols })
        return updatedCols
      })
      return updatedPrompts
    })
    setActiveCollectionId((cur) => (cur === id ? 'all' : cur))
  }, [persist])

  // ── Filtering ───────────────────────────────────────────────────────────────
  const allTags = Array.from(new Set(prompts.flatMap((p) => p.tags))).sort()

  const filtered = prompts.filter((p) => {
    if (activeCollectionId !== 'all' && p.collectionId !== activeCollectionId) return false
    if (activeTag && !p.tags.includes(activeTag)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  const promptCounts = prompts.reduce<Record<string, number>>((acc, p) => {
    const key = p.collectionId ?? '__none__'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-600">Loading prompts…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {editorTarget !== null && (
        <PromptEditor
          target={editorTarget === 'new' ? null : editorTarget}
          collections={collections}
          defaultCollectionId={activeCollectionId === 'all' ? null : activeCollectionId}
          onSave={handleSavePrompt}
          onClose={() => setEditorTarget(null)}
        />
      )}

      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* Collections sidebar */}
        <CollectionSidebar
          collections={collections}
          activeCollectionId={activeCollectionId}
          onSelect={setActiveCollectionId}
          onCreate={handleCreateCollection}
          onRename={handleRenameCollection}
          onDelete={handleDeleteCollection}
          promptCounts={promptCounts}
          totalCount={prompts.length}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#0c0c0e]">
          {/* Sub-header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/60 flex-shrink-0">
            <div className="relative flex-1 max-w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
              <input
                type="text"
                placeholder="Search prompts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900/70 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs flex-shrink-0">
                {allTags.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border flex-shrink-0 transition-all ${
                      activeTag === tag
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                        : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            <span className="text-[11px] text-zinc-600 ml-auto tabular-nums flex-shrink-0">
              {filtered.length} prompt{filtered.length !== 1 ? 's' : ''}
            </span>

            <button
              onClick={() => setEditorTarget('new')}
              className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-zinc-700/60 bg-zinc-900/70 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs transition-colors flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Prompt
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-1">
                    {prompts.length === 0 ? 'No prompts yet' : 'No matching prompts'}
                  </p>
                  <p className="text-xs text-zinc-600 mb-3">
                    {prompts.length === 0
                      ? 'Create your first prompt to get started'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {prompts.length === 0 && (
                    <button
                      onClick={() => setEditorTarget('new')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                    >
                      Create prompt
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filtered.map((p) => (
                  <PromptCard
                    key={p.id}
                    prompt={p}
                    onEdit={() => setEditorTarget(p)}
                    onDelete={() => handleDeletePrompt(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── PromptCard ─────────────────────────────────────────────────────────────────
function PromptCard({
  prompt,
  onEdit,
  onDelete,
}: {
  prompt: Prompt
  onEdit: () => void
  onDelete: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(prompt.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group flex flex-col gap-3 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-200 leading-tight line-clamp-1 flex-1 min-w-0">
          {prompt.title || <span className="text-zinc-600 italic">Untitled</span>}
        </h3>
        <button
          onClick={handleCopy}
          title="Copy prompt"
          className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all border ${
            copied
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'opacity-0 group-hover:opacity-100 bg-zinc-800/60 border-zinc-700/50 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700'
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {/* Preview */}
      <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3 flex-1">
        {prompt.content || <span className="italic text-zinc-700">No content</span>}
      </p>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {prompt.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/15"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 4 && (
            <span className="text-[10px] text-zinc-700">+{prompt.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800/60">
        <span className="text-[10px] text-zinc-700 flex-1">
          {new Date(prompt.updatedAt).toLocaleDateString()}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
          title="Edit"
        >
          <Pencil className="w-3 h-3" />
        </button>
        {confirmDelete ? (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); setConfirmDelete(false) }}
              className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-all"
            >
              Delete
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
              className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── CollectionSidebar ──────────────────────────────────────────────────────────
function CollectionSidebar({
  collections,
  activeCollectionId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  promptCounts,
  totalCount,
}: {
  collections: Collection[]
  activeCollectionId: string | null | 'all'
  onSelect: (id: string | null | 'all') => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  promptCounts: Record<string, number>
  totalCount: number
}) {
  const [newName, setNewName] = useState('')
  const [showNewInput, setShowNewInput] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const newInputRef = useRef<HTMLInputElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showNewInput) newInputRef.current?.focus()
  }, [showNewInput])

  useEffect(() => {
    if (renamingId) renameRef.current?.focus()
  }, [renamingId])

  const submitNew = () => {
    if (newName.trim()) onCreate(newName.trim())
    setNewName('')
    setShowNewInput(false)
  }

  const submitRename = (id: string) => {
    if (renameValue.trim()) onRename(id, renameValue.trim())
    setRenamingId(null)
  }

  return (
    <aside className="w-52 flex-shrink-0 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-3 pb-2 flex-shrink-0">
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Collections</span>
        <button
          onClick={() => setShowNewInput(true)}
          title="New collection"
          className="w-5 h-5 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-px">
        {/* All Prompts */}
        <button
          onClick={() => onSelect('all')}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
            activeCollectionId === 'all'
              ? 'bg-zinc-800/80 text-zinc-100'
              : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
          }`}
        >
          <span>All Prompts</span>
          <span className="text-[10px] text-zinc-600 tabular-nums">{totalCount}</span>
        </button>

        {collections.map((col) => (
          <div key={col.id} className="group relative">
            {renamingId === col.id ? (
              <input
                ref={renameRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => submitRename(col.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename(col.id)
                  if (e.key === 'Escape') setRenamingId(null)
                }}
                className="w-full bg-zinc-800 border border-violet-500/40 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            ) : (
              <button
                onClick={() => onSelect(col.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                  activeCollectionId === col.id
                    ? 'bg-zinc-800/80 text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
                }`}
              >
                <span className="truncate flex-1 text-left">{col.name}</span>
                <span className="text-[10px] text-zinc-600 tabular-nums flex-shrink-0 ml-1">
                  {promptCounts[col.id] ?? 0}
                </span>
              </button>
            )}

            {renamingId !== col.id && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-zinc-900 pl-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setRenamingId(col.id)
                    setRenameValue(col.name)
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                  title="Rename"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(col.id)
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete collection"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {showNewInput && (
          <input
            ref={newInputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={submitNew}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitNew()
              if (e.key === 'Escape') { setShowNewInput(false); setNewName('') }
            }}
            placeholder="Collection name…"
            className="w-full bg-zinc-800 border border-violet-500/40 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
          />
        )}
      </div>
    </aside>
  )
}
