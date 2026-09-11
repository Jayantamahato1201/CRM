import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, Clock, TrendingUp, AlertCircle, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, ProgressBar, Badge, StatCard } from '../components/ui'
import { attendanceRecords, attendanceSummaries, employees } from '../lib/data'
import { attendanceConfig } from '../lib/helpers'
import type { AttendanceStatus } from '../lib/types'

const dateLabels = (() => {
  const arr: { date: string; day: string; weekday: string }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    arr.push({
      date: d.toISOString().slice(0, 10),
      day: String(d.getDate()),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    })
  }
  return arr
})()

export function Attendance() {
  const [view, setView] = useState<'today' | 'week'>('today')
  const [filterStatus, setFilterStatus] = useState<'all' | AttendanceStatus>('all')

  const todayDate = dateLabels[dateLabels.length - 1].date

  const todayRecords = useMemo(() => {
    return attendanceRecords
      .filter((r) => r.date === todayDate)
      .filter((r) => filterStatus === 'all' || r.status === filterStatus)
  }, [todayDate, filterStatus])

  const stats = useMemo(() => {
    const todayRecs = attendanceRecords.filter((r) => r.date === todayDate)
    const present = todayRecs.filter((r) => r.status === 'present' || r.status === 'remote').length
    const late = todayRecs.filter((r) => r.status === 'late').length
    const absent = todayRecs.filter((r) => r.status === 'absent').length
    const leave = todayRecs.filter((r) => r.status === 'leave').length
    const rate = Math.round(((present + late) / todayRecs.length) * 100)
    return { present, late, absent, leave, rate, total: todayRecs.length }
  }, [todayDate])

  const weekMatrix = useMemo(() => {
    return employees.map((emp) => {
      const weekRecs = dateLabels.map((dl) => {
        const rec = attendanceRecords.find((r) => r.employeeId === emp.id && r.date === dl.date)
        return rec ?? null
      })
      return { emp, weekRecs }
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Attendance</h1>
        <p className="text-sm text-slate-400">Track employee attendance, clock-in/out times, and leave status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Present Today" value={stats.present} sub={`of ${stats.total} employees`} icon={<CalendarCheck className="h-5 w-5" />} accent="text-emerald-400" />
        <StatCard label="Late Arrivals" value={stats.late} sub="today" icon={<Clock className="h-5 w-5" />} accent="text-amber-400" />
        <StatCard label="Absent / Leave" value={stats.absent + stats.leave} sub="today" icon={<AlertCircle className="h-5 w-5" />} accent="text-rose-400" />
        <StatCard label="Attendance Rate" value={`${stats.rate}%`} sub="today" icon={<TrendingUp className="h-5 w-5" />} accent="text-cyan-400" trend={2} />
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
          <button
            onClick={() => setView('today')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${view === 'today' ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            Today
          </button>
          <button
            onClick={() => setView('week')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${view === 'week' ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            This Week
          </button>
        </div>
        {view === 'today' && (
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterStatus === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            {(['present', 'remote', 'late', 'absent', 'leave', 'half-day'] as AttendanceStatus[]).map((s) => {
              const cfg = attendanceConfig(s)
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filterStatus === s ? `${cfg.bg} ${cfg.color}` : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                >
                  {cfg.label}
                </button>
              )
            })}
          </div>
        )}
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      {view === 'today' ? (
        /* Today's attendance table */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Shift</th>
                  <th className="px-4 py-3 font-medium">Clock In</th>
                  <th className="px-4 py-3 font-medium">Clock Out</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Worked</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Overtime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {todayRecords.map((r) => {
                  const cfg = attendanceConfig(r.status)
                  return (
                    <tr key={r.id} className="transition hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <Link to={`/employees/${r.employeeId}`} className="flex items-center gap-3">
                          <img src={r.avatar} alt={r.employeeName} className="h-8 w-8 rounded-full object-cover" />
                          <span className="font-medium text-white hover:text-cyan-400">{r.employeeName}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3"><Badge variant="neutral">{r.department}</Badge></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">{r.shiftStart}–{r.shiftEnd}</td>
                      <td className="px-4 py-3"><span className={r.status === 'late' ? 'text-amber-400' : 'text-slate-300'}>{r.clockIn ?? '—'}</span></td>
                      <td className="px-4 py-3 text-slate-300">{r.clockOut ?? '—'}</td>
                      <td className="hidden px-4 py-3 text-slate-300 lg:table-cell">{r.workedHours > 0 ? `${r.workedHours}h` : '—'}</td>
                      <td className="hidden px-4 py-3 lg:table-cell">{r.overtimeHours > 0 ? <span className="text-emerald-400">+{r.overtimeHours}h</span> : <span className="text-slate-600">—</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {todayRecords.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-500">No records match this filter.</div>
          )}
        </Card>
      ) : (
        /* Week view — calendar matrix */
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-white">Weekly Attendance Matrix</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ChevronLeft className="h-4 w-4" />
              <span>This Week</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500">
                  <th className="sticky left-0 bg-slate-900 px-4 py-3 text-left font-medium">Employee</th>
                  {dateLabels.map((dl) => (
                    <th key={dl.date} className="px-2 py-3 text-center font-medium">
                      <div className="flex flex-col items-center">
                        <span>{dl.weekday}</span>
                        <span className="text-slate-600">{dl.day}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-medium">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {weekMatrix.map(({ emp, weekRecs }) => {
                  const summary = attendanceSummaries.find((s) => s.employeeId === emp.id)!
                  return (
                    <tr key={emp.id} className="transition hover:bg-slate-800/40">
                      <td className="sticky left-0 bg-slate-900 px-4 py-2.5">
                        <Link to={`/employees/${emp.id}`} className="flex items-center gap-2">
                          <img src={emp.avatar} alt={emp.name} className="h-7 w-7 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-white">{emp.name}</p>
                            <p className="truncate text-[10px] text-slate-500">{emp.department}</p>
                          </div>
                        </Link>
                      </td>
                      {weekRecs.map((rec, i) => {
                        if (!rec) return <td key={i} className="px-2 py-2.5 text-center"><span className="text-slate-700">—</span></td>
                        const cfg = attendanceConfig(rec.status)
                        return (
                          <td key={i} className="px-2 py-2.5 text-center">
                            <div className={`mx-auto inline-flex h-7 w-7 items-center justify-center rounded-lg ${cfg.bg} ${cfg.color}`} title={`${cfg.label}${rec.clockIn ? ` · ${rec.clockIn}` : ''}`}>
                              <span className="text-[10px] font-bold">{cfg.label.charAt(0)}</span>
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs font-semibold ${summary.attendanceRate >= 85 ? 'text-emerald-400' : summary.attendanceRate >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {summary.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 p-4 text-xs text-slate-500">
            {(['present', 'remote', 'late', 'half-day', 'absent', 'leave'] as AttendanceStatus[]).map((s) => {
              const cfg = attendanceConfig(s)
              return (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded ${cfg.bg} ${cfg.color} text-[9px] font-bold`}>{cfg.label.charAt(0)}</span>
                  {cfg.label}
                </span>
              )
            })}
          </div>
        </Card>
      )

      /* Weekly summary cards */
      }

      {/* Weekly summary */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-white">Weekly Attendance Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {attendanceSummaries.slice(0, 4).map((s, i) => (
            <motion.div key={s.employeeId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <img src={s.avatar} alt={s.employeeName} className="h-10 w-10 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{s.employeeName}</p>
                    <p className="truncate text-xs text-slate-500">{s.department}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Attendance Rate</span>
                    <span className={`font-semibold ${s.attendanceRate >= 85 ? 'text-emerald-400' : s.attendanceRate >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>{s.attendanceRate}%</span>
                  </div>
                  <ProgressBar value={s.attendanceRate} color={s.attendanceRate >= 85 ? 'bg-emerald-500' : s.attendanceRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'} />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[10px]">
                  <div><p className="font-semibold text-emerald-400">{s.present + s.remote}</p><p className="text-slate-500">Present</p></div>
                  <div><p className="font-semibold text-amber-400">{s.late}</p><p className="text-slate-500">Late</p></div>
                  <div><p className="font-semibold text-rose-400">{s.absent}</p><p className="text-slate-500">Absent</p></div>
                  <div><p className="font-semibold text-violet-400">{s.leave}</p><p className="text-slate-500">Leave</p></div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2 text-xs">
                  <span className="text-slate-500">Total: <span className="text-slate-300">{s.totalHours}h</span></span>
                  {s.overtime > 0 && <span className="text-emerald-400">+{s.overtime}h OT</span>}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
