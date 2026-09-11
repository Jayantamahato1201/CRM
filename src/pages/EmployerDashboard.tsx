import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clock,
  Calendar,
  ListChecks,
  Video,
  Megaphone,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Activity as ActivityIcon,
} from 'lucide-react'
import { Card, ProgressBar, Badge, StatCard, Ring } from '../components/ui'
import { TrendChart } from '../components/Charts'
import { useAuth } from '../lib/auth'
import {
  getEmployee,
  getTasksForEmployee,
  getAttendanceForEmployee,
  getMeetingsForEmployee,
  notices,
  chatConversations,
  formatDuration,
  formatTimeAgo,
  daysUntil,
} from '../lib/data'
import {
  statusConfig,
  taskStatusConfig,
  taskPriorityConfig,
  attendanceConfig,
  noticePriorityConfig,
  meetingStatusConfig,
  dueDateColor,
  productivityColor,
} from '../lib/helpers'

export function EmployerDashboard() {
  const { user } = useAuth()
  const emp = user?.employeeId ? getEmployee(user.employeeId) : undefined

  const myTasks = useMemo(() => (user?.employeeId ? getTasksForEmployee(user.employeeId) : []), [user])
  const myAttendance = useMemo(() => (user?.employeeId ? getAttendanceForEmployee(user.employeeId) : []), [user])
  const myMeetings = useMemo(() => (user?.employeeId ? getMeetingsForEmployee(user.employeeId) : []), [user])
  const unreadChats = chatConversations.reduce((s, c) => s + c.unreadCount, 0)
  const unreadNotices = notices.filter((n) => !n.acknowledgments.includes(user?.id ?? '')).length

  if (!emp) {
    return <div className="p-8 text-center text-slate-400">Employee data not found.</div>
  }

  const sc = statusConfig(emp.status)
  const todayAttendance = myAttendance[myAttendance.length - 1]
  const pendingTasks = myTasks.filter((t) => t.status !== 'done')
  const completedTasks = myTasks.filter((t) => t.status === 'done')
  const upcomingMeetings = myMeetings.filter((m) => m.status === 'scheduled' || m.status === 'live')
  const attRate = Math.round(
    (myAttendance.filter((r) => r.status === 'present' || r.status === 'remote').length / myAttendance.length) * 100
  )

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={emp.avatar} alt={emp.name} className="h-16 w-16 rounded-2xl object-cover" />
            <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-slate-900 ${sc.dot}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {emp.name.split(' ')[0]}!</h1>
            <p className="text-sm text-slate-400">{emp.role} · {emp.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Ring value={emp.productivity} size={80} stroke={7} color={emp.productivity >= 80 ? '#10b981' : emp.productivity >= 60 ? '#f59e0b' : '#f43f5e'} sublabel="productivity" />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's Status" value={sc.label} sub={`Clocked in ${emp.clockIn ?? '—'}`} icon={<Clock className="h-5 w-5" />} accent={`text-${sc.color.replace('text-', '')}`} />
        <StatCard label="Active Time" value={formatDuration(emp.activeTimeSec)} sub="today" icon={<ActivityIcon className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="My Tasks" value={`${pendingTasks.length} active`} sub={`${completedTasks.length} completed`} icon={<ListChecks className="h-5 w-5" />} accent="text-violet-400" />
        <StatCard label="Attendance" value={`${attRate}%`} sub="this week" icon={<Calendar className="h-5 w-5" />} accent="text-emerald-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* My tasks */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-white">My Tasks</h2>
            <Link to="/tasks" className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {myTasks.slice(0, 5).map((task) => {
              const tsc = taskStatusConfig(task.status)
              const tpc = taskPriorityConfig(task.priority)
              const dd = daysUntil(task.dueDate)
              return (
                <div key={task.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{task.title}</p>
                    <p className="truncate text-xs text-slate-500">{task.projectName}</p>
                  </div>
                  <span className="hidden text-xs sm:block">
                    <ProgressBar value={task.progress} color={task.status === 'done' ? 'bg-emerald-500' : 'bg-cyan-500'} className="h-1.5 w-16" />
                  </span>
                  <span className={`hidden text-xs md:block ${dueDateColor(dd)}`}>
                    {dd < 0 ? `${Math.abs(dd)}d overdue` : `${dd}d left`}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tpc.bg} ${tpc.color}`}>{tpc.label}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${tsc.bg} ${tsc.color}`}>{tsc.label}</span>
                </div>
              )
            })}
            {myTasks.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">No tasks assigned to you.</div>
            )}
          </div>
        </Card>

        {/* Productivity trend */}
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">My Productivity</h2>
          <TrendChart data={emp.trends} height={140} />
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming meetings */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-white">Upcoming Meetings</h2>
            <Link to="/meetings" className="text-xs text-cyan-400 hover:text-cyan-300">View all</Link>
          </div>
          <div className="divide-y divide-slate-800">
            {upcomingMeetings.slice(0, 4).map((m) => {
              const msc = meetingStatusConfig(m.status)
              return (
                <div key={m.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${msc.dot}`} />
                    <p className="flex-1 truncate text-sm font-medium text-white">{m.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{m.startTime}–{m.endTime} · {m.platform}</p>
                </div>
              )
            })}
            {upcomingMeetings.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">No upcoming meetings.</div>
            )}
          </div>
        </Card>

        {/* Recent notices */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-white">Notices</h2>
            <Link to="/notices" className="text-xs text-cyan-400 hover:text-cyan-300">View all</Link>
          </div>
          <div className="divide-y divide-slate-800">
            {notices.slice(0, 4).map((n) => {
              const pc = noticePriorityConfig(n.priority)
              return (
                <div key={n.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className={`h-3.5 w-3.5 ${pc.color}`} />
                    <p className="flex-1 truncate text-sm font-medium text-white">{n.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatTimeAgo(n.postedAt)}</p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Quick links + attendance */}
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/chat" className="flex flex-col items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition hover:border-slate-700 hover:bg-slate-800/60">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              <span className="text-xs text-slate-300">Chat</span>
              {unreadChats > 0 && <span className="rounded-full bg-cyan-500 px-1.5 text-[9px] text-white">{unreadChats}</span>}
            </Link>
            <Link to="/notices" className="flex flex-col items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition hover:border-slate-700 hover:bg-slate-800/60">
              <Megaphone className="h-5 w-5 text-amber-400" />
              <span className="text-xs text-slate-300">Notices</span>
              {unreadNotices > 0 && <span className="rounded-full bg-amber-500 px-1.5 text-[9px] text-white">{unreadNotices}</span>}
            </Link>
            <Link to="/meetings" className="flex flex-col items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition hover:border-slate-700 hover:bg-slate-800/60">
              <Video className="h-5 w-5 text-violet-400" />
              <span className="text-xs text-slate-300">Meetings</span>
            </Link>
            <Link to="/attendance" className="flex flex-col items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition hover:border-slate-700 hover:bg-slate-800/60">
              <Calendar className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-slate-300">Attendance</span>
            </Link>
          </div>

          {/* Today attendance */}
          {todayAttendance && (
            <div className="mt-4 border-t border-slate-800 pt-4">
              <p className="mb-2 text-xs font-medium text-slate-400">Today's Attendance</p>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${attendanceConfig(todayAttendance.status).bg} ${attendanceConfig(todayAttendance.status).color}`}>
                  {attendanceConfig(todayAttendance.status).label}
                </span>
                <div className="text-right text-xs text-slate-500">
                  <p>In: <span className="text-slate-300">{todayAttendance.clockIn ?? '—'}</span></p>
                  <p>Worked: <span className="text-slate-300">{todayAttendance.workedHours}h</span></p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
