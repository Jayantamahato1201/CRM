import { useMemo, useState } from 'react'
import { Download, Calendar, FileText } from 'lucide-react'
import { Card, ProgressBar, Badge, StatCard } from '../components/ui'
import { BarChart, TrendChart, DonutChart } from '../components/Charts'
import { employees, formatDuration } from '../lib/data'
import { productivityColor, productivityBar } from '../lib/helpers'

const ranges = ['Today', 'This Week', 'This Month']

export function Reports() {
  const [range, setRange] = useState('This Week')

  const teamTrends = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day, i) => {
      const prod = Math.round(
        employees.reduce((s, e) => s + e.trends[i].productivity, 0) / employees.length
      )
      const hours = (
        employees.reduce((s, e) => s + e.trends[i].hours, 0) / employees.length
      ).toFixed(1)
      return { day, productivity: prod, hours: Number(hours) }
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

  const ranked = useMemo(
    () => [...employees].sort((a, b) => b.productivity - a.productivity),
    []
  )

  const totalHours = formatDuration(employees.reduce((s, e) => s + e.activeTimeSec, 0))
  const avgProd = Math.round(employees.reduce((s, e) => s + e.productivity, 0) / employees.length)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-sm text-slate-400">Team productivity insights and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  range === r ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-400">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Active Hours" value={totalHours} icon={<Calendar className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="Avg Productivity" value={`${avgProd}%`} icon={<FileText className="h-5 w-5" />} accent="text-emerald-400" trend={5} />
        <StatCard label="Screenshots" value={employees.reduce((s, e) => s + e.screenshotsTaken, 0)} icon={<FileText className="h-5 w-5" />} accent="text-violet-400" />
        <StatCard label="Active Employees" value={employees.length} icon={<Calendar className="h-5 w-5" />} accent="text-amber-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Team Productivity Trend</h2>
            <Badge variant="info">{range}</Badge>
          </div>
          <TrendChart data={teamTrends} height={200} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">App Category Breakdown</h2>
          <DonutChart data={appDist} />
        </Card>
      </div>

      {/* Department comparison */}
      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Productivity by Department</h2>
        <BarChart
          data={(() => {
            const depts = new Map<string, { sum: number; count: number }>()
            employees.forEach((e) => {
              const cur = depts.get(e.department) ?? { sum: 0, count: 0 }
              cur.sum += e.productivity
              cur.count += 1
              depts.set(e.department, cur)
            })
            return Array.from(depts.entries()).map(([label, v]) => ({
              label,
              value: Math.round(v.sum / v.count),
            }))
          })()}
          height={180}
        />
      </Card>

      {/* Leaderboard */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-white">Employee Productivity Ranking</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {ranked.map((e, i) => (
            <div key={e.id} className="flex items-center gap-4 p-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                i === 0 ? 'bg-amber-500/15 text-amber-400' : i === 1 ? 'bg-slate-400/15 text-slate-300' : i === 2 ? 'bg-orange-700/15 text-orange-400' : 'bg-slate-800 text-slate-500'
              }`}>
                {i + 1}
              </div>
              <img src={e.avatar} alt={e.name} className="h-9 w-9 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{e.name}</p>
                <p className="truncate text-xs text-slate-500">{e.role} · {e.department}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-slate-400">{formatDuration(e.activeTimeSec)}</p>
                <p className="text-[10px] text-slate-600">active</p>
              </div>
              <div className="w-32">
                <div className="mb-1 flex justify-between">
                  <span className={`text-sm font-semibold tabular-nums ${productivityColor(e.productivity)}`}>{e.productivity}%</span>
                </div>
                <ProgressBar value={e.productivity} color={productivityBar(e.productivity)} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
