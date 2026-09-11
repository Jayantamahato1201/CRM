import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderKanban,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
} from 'lucide-react'
import { Card, ProgressBar, Badge, StatCard } from '../components/ui'
import { projects, formatCurrency, daysUntil } from '../lib/data'
import { projectStatusConfig, projectHealthConfig } from '../lib/helpers'
import type { ProjectStatus } from '../lib/types'

export function Projects() {
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all')

  const filtered = useMemo(() => {
    return filter === 'all' ? projects : projects.filter((p) => p.status === filter)
  }, [filter])

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'active').length
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0)
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0)
    const atRisk = projects.filter((p) => p.health === 'at-risk' || p.health === 'delayed').length
    const avgProgress = Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
    return { active, totalBudget, totalSpent, atRisk, avgProgress }
  }, [])

  const statusFilters: ('all' | ProjectStatus)[] = ['all', 'active', 'planning', 'on-hold', 'completed', 'at-risk']

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="text-sm text-slate-400">Track all projects — progress, budget, team, and milestones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Projects" value={stats.active} sub={`of ${projects.length} total`} icon={<FolderKanban className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="Avg Progress" value={`${stats.avgProgress}%`} sub="across all projects" icon={<TrendingUp className="h-5 w-5" />} accent="text-emerald-400" trend={5} />
        <StatCard label="Total Budget" value={formatCurrency(stats.totalBudget)} sub={`${formatCurrency(stats.totalSpent)} spent`} icon={<DollarSign className="h-5 w-5" />} accent="text-violet-400" />
        <StatCard label="At Risk" value={stats.atRisk} sub="need attention" icon={<AlertTriangle className="h-5 w-5" />} accent="text-amber-400" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === f ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            {f === 'all' ? 'All Projects' : f.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Project cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((p, i) => {
          const sc = projectStatusConfig(p.status)
          const hc = projectHealthConfig(p.health)
          const dd = daysUntil(p.endDate)
          const budgetPct = Math.round((p.spent / p.budget) * 100)
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/projects/${p.id}`}>
                <Card className="p-5 transition hover:border-slate-700 hover:bg-slate-800/40">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-sm font-bold text-cyan-400">
                        {p.code}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                        <p className="text-xs text-slate-500">{p.department} · {p.client}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} /> {sc.label}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${hc.bg} ${hc.color}`}>{hc.label}</span>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs text-slate-500">{p.description}</p>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Overall Progress</span>
                      <span className="font-semibold text-white">{p.progress}%</span>
                    </div>
                    <ProgressBar value={p.progress} color={p.health === 'at-risk' ? 'bg-amber-500' : p.health === 'delayed' ? 'bg-rose-500' : 'bg-emerald-500'} />
                  </div>

                  {/* Budget */}
                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Budget</span>
                      <span className="text-slate-300">{formatCurrency(p.spent)} / {formatCurrency(p.budget)}</span>
                    </div>
                    <ProgressBar value={budgetPct} color={budgetPct > 90 ? 'bg-rose-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-violet-500'} className="h-1.5" />
                  </div>

                  {/* Task summary */}
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-lg bg-slate-800/40 p-2">
                      <p className="text-sm font-bold text-white">{p.totalTasks}</p>
                      <p className="text-[9px] text-slate-500">Total</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/40 p-2">
                      <p className="text-sm font-bold text-cyan-400">{p.inProgressTasks}</p>
                      <p className="text-[9px] text-slate-500">Active</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/40 p-2">
                      <p className="text-sm font-bold text-emerald-400">{p.completedTasks}</p>
                      <p className="text-[9px] text-slate-500">Done</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/40 p-2">
                      <p className="text-sm font-bold text-rose-400">{p.blockedTasks}</p>
                      <p className="text-[9px] text-slate-500">Blocked</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                    <div className="flex -space-x-2">
                      {p.teamAvatars.slice(0, 4).map((av, i) => (
                        <img key={i} src={av} alt="" className="h-7 w-7 rounded-full border-2 border-slate-900 object-cover" />
                      ))}
                      {p.teamAvatars.length > 4 && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-700 text-[9px] text-slate-300">
                          +{p.teamAvatars.length - 4}
                        </span>
                      )}
                      <span className="ml-3 flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3 w-3" /> {p.teamSize}
                      </span>
                    </div>
                    <span className={`flex items-center gap-1 text-xs ${dd < 0 ? 'text-rose-400' : dd <= 7 ? 'text-amber-400' : 'text-slate-400'}`}>
                      <Calendar className="h-3 w-3" />
                      {dd < 0 ? `${Math.abs(dd)}d overdue` : `${dd}d left`}
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center text-sm text-slate-500">No projects match this filter.</Card>
      )}
    </div>
  )
}
