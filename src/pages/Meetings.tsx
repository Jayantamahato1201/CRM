import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video,
  VideoOff,
  Calendar,
  Clock,
  Users,
  Plus,
  X,
  Link2,
  MapPin,
  Play,
  CheckCircle2,
  Circle,
  ChevronRight,
} from 'lucide-react'
import { Card, Badge, StatCard } from '../components/ui'
import { meetings, employees } from '../lib/data'
import { meetingStatusConfig, platformConfig } from '../lib/helpers'
import type { Meeting, MeetingStatus } from '../lib/types'

export function Meetings() {
  const [meetingList, setMeetingList] = useState<Meeting[]>(meetings)
  const [filter, setFilter] = useState<'all' | MeetingStatus>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '11:00',
    platform: 'Zoom' as Meeting['platform'],
    location: 'Virtual',
    agenda: '',
  })

  const filtered = useMemo(() => {
    return meetingList
      .filter((m) => filter === 'all' || m.status === filter)
      .sort((a, b) => {
        const aTime = new Date(`${a.date}T${a.startTime}`).getTime()
        const bTime = new Date(`${b.date}T${b.startTime}`).getTime()
        return aTime - bTime
      })
  }, [meetingList, filter])

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayMeetings = meetingList.filter((m) => m.date === today)
    const live = meetingList.filter((m) => m.status === 'live').length
    const scheduled = meetingList.filter((m) => m.status === 'scheduled').length
    const completed = meetingList.filter((m) => m.status === 'completed').length
    return { today: todayMeetings.length, live, scheduled, completed }
  }, [meetingList])

  const upcoming = filtered.filter((m) => m.status === 'scheduled' || m.status === 'live')
  const past = filtered.filter((m) => m.status === 'completed')

  function handleCreate() {
    if (!newMeeting.title) return
    const meeting: Meeting = {
      id: `MTG-${String(meetingList.length + 1).padStart(3, '0')}`,
      title: newMeeting.title,
      description: newMeeting.description || 'No description provided.',
      organizer: 'Admin',
      organizerAvatar: '',
      participantIds: ['EMP-001', 'EMP-005'],
      participantNames: ['Sarah Chen', 'Elena Rodriguez'],
      participantAvatars: ['/avatars/emp1.jpg', '/avatars/emp5.jpg'],
      date: newMeeting.date,
      startTime: newMeeting.startTime,
      endTime: newMeeting.endTime,
      status: 'scheduled',
      platform: newMeeting.platform,
      location: newMeeting.location,
      meetingLink: `https://${newMeeting.platform.toLowerCase().replace(' ', '-')}.com/meeting/${Date.now()}`,
      agenda: newMeeting.agenda ? newMeeting.agenda.split('\n').filter(Boolean) : ['To be defined'],
      recordingAvailable: false,
    }
    setMeetingList((prev) => [...prev, meeting])
    setShowCreate(false)
    setNewMeeting({ title: '', description: '', date: new Date().toISOString().slice(0, 10), startTime: '10:00', endTime: '11:00', platform: 'Zoom', location: 'Virtual', agenda: '' })
  }

  const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none'
  const labelClass = 'mb-1 block text-xs font-medium text-slate-400'

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    if (diff === -1) return 'Yesterday'
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Meetings</h1>
          <p className="text-sm text-slate-400">Schedule and track team meetings and video calls</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" /> Schedule Meeting
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today" value={stats.today} sub="meetings scheduled" icon={<Calendar className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="Live Now" value={stats.live} sub="in progress" icon={<Video className="h-5 w-5" />} accent="text-rose-400" />
        <StatCard label="Upcoming" value={stats.scheduled} sub="scheduled" icon={<Clock className="h-5 w-5" />} accent="text-amber-400" />
        <StatCard label="Completed" value={stats.completed} sub="this period" icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-400" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {(['all', 'scheduled', 'live', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            {f === 'all' ? 'All Meetings' : f}
          </button>
        ))}
      </div>

      {/* Upcoming meetings */}
      {upcoming.length > 0 && (filter === 'all' || filter === 'scheduled' || filter === 'live') && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Upcoming & Live</h2>
          <div className="space-y-3">
            {upcoming.map((m, i) => {
              const sc = meetingStatusConfig(m.status)
              const pc = platformConfig(m.platform)
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`p-5 transition hover:border-slate-700 ${m.status === 'live' ? 'border-rose-500/30' : ''}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      {/* Date block */}
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-slate-800">
                          <span className="text-[10px] uppercase text-slate-500">{new Date(m.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-xl font-bold text-white">{new Date(m.date).getDate()}</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">{formatDate(m.date)}</p>
                          <p className="text-sm font-medium text-slate-300">{m.startTime} – {m.endTime}</p>
                        </div>
                      </div>

                      {/* Meeting info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">{m.title}</h3>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.color}`}>
                            {m.status === 'live' && <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" /></span>}
                            {sc.label}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pc.bg} ${pc.color}`}>{m.platform}</span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{m.description}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {m.participantAvatars.slice(0, 4).map((av, i) => (
                              <img key={i} src={av} alt="" className="h-6 w-6 rounded-full border-2 border-slate-900 object-cover" />
                            ))}
                            {m.participantAvatars.length > 4 && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-700 text-[9px] text-slate-300">+{m.participantAvatars.length - 4}</span>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-[10px] text-slate-500"><Users className="h-3 w-3" /> {m.participantNames.length}</span>
                          {m.projectName && <span className="text-[10px] text-slate-600">· {m.projectName}</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2">
                        {m.status === 'live' ? (
                          <button className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400">
                            <Video className="h-4 w-4" /> Join Now
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedMeeting(m)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                          >
                            <Link2 className="h-4 w-4" /> Details
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past meetings */}
      {past.length > 0 && (filter === 'all' || filter === 'completed') && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Past Meetings</h2>
          <Card className="overflow-hidden">
            <div className="divide-y divide-slate-800">
              {past.map((m) => {
                const pc = platformConfig(m.platform)
                return (
                  <div key={m.id} className="flex items-center gap-4 p-4 transition hover:bg-slate-800/40">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{m.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(m.date)} · {m.startTime}–{m.endTime} · {m.participantNames.length} participants</p>
                    </div>
                    <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline ${pc.bg} ${pc.color}`}>{m.platform}</span>
                    {m.recordingAvailable && (
                      <button className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-cyan-400 hover:bg-slate-700">
                        <Play className="h-3 w-3" /> Recording
                      </button>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Meeting detail modal */}
      <AnimatePresence>
        {selectedMeeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMeeting(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${meetingStatusConfig(selectedMeeting.status).bg} ${meetingStatusConfig(selectedMeeting.status).color}`}>
                      {meetingStatusConfig(selectedMeeting.status).label}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${platformConfig(selectedMeeting.platform).bg} ${platformConfig(selectedMeeting.platform).color}`}>{selectedMeeting.platform}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedMeeting.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{selectedMeeting.description}</p>
                </div>
                <button onClick={() => setSelectedMeeting(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="flex items-center gap-1.5 text-slate-500"><Calendar className="h-3.5 w-3.5" /> Date</p>
                  <p className="mt-1 font-medium text-slate-300">{formatDate(selectedMeeting.date)}, {new Date(selectedMeeting.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="flex items-center gap-1.5 text-slate-500"><Clock className="h-3.5 w-3.5" /> Time</p>
                  <p className="mt-1 font-medium text-slate-300">{selectedMeeting.startTime} – {selectedMeeting.endTime}</p>
                </div>
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="flex items-center gap-1.5 text-slate-500"><MapPin className="h-3.5 w-3.5" /> Location</p>
                  <p className="mt-1 font-medium text-slate-300">{selectedMeeting.location}</p>
                </div>
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="flex items-center gap-1.5 text-slate-500"><Users className="h-3.5 w-3.5" /> Organizer</p>
                  <p className="mt-1 font-medium text-slate-300">{selectedMeeting.organizer}</p>
                </div>
              </div>

              {/* Agenda */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-400">Agenda</p>
                <div className="space-y-1.5">
                  {selectedMeeting.agenda.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <Circle className="h-3 w-3 shrink-0 text-slate-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Participants */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-400">Participants ({selectedMeeting.participantNames.length})</p>
                <div className="space-y-2">
                  {selectedMeeting.participantNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <img src={selectedMeeting.participantAvatars[i]} alt={name} className="h-7 w-7 rounded-full object-cover" />
                      <span className="text-sm text-slate-300">{name}</span>
                      {name === selectedMeeting.organizer && <Badge variant="info">Organizer</Badge>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Join button */}
              {selectedMeeting.status !== 'completed' && selectedMeeting.meetingLink && (
                <a
                  href={selectedMeeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-400"
                >
                  <Video className="h-4 w-4" /> Join Meeting
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create meeting modal */}
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
                    <Video className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Schedule Meeting</h3>
                    <p className="text-xs text-slate-500">Create a new meeting invite</p>
                  </div>
                </div>
                <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} placeholder="Meeting title..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea value={newMeeting.description} onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} placeholder="Meeting description..." rows={3} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Date</label>
                    <input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Platform</label>
                    <select value={newMeeting.platform} onChange={(e) => setNewMeeting({ ...newMeeting, platform: e.target.value as Meeting['platform'] })} className={inputClass}>
                      {(['Zoom', 'Google Meet', 'Teams', 'In-Person'] as Meeting['platform'][]).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Start Time</label>
                    <input type="time" value={newMeeting.startTime} onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End Time</label>
                    <input type="time" value={newMeeting.endTime} onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input value={newMeeting.location} onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })} placeholder="Virtual or address..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Agenda (one item per line)</label>
                  <textarea value={newMeeting.agenda} onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })} placeholder={'Item 1\nItem 2\nItem 3'} rows={4} className={inputClass} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleCreate}
                  disabled={!newMeeting.title}
                  className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-400 disabled:opacity-40"
                >
                  Schedule Meeting
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
