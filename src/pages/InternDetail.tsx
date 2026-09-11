import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Calendar,
  User,
  Briefcase,
  Award,
  Clock,
  CheckCircle2,
  Circle,
  Star,
} from 'lucide-react'
import { Card, ProgressBar, Badge, Ring, StatCard } from '../components/ui'
import { TrendChart } from '../components/Charts'
import { getIntern, formatCurrency, daysUntil, formatTimeAgo } from '../lib/data'
import { internStatusConfig, recommendationConfig, dueDateColor } from '../lib/helpers'

export function InternDetail() {
  const { id } = useParams<{ id: string }>()
  const intern = id ? getIntern(id) : undefined

  if (!intern) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-slate-400">Intern not found.</p>
        <Link to="/internships" className="mt-4 text-cyan-400 hover:text-cyan-300">
          ← Back to internships
        </Link>
      </div>
    )
  }

  const sc = internStatusConfig(intern.status)
  const dd = daysUntil(intern.endDate)
  const hoursPct = Math.round((intern.hoursCompleted / intern.totalHours) * 100)
  const avgEval = intern.evaluations.length > 0
    ? Math.round(intern.evaluations.reduce((s, e) => s + e.overall, 0) / intern.evaluations.length)
    : 0
  const completedGoals = intern.goals.filter((g) => g.completed).length
  const trendData = intern.weeklyHours.map((w) => ({ day: w.week.replace('Week ', 'W'), productivity: w.productivity, hours: w.hours }))

  return (
    <div className="space-y-6">
      <Link to="/internships" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to internships
      </Link>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <img src={intern.avatar} alt={intern.name} className="h-20 w-20 rounded-2xl object-cover" />
            <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-slate-900 ${sc.dot}`} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white">{intern.name}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${sc.bg} ${sc.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} /> {sc.label}
              </span>
            </div>
            <p className="text-sm text-slate-400">{intern.position} · {intern.department}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {intern.university}</span>
              <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {intern.degree}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {intern.location}</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {intern.email}</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {intern.phone}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Ring value={intern.progress} size={110} color={intern.progress >= 80 ? '#10b981' : intern.progress >= 50 ? '#f59e0b' : '#22d3ee'} sublabel="progress" />
          </div>
        </div>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Hours Logged" value={`${intern.hoursCompleted}h`} sub={`of ${intern.totalHours}h total (${hoursPct}%)`} icon={<Clock className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="Tasks" value={`${intern.tasksCompleted}/${intern.tasksAssigned}`} sub="completed" icon={<CheckCircle2 className="h-5 w-5" />} accent="text-emerald-400" />
        <StatCard label="Avg Evaluation" value={avgEval > 0 ? `${avgEval}%` : 'N/A'} sub={`${intern.evaluations.length} evaluations`} icon={<Star className="h-5 w-5" />} accent="text-violet-400" />
        <StatCard label="Days Remaining" value={dd < 0 ? 'Completed' : `${dd}d`} sub={intern.endDate} icon={<Calendar className="h-5 w-5" />} accent={dd < 0 ? 'text-cyan-400' : dd <= 14 ? 'text-amber-400' : 'text-emerald-400'} />
      </div>

      {/* Mentor + details */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Mentor & Program</h2>
          <div className="flex items-center gap-3 rounded-lg bg-slate-800/40 p-3">
            <img src={intern.mentorAvatar} alt={intern.mentorName} className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium text-white">{intern.mentorName}</p>
              <p className="text-xs text-slate-500">Assigned Mentor</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400"><Calendar className="h-3.5 w-3.5" /> Start Date</span>
              <span className="text-slate-300">{intern.startDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400"><Calendar className="h-3.5 w-3.5" /> End Date</span>
              <span className="text-slate-300">{intern.endDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400"><Clock className="h-3.5 w-3.5" /> Duration</span>
              <span className="text-slate-300">{intern.duration} weeks</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400"><Briefcase className="h-3.5 w-3.5" /> Stipend</span>
              <span className="text-slate-300">{formatCurrency(intern.stipend)}/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400"><User className="h-3.5 w-3.5" /> Meetings</span>
              <span className="text-slate-300">{intern.meetingsAttended} attended</span>
            </div>
          </div>
          {/* Skills */}
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="mb-2 text-xs font-medium text-slate-400">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {intern.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-medium text-cyan-400">{skill}</span>
              ))}
            </div>
          </div>
        </Card>

        {/* Weekly hours trend */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Weekly Hours & Productivity</h2>
          <TrendChart data={trendData} height={160} />
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-800 pt-4">
            <div>
              <p className="text-xs text-slate-500">Avg Hours/Week</p>
              <p className="text-lg font-bold text-white">{(intern.weeklyHours.reduce((s, w) => s + w.hours, 0) / Math.max(intern.weeklyHours.length, 1)).toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Avg Productivity</p>
              <p className="text-lg font-bold text-emerald-400">{Math.round(intern.weeklyHours.reduce((s, w) => s + w.productivity, 0) / Math.max(intern.weeklyHours.length, 1))}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Weeks</p>
              <p className="text-lg font-bold text-white">{intern.weeklyHours.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Goals + Evaluations */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Goals */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Internship Goals</h2>
            <Badge variant="info">{completedGoals}/{intern.goals.length} done</Badge>
          </div>
          <div className="space-y-4">
            {intern.goals.length === 0 ? (
              <p className="text-sm text-slate-500">No goals set yet.</p>
            ) : (
              intern.goals.map((goal, i) => (
                <motion.div key={goal.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {goal.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 text-slate-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${goal.completed ? 'text-slate-400 line-through' : 'text-white'}`}>{goal.title}</p>
                      <span className={`text-xs ${goal.completed ? 'text-emerald-400' : dueDateColor(daysUntil(goal.dueDate))}`}>
                        {goal.completed ? 'Done' : daysUntil(goal.dueDate) < 0 ? `${Math.abs(daysUntil(goal.dueDate))}d overdue` : `${daysUntil(goal.dueDate)}d left`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{goal.description}</p>
                    {!goal.completed && (
                      <div className="mt-1.5">
                        <ProgressBar value={goal.progress} color={goal.progress > 70 ? 'bg-emerald-500' : goal.progress > 30 ? 'bg-cyan-500' : 'bg-amber-500'} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Evaluations */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Evaluations</h2>
            <Badge variant="neutral">{intern.evaluations.length} reviews</Badge>
          </div>
          <div className="space-y-4">
            {intern.evaluations.length === 0 ? (
              <p className="text-sm text-slate-500">No evaluations yet.</p>
            ) : (
              intern.evaluations.map((eval_, i) => {
                const rc = recommendationConfig(eval_.recommendation)
                return (
                  <motion.div key={eval_.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-lg border border-slate-800 bg-slate-800/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={eval_.evaluatorAvatar} alt={eval_.evaluator} className="h-7 w-7 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-medium text-white">{eval_.evaluator}</p>
                          <p className="text-[10px] text-slate-500">{eval_.period} · {eval_.date}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${rc.bg} ${rc.color}`}>{rc.label}</span>
                    </div>
                    {/* Scores */}
                    <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                      {[
                        { label: 'Tech', value: eval_.technical },
                        { label: 'Comm', value: eval_.communication },
                        { label: 'Team', value: eval_.teamwork },
                        { label: 'Init', value: eval_.initiative },
                        { label: 'Overall', value: eval_.overall },
                      ].map((s) => (
                        <div key={s.label}>
                          <p className={`text-sm font-bold ${s.label === 'Overall' ? 'text-cyan-400' : 'text-slate-300'}`}>{s.value}</p>
                          <p className="text-[9px] text-slate-500">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{eval_.feedback}</p>
                  </motion.div>
                )
              })
            )}
          </div>
        </Card>
      </div>

      {/* Mentor feedback */}
      {intern.feedback.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Mentor & Peer Feedback</h2>
          <div className="space-y-3">
            {intern.feedback.map((f) => (
              <div key={f.id} className="flex gap-3">
                <img src={f.avatar} alt={f.author} className="h-8 w-8 rounded-full object-cover" />
                <div className="flex-1 rounded-lg bg-slate-800/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-white">{f.author}</p>
                    <p className="text-[10px] text-slate-600">{formatTimeAgo(f.date)}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
