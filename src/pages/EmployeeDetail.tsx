import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Cpu,
  HardDrive,
  Battery,
  Wifi,
  Monitor,
  Camera,
  Keyboard,
  MousePointerClick,
  Clock,
  MapPin,
  Fingerprint,
  Eye,
  Smartphone,
} from 'lucide-react'
import { Card, ProgressBar, Badge, Ring } from '../components/ui'
import { HourlyActivityChart, TrendChart } from '../components/Charts'
import { getEmployee, getTasksForEmployee, getAttendanceForEmployee, formatDuration, formatTimeAgo, daysUntil } from '../lib/data'
import { statusConfig, productivityColor, productivityBar, categoryConfig, taskStatusConfig, taskPriorityConfig, taskTypeConfig, attendanceConfig, dueDateColor } from '../lib/helpers'

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const emp = id ? getEmployee(id) : undefined

  if (!emp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-slate-400">Employee not found.</p>
        <Link to="/employees" className="mt-4 text-cyan-400 hover:text-cyan-300">
          ← Back to employees
        </Link>
      </div>
    )
  }

  const sc = statusConfig(emp.status)
  const totalAppTime = emp.apps.reduce((s, a) => s + a.durationSec, 0)
  const empTasks = getTasksForEmployee(emp.id)
  const empAttendance = getAttendanceForEmployee(emp.id)
  const empAttSummary = empAttendance.filter((r) => r.status === 'present' || r.status === 'remote').length
  const attRate = Math.round((empAttSummary / empAttendance.length) * 100)

  return (
    <div className="space-y-6">
      <Link to="/employees" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to employees
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <img src={emp.avatar} alt={emp.name} className="h-20 w-20 rounded-2xl object-cover" />
            <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-slate-900 ${sc.dot}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{emp.name}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${sc.bg} ${sc.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} /> {sc.label}
              </span>
            </div>
            <p className="text-sm text-slate-400">{emp.role} · {emp.department}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Fingerprint className="h-3 w-3" /> {emp.id}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {emp.location}</span>
              <span className="flex items-center gap-1"><Monitor className="h-3 w-3" /> {emp.device}</span>
              <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> {emp.ip}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Ring
              value={emp.productivity}
              size={110}
              color={emp.productivity >= 80 ? '#10b981' : emp.productivity >= 60 ? '#f59e0b' : '#f43f5e'}
              sublabel="productivity"
            />
          </div>
        </div>
      </Card>

      {/* Shift + system metrics */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Shift</span>
          </div>
          <p className="text-lg font-bold text-white">{emp.shiftStart} – {emp.shiftEnd}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Clock in: <span className="text-emerald-400">{emp.clockIn}</span></span>
            <span>Clock out: <span className={emp.clockOut ? 'text-slate-400' : 'text-amber-400'}>{emp.clockOut ?? 'active'}</span></span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-sm font-semibold text-emerald-400">{formatDuration(emp.activeTimeSec)}</p>
              <p className="text-[10px] text-slate-500">Active</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-400">{formatDuration(emp.idleTimeSec)}</p>
              <p className="text-[10px] text-slate-500">Idle</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">{formatDuration(emp.awayTimeSec)}</p>
              <p className="text-[10px] text-slate-500">Away</p>
            </div>
          </div>
        </Card>

        {[
          { label: 'CPU Usage', value: emp.cpuUsage, icon: Cpu, color: 'bg-cyan-500' },
          { label: 'RAM Usage', value: emp.ramUsage, icon: HardDrive, color: 'bg-violet-500' },
          { label: 'Disk Usage', value: emp.diskUsage, icon: HardDrive, color: 'bg-amber-500' },
          { label: 'Battery', value: emp.battery, icon: Battery, color: 'bg-emerald-500' },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div className="mb-3 flex items-center gap-2 text-slate-400">
              <s.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{s.value}%</p>
            <div className="mt-3">
              <ProgressBar value={s.value} color={s.color} />
            </div>
          </Card>
        ))}
      </div>

      {/* Activity charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Hourly Activity</h2>
          <HourlyActivityChart data={emp.hourly} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Weekly Productivity</h2>
          <TrendChart data={emp.trends} />
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4">
            <div>
              <p className="text-xs text-slate-500">Avg Productivity</p>
              <p className={`text-lg font-bold ${productivityColor(emp.trends.reduce((s, t) => s + t.productivity, 0) / emp.trends.length)}`}>
                {Math.round(emp.trends.reduce((s, t) => s + t.productivity, 0) / emp.trends.length)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Hours</p>
              <p className="text-lg font-bold text-white">{emp.trends.reduce((s, t) => s + t.hours, 0).toFixed(1)}h</p>
            </div>
          </div>
        </Card>
      </div>

      {/* App usage + monitoring stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Application Usage</h2>
          <div className="space-y-3">
            {emp.apps
              .slice()
              .sort((a, b) => b.durationSec - a.durationSec)
              .map((a, i) => {
                const cc = categoryConfig(a.category)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-28 shrink-0">
                      <p className="text-sm font-medium text-white">{a.app}</p>
                      <span className={`text-[10px] ${cc.color}`}>{cc.label}</span>
                    </div>
                    <div className="flex-1">
                      <ProgressBar value={a.durationSec} max={totalAppTime} color={productivityBar(a.productivity)} />
                    </div>
                    <div className="w-16 text-right">
                      <p className="text-xs font-medium text-slate-300">{formatDuration(a.durationSec)}</p>
                      <p className={`text-[10px] ${productivityColor(a.productivity)}`}>{a.productivity}%</p>
                    </div>
                  </motion.div>
                )
              })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Monitoring Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Screenshots', value: emp.screenshotsTaken, icon: Camera, color: 'text-cyan-400' },
              { label: 'Keystrokes', value: emp.keystrokes.toLocaleString(), icon: Keyboard, color: 'text-violet-400' },
              { label: 'Mouse Clicks', value: emp.mouseClicks.toLocaleString(), icon: MousePointerClick, color: 'text-emerald-400' },
              { label: 'Mouse Moves', value: emp.mouseMoves.toLocaleString(), icon: MousePointerClick, color: 'text-amber-400' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-slate-800/40 p-3">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <p className="mt-2 text-lg font-bold text-white tabular-nums">{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400"><Eye className="h-3.5 w-3.5" /> Webcam Verified</span>
              <Badge variant={emp.webcamVerified ? 'success' : 'danger'}>
                {emp.webcamVerified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400"><Smartphone className="h-3.5 w-3.5" /> OS</span>
              <span className="text-slate-300">{emp.os}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400"><Clock className="h-3.5 w-3.5" /> Last Active</span>
              <span className="text-slate-300">{formatTimeAgo(emp.lastActivity)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Assigned tasks */}
      {empTasks.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-white">Assigned Tasks ({empTasks.length})</h2>
            <Link to="/tasks" className="text-xs text-cyan-400 hover:text-cyan-300">View all tasks</Link>
          </div>
          <div className="divide-y divide-slate-800">
            {empTasks.map((task) => {
              const tsc = taskStatusConfig(task.status)
              const tpc = taskPriorityConfig(task.priority)
              const ttp = taskTypeConfig(task.type)
              const tdd = daysUntil(task.dueDate)
              return (
                <div key={task.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ttp.bg} ${ttp.color}`}>{ttp.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tpc.bg} ${tpc.color}`}>{tpc.label}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <Link to={`/projects/${task.projectId}`} className="text-xs text-slate-500 hover:text-cyan-400">{task.projectName}</Link>
                  </div>
                  <span className={`hidden text-xs sm:block ${dueDateColor(tdd)}`}>
                    {tdd < 0 ? `${Math.abs(tdd)}d overdue` : `${tdd}d left`}
                  </span>
                  <div className="hidden w-16 sm:block">
                    <ProgressBar value={task.progress} color={task.status === 'done' ? 'bg-emerald-500' : task.status === 'blocked' ? 'bg-rose-500' : 'bg-cyan-500'} className="h-1.5" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${tsc.bg} ${tsc.color}`}>{tsc.label}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Attendance mini-calendar */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Weekly Attendance</h2>
          <Badge variant={attRate >= 85 ? 'success' : attRate >= 70 ? 'warning' : 'danger'}>{attRate}% rate</Badge>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {empAttendance.map((rec) => {
            const ac = attendanceConfig(rec.status)
            const d = new Date(rec.date)
            return (
              <div key={rec.id} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-slate-500">{d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</span>
                <div
                  className={`flex h-12 w-full flex-col items-center justify-center rounded-lg ${ac.bg} ${ac.color}`}
                  title={`${ac.label}${rec.clockIn ? ` · ${rec.clockIn}` : ''}`}
                >
                  <span className="text-xs font-bold">{d.getDate()}</span>
                </div>
                <span className="text-[9px] text-slate-600">{rec.clockIn ?? '—'}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
          {(['present', 'remote', 'late', 'absent', 'leave'] as const).map((s) => {
            const ac = attendanceConfig(s)
            return (
              <span key={s} className="flex items-center gap-1">
                <span className={`h-2.5 w-2.5 rounded ${ac.dot}`} /> {ac.label}
              </span>
            )
          })}
        </div>
      </Card>

      {/* Activity timeline */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-white">Activity Timeline</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {emp.activities.map((a, i) => {
            const cc = categoryConfig(a.category)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4"
              >
                <div className="shrink-0 text-xs text-slate-500 tabular-nums">
                  {new Date(a.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">{a.app} <span className="text-slate-500">— {a.windowTitle}</span></p>
                </div>
                <Badge variant={a.category === 'productive' ? 'success' : a.category === 'distracting' ? 'danger' : 'neutral'}>
                  {cc.label}
                </Badge>
                <span className="hidden text-xs text-slate-400 sm:block">{formatDuration(a.durationSec)}</span>
                {a.screenshot && <Camera className="h-3.5 w-3.5 text-cyan-400" />}
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
