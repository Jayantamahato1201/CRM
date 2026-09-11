import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone,
  Pin,
  CheckCircle2,
  Circle,
  Plus,
  X,
  Building2,
  ShieldCheck,
  Calendar,
  Server,
  Users,
  Search,
  Filter,
} from 'lucide-react'
import { Card, Badge } from '../components/ui'
import { notices, employees, formatTimeAgo } from '../lib/data'
import { noticePriorityConfig, noticeCategoryConfig } from '../lib/helpers'
import type { Notice, NoticePriority, NoticeCategory } from '../lib/types'

const categoryIcons: Record<NoticeCategory, typeof Building2> = {
  company: Building2,
  policy: ShieldCheck,
  event: Calendar,
  system: Server,
  hr: Users,
}

export function Notices() {
  const [noticeList, setNoticeList] = useState<Notice[]>(notices)
  const [filter, setFilter] = useState<'all' | NoticeCategory>('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'company' as NoticeCategory,
    priority: 'info' as NoticePriority,
  })

  const filtered = noticeList
    .filter((n) => filter === 'all' || n.category === filter)
    .filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  const pinned = filtered.filter((n) => n.pinned)
  const unpinned = filtered.filter((n) => !n.pinned)

  function acknowledge(id: string) {
    setNoticeList((prev) =>
      prev.map((n) =>
        n.id === id && !n.acknowledgments.includes('admin')
          ? { ...n, acknowledgments: [...n.acknowledgments, 'admin'] }
          : n
      )
    )
  }

  function handleCreate() {
    if (!newNotice.title || !newNotice.content) return
    const notice: Notice = {
      id: `NOT-${String(noticeList.length + 1).padStart(3, '0')}`,
      title: newNotice.title,
      content: newNotice.content,
      category: newNotice.category,
      priority: newNotice.priority,
      author: 'Admin',
      authorAvatar: '',
      postedAt: new Date().toISOString(),
      pinned: false,
      readBy: [],
      acknowledgments: [],
    }
    setNoticeList((prev) => [notice, ...prev])
    setShowCreate(false)
    setNewNotice({ title: '', content: '', category: 'company', priority: 'info' })
  }

  const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none'
  const labelClass = 'mb-1 block text-xs font-medium text-slate-400'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notices & Announcements</h1>
          <p className="text-sm text-slate-400">{noticeList.length} notices · {noticeList.filter((n) => !n.acknowledgments.includes('admin')).length} pending acknowledgment</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" /> Post Notice
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-slate-500" />
          {(['all', 'company', 'policy', 'event', 'system', 'hr'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned notices */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          {pinned.map((n, i) => {
            const pc = noticePriorityConfig(n.priority)
            const cc = noticeCategoryConfig(n.category)
            const Icon = categoryIcons[n.category]
            const acked = n.acknowledgments.includes('admin')
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`border-l-2 p-5 ${pc.border}`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cc.bg}`}>
                      <Icon className={`h-5 w-5 ${cc.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pin className="h-3.5 w-3.5 text-amber-400" />
                        <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pc.bg} ${pc.color}`}>{pc.label}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cc.bg} ${cc.color}`}>{cc.label}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{n.content}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>By {n.author}</span>
                          <span>·</span>
                          <span>{formatTimeAgo(n.postedAt)}</span>
                          <span>·</span>
                          <span>{n.acknowledgments.length}/{employees.length} acknowledged</span>
                        </div>
                        <button
                          onClick={() => acknowledge(n.id)}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            acked ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {acked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                          {acked ? 'Acknowledged' : 'Acknowledge'}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Regular notices */}
      <div className="space-y-3">
        {unpinned.map((n, i) => {
          const pc = noticePriorityConfig(n.priority)
          const cc = noticeCategoryConfig(n.category)
          const Icon = categoryIcons[n.category]
          const acked = n.acknowledgments.includes('admin')
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + pinned.length) * 0.05 }}>
              <Card className="p-5 transition hover:border-slate-700">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cc.bg}`}>
                    <Icon className={`h-5 w-5 ${cc.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pc.bg} ${pc.color}`}>{pc.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cc.bg} ${cc.color}`}>{cc.label}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{n.content}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>By {n.author}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(n.postedAt)}</span>
                        <span>·</span>
                        <span>{n.acknowledgments.length}/{employees.length} acknowledged</span>
                      </div>
                      <button
                        onClick={() => acknowledge(n.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          acked ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {acked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        {acked ? 'Acknowledged' : 'Acknowledge'}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center text-sm text-slate-500">No notices match your filters.</Card>
      )}

      {/* Create notice modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15">
                    <Megaphone className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Post New Notice</h3>
                    <p className="text-xs text-slate-500">Announce to all employees</p>
                  </div>
                </div>
                <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input value={newNotice.title} onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="Notice title..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Content *</label>
                  <textarea value={newNotice.content} onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })} placeholder="Write the notice content..." rows={5} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select value={newNotice.category} onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as NoticeCategory })} className={inputClass}>
                      {(['company', 'policy', 'event', 'system', 'hr'] as NoticeCategory[]).map((c) => (
                        <option key={c} value={c} className="capitalize">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Priority</label>
                    <select value={newNotice.priority} onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as NoticePriority })} className={inputClass}>
                      {(['info', 'important', 'urgent'] as NoticePriority[]).map((p) => (
                        <option key={p} value={p} className="capitalize">{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleCreate}
                  disabled={!newNotice.title || !newNotice.content}
                  className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-400 disabled:opacity-40"
                >
                  Post Notice
                </button>
                <button onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
