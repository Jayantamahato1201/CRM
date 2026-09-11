import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Card, ProgressBar, Badge, StatCard } from '../components/ui'
import {
  getProject,
  getTasksForProject,
  formatCurrency,
  daysUntil,
} from '../lib/data'
import {
  projectStatusConfig,
  projectHealthConfig,
  taskStatusConfig,
  taskPriorityConfig,
  taskTypeConfig,
  dueDateColor,
} from '../lib/helpers'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const project = id ? getProject(id) : undefined

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-slate-400">Project not found.</p>
        <Link to="/projects" className="mt-4 text-cyan-400 hover:text-cyan-300">
          ← Back to projects
        </Link>
      </div>
    )
  }

  const projectTasks = getTasksForProject(project.id)
  const sc = projectStatusConfig(project.status)
  const hc = projectHealthConfig(project.health)
  const dd = daysUntil(project.endDate)
  const budgetPct = Math.round((project.spent / project.budget) * 100)
  const completedMilestones = project.milestones.filter((m) => m.completed).length

  return (
    <div className="space-y-6">
      <Link to="/projects" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-base font-bold text-cyan-400">
              {project.code}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-white">{project.name}</h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${sc.bg} ${sc.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} /> {sc.label}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${hc.bg} ${hc.color}`}>{hc.label}</span>
              </div>
              <p className="max-w-2xl text-sm text-slate-400">{project.description}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{project.id}</span>
                <span>· {project.department}</span>
                <span>· Client: {project.client}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg width="96" height="96" className="-rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
                <motion.circle
                  cx="48" cy="48" r="40" fill="none" stroke={project.health === 'at-risk' ? '#f59e0b' : '#10b981'} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 - (project.progress / 100) * 2 * Math.PI * 40 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-white">{project.progress}%</span>
                <span className="text-[9px] text-slate-500">complete</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Budget" value={formatCurrency(project.budget)} sub={`${formatCurrency(project.spent)} spent (${budgetPct}%)`} icon={<DollarSign className="h-5 w-5" />} accent="text-violet-400" />
        <StatCard label="Team Size" value={project.teamSize} sub="members assigned" icon={<Users className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="Days Left" value={dd < 0 ? `${Math.abs(dd)}d over` : `${dd}d`} sub={project.endDate} icon={<Calendar className="h-5 w-5" />} accent={dd < 0 ? 'text-rose-400' : 'text-emerald-400'} />
        <StatCard label="Milestones" value={`${completedMilestones}/${project.milestones.length}`} sub="completed" icon={<Target className="h-5 w-5" />} accent="text-amber-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Milestones */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Milestones</h2>
          <div className="space-y-4">
            {project.milestones.map((m, i) => {
              const mDd = daysUntil(m.dueDate)
              return (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {m.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${m.completed ? 'text-slate-400 line-through' : 'text-white'}`}>{m.title}</p>
                      <span className={`text-xs ${m.completed ? 'text-emerald-400' : dueDateColor(mDd)}`}>
                        {m.completed ? 'Done' : mDd < 0 ? `${Math.abs(mDd)}d overdue` : `${mDd}d left`}
                      </span>
                    </div>
                    {!m.completed && (
                      <div className="mt-1.5">
                        <ProgressBar value={m.progress} color={m.progress > 70 ? 'bg-emerald-500' : m.progress > 30 ? 'bg-cyan-500' : 'bg-amber-500'} className="h-1.5" />
                      </div>
                    )}
                    <p className="mt-1 text-[10px] text-slate-600">Due: {m.dueDate}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Budget breakdown */}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Budget Breakdown</h3>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Spent vs Budget</span>
              <span className="text-slate-300">{formatCurrency(project.spent)} / {formatCurrency(project.budget)}</span>
            </div>
            <ProgressBar value={budgetPct} color={budgetPct > 90 ? 'bg-rose-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-violet-500'} />
            <div className="mt-2 flex justify-between text-[10px] text-slate-500">
              <span>Remaining: {formatCurrency(project.budget - project.spent)}</span>
              <span>{budgetPct}% utilized</span>
            </div>
          </div>
        </Card>

        {/* Team members */}
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Team Members</h2>
          <div className="space-y-3">
            {project.teamMembers.map((name, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={project.teamAvatars[i]} alt={name} className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{name}</p>
                  <p className="truncate text-xs text-slate-500">Team member</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-800 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Task Distribution</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Completed</span>
                <span className="text-emerald-400">{project.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400"><Clock className="h-3 w-3 text-cyan-400" /> In Progress</span>
                <span className="text-cyan-400">{project.inProgressTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400"><AlertCircle className="h-3 w-3 text-rose-400" /> Blocked</span>
                <span className="text-rose-400">{project.blockedTasks}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-xs">
                <span className="text-slate-400">Total Tasks</span>
                <span className="font-semibold text-white">{project.totalTasks}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Project tasks */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-white">Project Tasks ({projectTasks.length})</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {projectTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No tasks assigned to this project yet.</div>
          ) : (
            projectTasks.map((task) => {
              const tsc = taskStatusConfig(task.status)
              const tpc = taskPriorityConfig(task.priority)
              const ttp = taskTypeConfig(task.type)
              const tdd = daysUntil(task.dueDate)
              return (
                <div key={task.id} className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ttp.bg} ${ttp.color}`}>{ttp.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tpc.bg} ${tpc.color}`}>{tpc.label}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{task.title}</p>
                  </div>
                  <div className="hidden items-center -space-x-2 sm:flex">
                    {task.assigneeAvatars.slice(0, 3).map((av, i) => (
                      <img key={i} src={av} alt="" className="h-6 w-6 rounded-full border-2 border-slate-900 object-cover" />
                    ))}
                  </div>
                  <span className={`hidden text-xs md:block ${dueDateColor(tdd)}`}>
                    {tdd < 0 ? `${Math.abs(tdd)}d overdue` : `${tdd}d left`}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${tsc.bg} ${tsc.color}`}>
                    {tsc.label}
                  </span>
                  <div className="hidden w-16 lg:block">
                    <ProgressBar value={task.progress} color={task.status === 'done' ? 'bg-emerald-500' : task.status === 'blocked' ? 'bg-rose-500' : 'bg-cyan-500'} className="h-1.5" />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
