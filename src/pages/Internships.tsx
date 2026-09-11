import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Plus,
  Search,
  MapPin,
  Calendar,
  User,
  Award,
  Briefcase,
  TrendingUp,
  Clock,
  X,
  Mail,
  Phone,
} from 'lucide-react'
import { Card, ProgressBar, Badge, StatCard, Ring } from '../components/ui'
import { interns, employees, formatCurrency, daysUntil } from '../lib/data'
import { internStatusConfig } from '../lib/helpers'
import type { Intern, InternStatus } from '../lib/types'

const departments = ['All', 'Engineering', 'Finance', 'Design', 'Sales', 'Product', 'Marketing']
const statuses: ('all' | InternStatus)[] = ['all', 'active', 'on-hold', 'completed', 'offer-extended']

const avatarPool = ['/avatars/emp1.jpg', '/avatars/emp2.jpg', '/avatars/emp3.jpg', '/avatars/emp4.jpg', '/avatars/emp5.jpg', '/avatars/emp6.jpg']

export function Internships() {
  const [internList, setInternList] = useState<Intern[]>(interns)
  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'all' | InternStatus>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '', email: '', university: '', degree: '', graduationYear: '2025',
    department: 'Engineering', position: '', mentorId: '', startDate: new Date().toISOString().slice(0, 10),
    duration: '12', stipend: '4500', location: 'Remote', phone: '', skills: '', avatar: avatarPool[0],
  })

  const filtered = useMemo(() => {
    return internList.filter((i) => {
      const matchQuery =
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.university.toLowerCase().includes(query.toLowerCase()) ||
        i.position.toLowerCase().includes(query.toLowerCase())
      const matchDept = deptFilter === 'All' || i.department === deptFilter
      const matchStatus = statusFilter === 'all' || i.status === statusFilter
      return matchQuery && matchDept && matchStatus
    })
  }, [internList, query, deptFilter, statusFilter])

  const stats = useMemo(() => {
    const active = internList.filter((i) => i.status === 'active').length
    const completed = internList.filter((i) => i.status === 'completed' || i.status === 'offer-extended').length
    const offers = internList.filter((i) => i.status === 'offer-extended').length
    const avgProgress = Math.round(internList.reduce((s, i) => s + i.progress, 0) / internList.length)
    return { active, completed, offers, avgProgress, total: internList.length }
  }, [internList])

  function handleCreate() {
    if (!createForm.name || !createForm.email || !createForm.position) return
    const mentor = employees.find((e) => e.id === createForm.mentorId)
    const newId = `INT-${String(internList.length + 1).padStart(3, '0')}`
    const startDate = createForm.startDate
    const endDate = new Date(new Date(startDate).getTime() + Number(createForm.duration) * 7 * 86400000).toISOString().slice(0, 10)
    const totalHours = Number(createForm.duration) * 40
    const newIntern: Intern = {
      id: newId,
      name: createForm.name,
      email: createForm.email,
      avatar: createForm.avatar,
      university: createForm.university,
      degree: createForm.degree,
      graduationYear: Number(createForm.graduationYear),
      department: createForm.department,
      position: createForm.position,
      mentorId: createForm.mentorId || 'EMP-001',
      mentorName: mentor?.name || 'Sarah Chen',
      mentorAvatar: mentor?.avatar || '/avatars/emp1.jpg',
      status: 'active',
      startDate,
      endDate,
      duration: Number(createForm.duration),
      progress: 0,
      hoursCompleted: 0,
      totalHours,
      stipend: Number(createForm.stipend),
      location: createForm.location,
      phone: createForm.phone,
      skills: createForm.skills ? createForm.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      tasksCompleted: 0,
      tasksAssigned: 0,
      meetingsAttended: 0,
      evaluations: [],
      goals: [],
      weeklyHours: [],
      feedback: [],
    }
    setInternList((prev) => [...prev, newIntern])
    setShowCreate(false)
    setCreateForm({
      name: '', email: '', university: '', degree: '', graduationYear: '2025',
      department: 'Engineering', position: '', mentorId: '', startDate: new Date().toISOString().slice(0, 10),
      duration: '12', stipend: '4500', location: 'Remote', phone: '', skills: '', avatar: avatarPool[0],
    })
  }

  const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none'
  const labelClass = 'mb-1 block text-xs font-medium text-slate-400'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Internships</h1>
          <p className="text-sm text-slate-400">Manage interns, mentors, progress tracking, and evaluations</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" /> Add Intern
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Interns" value={stats.total} icon={<GraduationCap className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="Active" value={stats.active} icon={<User className="h-5 w-5" />} accent="text-emerald-400" />
        <StatCard label="Completed" value={stats.completed} icon={<Award className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="Offers Extended" value={stats.offers} icon={<Briefcase className="h-5 w-5" />} accent="text-violet-400" />
        <StatCard label="Avg Progress" value={`${stats.avgProgress}%`} icon={<TrendingUp className="h-5 w-5" />} accent="text-amber-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search interns..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="shrink-0 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none"
          >
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex items-center gap-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${statusFilter === s ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
              >
                {s === 'all' ? 'All' : s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Intern cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((intern, i) => {
          const sc = internStatusConfig(intern.status)
          const dd = daysUntil(intern.endDate)
          return (
            <motion.div key={intern.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/interns/${intern.id}`}>
                <Card className="p-5 transition hover:border-slate-700 hover:bg-slate-800/40">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img src={intern.avatar} alt={intern.name} className="h-14 w-14 rounded-2xl object-cover" />
                      <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${sc.dot}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-white">{intern.name}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-500">{intern.position} · {intern.department}</p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {intern.university}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {intern.location}</span>
                      </div>
                    </div>
                    <Ring value={intern.progress} size={56} stroke={6} color={intern.progress >= 80 ? '#10b981' : intern.progress >= 50 ? '#f59e0b' : '#22d3ee'} />
                  </div>

                  {/* Mentor */}
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-800/40 p-2.5">
                    <img src={intern.mentorAvatar} alt={intern.mentorName} className="h-7 w-7 rounded-full object-cover" />
                    <div>
                      <p className="text-xs text-slate-500">Mentor</p>
                      <p className="text-xs font-medium text-slate-300">{intern.mentorName}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3 text-right text-[10px] text-slate-500">
                      <div>
                        <p className="text-slate-300">{intern.hoursCompleted}h / {intern.totalHours}h</p>
                        <p>hours logged</p>
                      </div>
                      <div>
                        <p className={dd < 0 ? 'text-rose-400' : dd <= 14 ? 'text-amber-400' : 'text-slate-300'}>
                          {dd < 0 ? 'Completed' : `${dd}d left`}
                        </p>
                        <p>duration</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Internship Progress</span>
                      <span className="font-semibold text-white">{intern.progress}%</span>
                    </div>
                    <ProgressBar value={intern.progress} color={intern.progress >= 80 ? 'bg-emerald-500' : intern.progress >= 50 ? 'bg-amber-500' : 'bg-cyan-500'} />
                  </div>

                  {/* Stats row */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-800/40 p-2">
                      <p className="text-sm font-bold text-white">{intern.tasksCompleted}/{intern.tasksAssigned}</p>
                      <p className="text-[9px] text-slate-500">Tasks</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/40 p-2">
                      <p className="text-sm font-bold text-white">{intern.meetingsAttended}</p>
                      <p className="text-[9px] text-slate-500">Meetings</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/40 p-2">
                      <p className="text-sm font-bold text-white">{intern.evaluations.length}</p>
                      <p className="text-[9px] text-slate-500">Evaluations</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {intern.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {intern.skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{skill}</span>
                      ))}
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center text-sm text-slate-500">No interns match your filters.</Card>
      )}

      {/* Create intern modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15">
                  <GraduationCap className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Add New Intern</h3>
                  <p className="text-xs text-slate-500">Register a new internship</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Avatar */}
              <div>
                <label className={labelClass}>Profile Photo</label>
                <div className="flex items-center gap-3">
                  <img src={createForm.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <div className="flex flex-wrap gap-2">
                    {avatarPool.map((av) => (
                      <button key={av} onClick={() => setCreateForm({ ...createForm, avatar: av })}
                        className={`h-8 w-8 overflow-hidden rounded-full border-2 transition ${createForm.avatar === av ? 'border-cyan-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={av} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="e.g. John Smith" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Email *</label>
                  <input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="john.smith@acme.io" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>University</label>
                  <input value={createForm.university} onChange={(e) => setCreateForm({ ...createForm, university: e.target.value })} placeholder="e.g. Stanford University" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Degree</label>
                  <input value={createForm.degree} onChange={(e) => setCreateForm({ ...createForm, degree: e.target.value })} placeholder="B.S. Computer Science" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Graduation Year</label>
                  <input value={createForm.graduationYear} onChange={(e) => setCreateForm({ ...createForm, graduationYear: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Position *</label>
                  <input value={createForm.position} onChange={(e) => setCreateForm({ ...createForm, position: e.target.value })} placeholder="Software Engineering Intern" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <select value={createForm.department} onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })} className={inputClass}>
                    {departments.filter((d) => d !== 'All').map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Mentor</label>
                  <select value={createForm.mentorId} onChange={(e) => setCreateForm({ ...createForm, mentorId: e.target.value })} className={inputClass}>
                    <option value="">Select mentor...</option>
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} — {emp.role}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="date" value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Duration (weeks)</label>
                  <input type="number" value={createForm.duration} onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Stipend ($/mo)</label>
                  <input type="number" value={createForm.stipend} onChange={(e) => setCreateForm({ ...createForm, stipend: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+1 (555) 000-0000" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Skills (comma-separated)</label>
                  <input value={createForm.skills} onChange={(e) => setCreateForm({ ...createForm, skills: e.target.value })} placeholder="React, TypeScript, Python" className={inputClass} />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={!createForm.name || !createForm.email || !createForm.position}
                className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-400 disabled:opacity-40"
              >
                Create Intern
              </button>
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
