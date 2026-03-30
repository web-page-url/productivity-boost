'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Task { id: number; text: string; completed: boolean }
interface DayReview {
  hoursSlept: number | null
  healthyDiet: string[]
  waterIntake: boolean[]
  productivity: boolean[]
  mood: number | null   // 0-4
}
interface ScheduleEntry { [time: string]: string }
interface PlannerData {
  priorities: Task[]
  tasks: Task[]
  schedule: ScheduleEntry
  bestMoment: string
  gratitude: string
  dayReview: DayReview
}

// ── Quotes ────────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
  { text: 'Failure is simply the opportunity to begin again, this time more intelligently.', author: 'Henry Ford' },
  { text: 'Life is 10% what happens to us and 90% how we react to it.', author: 'Charles R. Swindoll' },
  { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
  { text: 'Do something today that your future self will thank you for.', author: 'Unknown' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Doubt kills more dreams than failure ever will.', author: 'Suzy Kassem' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'Hardships often prepare ordinary people for an extraordinary destiny.', author: 'C.S. Lewis' },
  { text: 'Quality means doing it right when no one is looking.', author: 'Henry Ford' },
  { text: 'Opportunities don\'t happen. You create them.', author: 'Chris Grosser' },
  { text: 'Great things are done by a series of small things brought together.', author: 'Vincent Van Gogh' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
]

const TIME_SLOTS = [
  '5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM',
  '1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM',
]
const MEALS = [
  { key: 'Breakfast', icon: '🍳', short: 'B' },
  { key: 'Lunch',     icon: '🍱', short: 'L' },
  { key: 'Snack',     icon: '🥪', short: 'S' },
  { key: 'Dinner',    icon: '🍽️', short: 'D' },
]
const MOODS = ['😢','😐','🙂','😄','🤩']

// ── Default data factory ──────────────────────────────────────────────────────
function defaultData(): PlannerData {
  return {
    priorities: [1,2,3].map(id => ({ id, text: '', completed: false })),
    tasks: Array.from({ length: 12 }, (_, i) => ({ id: i, text: '', completed: false })),
    schedule: Object.fromEntries(TIME_SLOTS.map(t => [t, ''])),
    bestMoment: '',
    gratitude: '',
    dayReview: {
      hoursSlept: null,
      healthyDiet: [],
      waterIntake: Array(8).fill(false),
      productivity: Array(5).fill(false),
      mood: null,
    },
  }
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function storageKey(date: string) { return `daily-planner-${date}` }

function loadForDate(date: string): PlannerData {
  try {
    const raw = localStorage.getItem(storageKey(date))
    if (!raw) return defaultData()
    return { ...defaultData(), ...JSON.parse(raw) }
  } catch { return defaultData() }
}

function saveForDate(date: string, data: PlannerData) {
  try { localStorage.setItem(storageKey(date), JSON.stringify(data)) } catch { /* ignore */ }
}

// ── Export all planner entries as JSON file ────────────────────────────────────
function exportAllData() {
  const allEntries: Record<string, PlannerData> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('daily-planner-')) {
      try {
        const date = key.replace('daily-planner-', '')
        allEntries[date] = JSON.parse(localStorage.getItem(key)!)
      } catch { /* skip corrupted */ }
    }
  }
  const blob = new Blob([JSON.stringify(allEntries, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `planner-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Import planner entries from JSON file ─────────────────────────────────────
function importData(file: File, onDone: () => void) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string)
      let count = 0
      for (const [date, data] of Object.entries(parsed)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          localStorage.setItem(storageKey(date), JSON.stringify(data))
          count++
        }
      }
      alert(`✓ Imported ${count} day${count !== 1 ? 's' : ''} of planner data.`)
      onDone()
    } catch {
      alert('Failed to import — make sure the file is a valid planner backup.')
    }
  }
  reader.readAsText(file)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayISO() { return new Date().toISOString().split('T')[0] }

function getDayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}
function getDaysRemaining(d: Date) {
  const end = new Date(d.getFullYear(), 11, 31)
  return Math.floor((end.getTime() - d.getTime()) / 86400000)
}

// ── Shared input class ────────────────────────────────────────────────────────
const INPUT = 'w-full bg-transparent border-b border-zinc-700 focus:border-violet-500 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none py-1 resize-none leading-snug'

// ── Main component ────────────────────────────────────────────────────────────
export default function DailyPlannerView() {
  const [date, setDate] = useState(todayISO())
  const [data, setData] = useState<PlannerData>(() => loadForDate(todayISO()))
  const [quote, setQuote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const [saved, setSaved] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const handleSave = useCallback(() => {
    saveForDate(date, data)
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }, [date, data])

  // Load when date changes
  useEffect(() => { setData(loadForDate(date)) }, [date])

  // Auto-save debounced
  useEffect(() => {
    const t = setTimeout(() => {
      saveForDate(date, data)
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    }, 600)
    return () => clearTimeout(t)
  }, [data, date])

  const update = useCallback((patch: Partial<PlannerData>) => {
    setData(prev => ({ ...prev, ...patch }))
  }, [])

  const today = new Date(date + 'T12:00:00')
  const dayName = today.toLocaleString('en-US', { weekday: 'long' }).toUpperCase()
  const monthName = today.toLocaleString('en-US', { month: 'long' }).toUpperCase()
  const dateNum = today.getDate()
  const dayOfYear = getDayOfYear(today)
  const daysLeft = getDaysRemaining(today)

  return (
    <div className="flex flex-1 overflow-hidden p-2">
      <div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-800/40 bg-[#0a0a0c]">
        <div className="max-w-5xl mx-auto p-6 space-y-6">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          {/* Hidden file input for import */}
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importData(file, () => setData(loadForDate(date)))
              e.target.value = ''
            }}
          />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">Daily Planner</h1>
              <p className="text-xs text-zinc-600 mt-0.5">Day {dayOfYear} · {daysLeft} days remaining this year</p>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-[11px] text-emerald-500 transition-opacity">✓ Saved</span>
              )}
              {/* Export */}
              <button
                onClick={exportAllData}
                title="Export all planner data as JSON"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
              >
                ⬆ Export
              </button>
              {/* Import */}
              <button
                onClick={() => importRef.current?.click()}
                title="Import planner data from JSON backup"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
              >
                ⬇ Import
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
              >
                💾 Save
              </button>
              <div className="text-right">
                <p className="text-sm font-semibold text-violet-400">{dayName}</p>
                <p className="text-xs text-zinc-500">{monthName} {dateNum}</p>
              </div>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-600 cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>

          {/* ── Quote ──────────────────────────────────────────────────────── */}
          <div className="relative group rounded-xl bg-violet-950/20 border border-violet-900/30 px-5 py-4">
            <p className="text-sm italic text-zinc-300 text-center">"{quote.text}"</p>
            <p className="text-xs text-zinc-600 text-center mt-1">— {quote.author}</p>
            <button
              onClick={() => {
                let next: typeof QUOTES[0]
                do { next = QUOTES[Math.floor(Math.random() * QUOTES.length)] } while (next.text === quote.text)
                setQuote(next)
              }}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-violet-600/30 hover:bg-violet-600/60 flex items-center justify-center text-violet-400 transition-all"
              title="New quote"
            >
              <RefreshCw size={11} />
            </button>
          </div>

          {/* ── Main grid ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-5">

            {/* Left — Priorities + Tasks */}
            <div className="space-y-5">
              {/* Top 3 Priorities */}
              <Section title="••• TOP 3 PRIORITIES FOR TODAY">
                <div className="space-y-2">
                  {data.priorities.map((p, i) => (
                    <div key={p.id} className="flex items-start gap-2">
                      <span className="text-xs text-violet-500 mt-1.5 w-3 flex-shrink-0">{i + 1}.</span>
                      <textarea
                        value={p.text}
                        rows={1}
                        placeholder={`Priority ${i + 1}…`}
                        onChange={e => {
                          e.target.style.height = 'auto'
                          e.target.style.height = e.target.scrollHeight + 'px'
                          update({ priorities: data.priorities.map(x => x.id === p.id ? { ...x, text: e.target.value } : x) })
                        }}
                        className={INPUT}
                      />
                    </div>
                  ))}
                </div>
              </Section>

              {/* To-Do List */}
              <Section title="≡ TO-DO LIST">
                <div className="space-y-1.5">
                  {data.tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => update({ tasks: data.tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t) })}
                        className="mt-1.5 accent-violet-500 flex-shrink-0 cursor-pointer"
                      />
                      <textarea
                        value={task.text}
                        rows={1}
                        placeholder="Task…"
                        onChange={e => {
                          e.target.style.height = 'auto'
                          e.target.style.height = e.target.scrollHeight + 'px'
                          update({ tasks: data.tasks.map(t => t.id === task.id ? { ...t, text: e.target.value } : t) })
                        }}
                        className={`${INPUT} ${task.completed ? 'line-through text-zinc-600' : ''}`}
                      />
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Right — Day Schedule */}
            <Section title="⏰ DAY SCHEDULE">
              <div className="space-y-1">
                {TIME_SLOTS.map(time => (
                  <div key={time} className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-400 w-10 flex-shrink-0 tabular-nums font-medium">{time}</span>
                    <textarea
                      value={data.schedule[time] ?? ''}
                      rows={1}
                      onChange={e => {
                        e.target.style.height = 'auto'
                        e.target.style.height = e.target.scrollHeight + 'px'
                        update({ schedule: { ...data.schedule, [time]: e.target.value } })
                      }}
                      className={INPUT}
                    />
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* ── Bottom grid ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-5">

            {/* Best moment + Gratitude */}
            <div className="space-y-5">
              <Section title="📸 TODAY'S BEST MOMENT">
                <textarea
                  value={data.bestMoment}
                  rows={3}
                  placeholder="Write about your best moment today…"
                  onChange={e => update({ bestMoment: e.target.value })}
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
                />
              </Section>
              <Section title="🙏 WHAT I'M GRATEFUL FOR">
                <textarea
                  value={data.gratitude}
                  rows={3}
                  placeholder="List what you're grateful for…"
                  onChange={e => update({ gratitude: e.target.value })}
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
                />
              </Section>
            </div>

            {/* Day Review */}
            <Section title="📊 DAY REVIEW">
              <div className="space-y-4">

                {/* Hours Slept */}
                <ReviewRow label="Hours Slept">
                  <div className="flex gap-1.5 flex-wrap">
                    {[3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        onClick={() => update({ dayReview: { ...data.dayReview, hoursSlept: data.dayReview.hoursSlept === n ? null : n } })}
                        className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                          data.dayReview.hoursSlept === n
                            ? 'bg-violet-600 text-white scale-110 shadow-md shadow-violet-900/40'
                            : 'border border-zinc-700 text-zinc-300 hover:border-violet-600 hover:text-violet-400'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
                </ReviewRow>

                {/* Healthy Diet */}
                <ReviewRow label="Healthy Diet">
                  <div className="flex gap-2 flex-wrap">
                    {MEALS.map(m => (
                      <button
                        key={m.key}
                        onClick={() => {
                          const hd = data.dayReview.healthyDiet
                          update({ dayReview: { ...data.dayReview, healthyDiet: hd.includes(m.key) ? hd.filter(x => x !== m.key) : [...hd, m.key] } })
                        }}
                        title={m.key}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
                          data.dayReview.healthyDiet.includes(m.key)
                            ? 'bg-violet-600 text-white scale-105 shadow-md shadow-violet-900/40'
                            : 'border border-zinc-700 text-zinc-300 hover:border-violet-600 hover:text-violet-400'
                        }`}
                      >
                        <span>{m.icon}</span>{m.short}
                      </button>
                    ))}
                  </div>
                </ReviewRow>

                {/* Water Intake */}
                <ReviewRow label="Water Intake">
                  <div className="flex gap-1.5 flex-wrap">
                    {data.dayReview.waterIntake.map((on, i) => (
                      <button
                        key={i}
                        onClick={() => update({ dayReview: { ...data.dayReview, waterIntake: data.dayReview.waterIntake.map((v, j) => j === i ? !v : v) } })}
                        className={`w-7 h-7 rounded-full text-sm transition-all flex items-center justify-center ${
                          on
                            ? 'bg-cyan-600/30 text-cyan-400 scale-110'
                            : 'border border-zinc-700 text-zinc-700 hover:border-cyan-700 hover:text-cyan-600'
                        }`}
                      >{on ? '💧' : '○'}</button>
                    ))}
                  </div>
                </ReviewRow>

                {/* Productivity */}
                <ReviewRow label="Productivity">
                  <div className="flex gap-1 flex-wrap">
                    {data.dayReview.productivity.map((on, i) => (
                      <button
                        key={i}
                        onClick={() => update({ dayReview: { ...data.dayReview, productivity: data.dayReview.productivity.map((v, j) => j === i ? !v : v) } })}
                        className={`text-xl transition-all ${on ? 'text-yellow-400 scale-110' : 'text-zinc-700 hover:text-yellow-600'}`}
                        title={`Level ${i + 1}`}
                      >{on ? '⭐' : '☆'}</button>
                    ))}
                  </div>
                </ReviewRow>

                {/* Overall Mood */}
                <ReviewRow label="Overall Mood">
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => update({ dayReview: { ...data.dayReview, mood: data.dayReview.mood === i ? null : i } })}
                        className={`text-xl transition-all ${
                          data.dayReview.mood === i
                            ? 'scale-125 drop-shadow-[0_0_6px_rgba(167,139,250,0.8)]'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={['Sad','Neutral','Good','Happy','Excellent'][i]}
                      >{emoji}</button>
                    ))}
                  </div>
                </ReviewRow>

              </div>
            </Section>
          </div>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          <div className="flex justify-center pb-4">
            <span className="text-xs text-zinc-500">
              Created with ❤️ by <span className="text-zinc-300 font-medium">Anubhav</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-4">
      <h2 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  )
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium">{label}</span>
      {children}
    </div>
  )
}
