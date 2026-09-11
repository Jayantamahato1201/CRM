import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  Cpu,
  HardDrive,
  Battery,
  Eye,
  Camera,
  Keyboard,
  MousePointerClick,
  ArrowUpRight,
  Activity as ActivityIcon,
} from 'lucide-react'
import { Card, StatCard, ProgressBar, Badge } from '../components/ui'
import { BarChart, HourlyActivityChart, DonutChart } from '../components/Charts'
import { employees, formatDuration, formatTimeAgo } from '../lib/data'
import { statusConfig, productivityColor, productivityBar } from '../lib/helpers'

export function Overview() {
  const stats = useMemo(() => {
    const online = employees.filter((e) => e.online)
    const totalActive = employees.reduce((s, e) => s + e.activeTimeSec, 0)
    const avgProd = Math.round(employees.reduce((s, e) => s + e.productivity, 0) / employees.length)
    const alerts = employees.filter((e) => e.productivity < 65 || e.idleTimeSec > 3600 || !e.webcamVerified)
    return { online, totalActive, avgProd, alerts }
  }, [])

  const hourly = useMemo(() => {
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]
    return hours.map((hour) => {
      const active = employees.reduce((s, e) => {
        const h = e.hourly.find((x) => x.hour === hour)
        return s + (h?.activeSec ?? 0)
      }, 0)
      const idle = employees.reduce((s, e) => {
        const h = e.hourly.find((x) => x.hour === hour)
        return s + (h?.idleSec ?? 0)
      }, 0)
      const prod = Math.round(
        employees.reduce((s, e) => {
          const h = e.hourly.find((x) => x.hour === hour)
          return s + (h?.productivity ?? 0)
        }, 0) / employees.length
      )
      return { hour, activeSec: active, idleSec: idle, productivity: prod }
    })
  }, [])

  const appDist = useMemo(() => {
    const map = new Map<string, { value: number; color: string }>()
    const colors: Record<string, string> = {
      productive: '#10b981',
      neutral: '#64748b',
      distracting: '#f43f5e',
      communication: '#06b6d4',
      system: '#475569',
    }
    employees.forEach((e) =>
      e.apps.forEach((a) => {
        const cur = map.get(a.category) ?? { value: 0, color: colors[a.category] }
        cur.value += a.durationSec
        map.set(a.category, cur)
      })
    )
    const labels: Record<string, string> = {
      productive: 'Productive',
      neutral: 'Neutral',
      distracting: 'Distracting',
      communication: 'Comms',
      system: 'System',
    }
    return Array.from(map.entries()).map(([k, v]) => ({ label: labels[k], ...v }))
  }, [])

  const deptBars = useMemo(() => {
    const depts = new Map<string, { sum: number; count: number }>()
    employees.forEach((e) => {
      const cur = depts.get(e.department) ?? { sum: 0, count: 0 }
      cur.sum += e.productivity
      cur.count += 1
      depts.set(e.department, cur)
    })
    return Array.from(depts.entries()).map(([label, v]) => ({
      label: label.slice(0, 4),
      value: Math.round(v.sum / v.count),
    }))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-sm text-slate-400">
          Real-time monitoring of {employees.length} remote employees · Updated just now
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Online Now" value={`${stats.online.length}/${employees.length}`} sub={`${employees.length - stats.online.length} offline`} icon={<Users className="h-5 w-5" />} accent="text-emerald-400" trend={4} />
        <StatCard label="Avg Productivity" value={`${stats.avgProd}%`} sub="across all teams" icon={<TrendingUp className="h-5 w-5" />} accent="text-cyan-400" trend={3} />
        <StatCard label="Active Hours" value={formatDuration(stats.totalActive)} sub="today combined" icon={<Clock className="h-5 w-5" />} accent="text-violet-400" trend={7} />
        <StatCard label="Alerts" value={stats.alerts.length} sub="need attention" icon={<AlertTriangle className="h-5 w-5" />} accent="text-amber-400" trend={-2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Team Activity Timeline</h2>
              <p className="text-xs text-slate-500">Active vs idle time across the day</p>
            </div>
            <Badge variant="success">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
            </Badge>
          </div>
          <HourlyActivityChart data={hourly} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">App Usage Distribution</h2>
          <DonutChart data={appDist} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Department Productivity</h2>
          <BarChart data={deptBars} height={160} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">System Health</h2>
          <div className="space-y-4">
            {[
              { label: 'Avg CPU', value: Math.round(employees.reduce((s, e) => s + e.cpuUsage, 0) / employees.length), icon: Cpu, color: 'bg-cyan-500' },
              { label: 'Avg RAM', value: Math.round(employees.reduce((s, e) => s + e.ramUsage, 0) / employees.length), icon: HardDrive, color: 'bg-violet-500' },
              { label: 'Avg Disk', value: Math.round(employees.reduce((s, e) => s + e.diskUsage, 0) / employees.length), icon: HardDrive, color: 'bg-amber-500' },
              { label: 'Avg Battery', value: Math.round(employees.filter((e) => e.battery > 0).reduce((s, e) => s + e.battery, 0) / employees.filter((e) => e.battery > 0).length), icon: Battery, color: 'bg-emerald-500' },
            ].map((s) => (
              <div key={s.label}>
                <div className="mb-1.5 flex items-center gap-2">
                  <s.icon className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className="ml-auto text-xs font-medium text-white tabular-nums">{s.value}%</span>
                </div>
                <ProgressBar value={s.value} color={s.color} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-white">Monitored Employees</h2>
            <Link to="/employees" className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {employees.slice(0, 6).map((e) => {
              const sc = statusConfig(e.status)
              return (
                <Link key={e.id} to={`/employees/${e.id}`} className="flex items-center gap-3 p-4 transition hover:bg-slate-800/40">
                  <div className="relative">
                    <img src={e.avatar} alt={e.name} className="h-9 w-9 rounded-full object-cover" />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${sc.dot}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{e.name}</p>
                    <p className="truncate text-xs text-slate-500">{e.role}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-slate-400">{formatDuration(e.activeTimeSec)}</p>
                    <p className="text-[10px] text-slate-600">active</p>
                  </div>
                  <div className="w-20 text-right">
                    <p className={`text-sm font-semibold tabular-nums ${productivityColor(e.productivity)}`}>{e.productivity}%</p>
                    <div className="mt-1">
                      <ProgressBar value={e.productivity} color={productivityBar(e.productivity)} className="h-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-white">Live Activity Feed</h2>
          </div>
          <div className="max-h-[420px] divide-y divide-slate-800 overflow-y-auto">
            {employees
              .flatMap((e) => e.activities.slice(0, 2).map((a) => ({ ...a, emp: e })))
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 10)
              .map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-3"
                >
                  <div className="mt-0.5 rounded-lg bg-slate-800 p-1.5">
                    <ActivityIcon className="h-3 w-3 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-slate-300">
                      <span className="font-medium text-white">{a.emp.name}</span> on{' '}
                      <span className="text-cyan-400">{a.app}</span>
                    </p>
                    <p className="truncate text-[11px] text-slate-500">{a.windowTitle}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-600">{formatTimeAgo(a.timestamp)}</span>
                </motion.div>
              ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Screenshots', value: employees.reduce((s, e) => s + e.screenshotsTaken, 0), icon: Camera, color: 'text-cyan-400' },
          { label: 'Keystrokes', value: employees.reduce((s, e) => s + e.keystrokes, 0).toLocaleString(), icon: Keyboard, color: 'text-violet-400' },
          { label: 'Mouse Clicks', value: employees.reduce((s, e) => s + e.mouseClicks, 0).toLocaleString(), icon: MousePointerClick, color: 'text-emerald-400' },
          { label: 'Webcam Verified', value: `${employees.filter((e) => e.webcamVerified).length}/${employees.length}`, icon: Eye, color: 'text-amber-400' },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 p-4">
            <div className={`rounded-lg bg-slate-800/60 p-2 ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-white tabular-nums">{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
