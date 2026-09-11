import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ListChecks,
  User,
  Users,
  Clock,
  Calendar,
  MessageSquare,
  Plus,
  LayoutGrid,
  AlignLeft,
  Search,
  AlertCircle,
  X,
  Send,
  ChevronRight,
  ChevronLeft,
  Trash2,
} from 'lucide-react'
import { Card, ProgressBar, Badge, StatCard } from '../components/ui'
import { tasks as initialTasks, employees, projects, daysUntil } from '../lib/data'
import {
  taskStatusConfig,
  taskPriorityConfig,
  taskTypeConfig,
  dueDateColor,
} from '../lib/helpers'
import type { Task, TaskStatus, TaskType, TaskPriority, TaskComment } from '../lib/types'

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'review', label: 'In Review' },
  { status: 'done', label: 'Done' },
]

const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'review', 'done', 'blocked']

export function Tasks() {
  const [taskList, setTaskList] = useState<Task[]>(initialTasks)
  const [view, setView] = useState<'board' | 'list'>('board')
  const [typeFilter, setTypeFilter] = useState<'all' | TaskType>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newComment, setNewComment] = useState('')

  // Create form state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    type: 'individual' as TaskType,
    assigneeIds: [] as string[],
    projectId: projects[0]?.id ?? '',
    priority: 'medium' as TaskPriority,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 8,
    tags: '',
  })

  const filtered = useMemo(() => {
    return taskList.filter((t) => {
      const matchType = typeFilter === 'all' || t.type === typeFilter
      const matchQuery =
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.projectName.toLowerCase().includes(query.toLowerCase()) ||
        t.assigneeNames.some((n) => n.toLowerCase().includes(query.toLowerCase()))
      return matchType && matchQuery
    })
  }, [taskList, typeFilter, query])

  const stats = useMemo(() => {
    const done = taskList.filter((t) => t.status === 'done').length
    const inProgress = taskList.filter((t) => t.status === 'in-progress').length
    const blocked = taskList.filter((t) => t.status === 'blocked').length
    const overdue = taskList.filter((t) => t.status !== 'done' && daysUntil(t.dueDate) < 0).length
    return { done, inProgress, blocked, overdue, total: taskList.length }
  }, [taskList])

  const selectedTask = selectedId ? taskList.find((t) => t.id === selectedId) ?? null : null

  // ---- Task mutations ----

  function updateTask(id: string, updates: Partial<Task>) {
    setTaskList((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  function changeStatus(id: string, status: TaskStatus) {
    const progress = status === 'done' ? 100 : status === 'todo' ? 0 : undefined
    updateTask(id, { status, ...(progress !== undefined ? { progress } : {}) })
  }

  function moveStatus(id: string, direction: 1 | -1) {
    const task = taskList.find((t) => t.id === id)
    if (!task) return
    const currentIdx = statusOrder.indexOf(task.status)
    const nextIdx = currentIdx + direction
    if (nextIdx < 0 || nextIdx >= statusOrder.length) return
    const nextStatus = statusOrder[nextIdx]
    changeStatus(id, nextStatus)
  }

  function addComment(taskId: string) {
    if (!newComment.trim()) return
    const comment: TaskComment = {
      id: `c-${Date.now()}`,
      author: 'Admin',
      avatar: '',
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    }
    setTaskList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t))
    )
    setNewComment('')
  }

  function deleteTask(id: string) {
    setTaskList((prev) => prev.filter((t) => t.id !== id))
    setSelectedId(null)
  }

  function handleCreate() {
    if (!createForm.title) return
    const project = projects.find((p) => p.id === createForm.projectId)
    const assignees = employees.filter((e) => createForm.assigneeIds.includes(e.id))
    const newId = `TSK-${String(taskList.length + 1).padStart(3, '0')}`
    const newTask: Task = {
      id: newId,
      title: createForm.title,
      description: createForm.description || 'No description provided.',
      type: createForm.type,
      assigneeIds: assignees.map((e) => e.id),
      assigneeNames: assignees.map((e) => e.name),
      assigneeAvatars: assignees.map((e) => e.avatar),
      group: createForm.type === 'group' ? 'Custom Group' : null,
      projectId: createForm.projectId,
      projectName: project?.name ?? 'Unassigned',
      status: 'todo',
      priority: createForm.priority,
      progress: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      dueDate: createForm.dueDate,
      estimatedHours: createForm.estimatedHours,
      loggedHours: 0,
      tags: createForm.tags ? createForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      comments: [],
    }
    setTaskList((prev) => [...prev, newTask])
    setShowCreate(false)
    setCreateForm({
      title: '',
      description: '',
      type: 'individual',
      assigneeIds: [],
      projectId: projects[0]?.id ?? '',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      estimatedHours: 8,
      tags: '',
    })
  }

  function toggleAssignee(empId: string) {
    setCreateForm((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(empId)
        ? prev.assigneeIds.filter((id) => id !== empId)
        : [...prev.assigneeIds, empId],
      type: prev.assigneeIds.length >= 1 || (prev.assigneeIds.length === 0 && prev.assigneeIds.includes(empId)) ? 'group' : 'individual',
    }))
  }

  const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none'
  const labelClass = 'mb-1 block text-xs font-medium text-slate-400'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <p className="text-sm text-slate-400">Assign and track individual and group tasks across all projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Tasks" value={stats.total} icon={<ListChecks className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="In Progress" value={stats.inProgress} icon={<Clock className="h-5 w-5" />} accent="text-cyan-400" />
        <StatCard label="Completed" value={stats.done} icon={<ListChecks className="h-5 w-5" />} accent="text-emerald-400" />
        <StatCard label="Overdue / Blocked" value={stats.overdue + stats.blocked} icon={<AlertCircle className="h-5 w-5" />} accent="text-rose-400" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${typeFilter === 'all' ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('individual')}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${typeFilter === 'individual' ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400 hover:text-white'}`}
            >
              <User className="h-3 w-3" /> Individual
            </button>
            <button
              onClick={() => setTypeFilter('group')}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${typeFilter === 'group' ? 'bg-violet-500/15 text-violet-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Users className="h-3 w-3" /> Group
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button onClick={() => setView('board')} className={`rounded-md p-1.5 transition ${view === 'board' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={`rounded-md p-1.5 transition ${view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
              <AlignLeft className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>
      </div>

      {view === 'board' ? (
        /* Kanban Board */
        <div className="grid gap-4 lg:grid-cols-4">
          {columns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.status)
            const sc = taskStatusConfig(col.status)
            return (
              <div key={col.status} className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${sc.color.replace('text-', 'bg-')}`} />
                    <span className="text-sm font-semibold text-white">{col.label}</span>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{colTasks.length}</span>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {colTasks.map((task) => {
                      const tc = taskStatusConfig(task.status)
                      const pc = taskPriorityConfig(task.priority)
                      const tp = taskTypeConfig(task.type)
                      const dd = daysUntil(task.dueDate)
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => setSelectedId(task.id)}
                          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 hover:bg-slate-800/60"
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tp.bg} ${tp.color}`}>
                              {task.type === 'group' ? <Users className="mr-1 inline h-2.5 w-2.5" /> : <User className="mr-1 inline h-2.5 w-2.5" />}
                              {tp.label}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pc.bg} ${pc.color}`}>{pc.label}</span>
                          </div>
                          <p className="text-sm font-medium text-white">{task.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description}</p>

                          <div className="mt-3">
                            <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Progress</span>
                              <span className="text-slate-400">{task.progress}%</span>
                            </div>
                            <ProgressBar value={task.progress} color={task.status === 'done' ? 'bg-emerald-500' : task.status === 'blocked' ? 'bg-rose-500' : 'bg-cyan-500'} className="h-1.5" />
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {task.assigneeAvatars.slice(0, 3).map((av, i) => (
                                <img key={i} src={av} alt="" className="h-6 w-6 rounded-full border-2 border-slate-900 object-cover" />
                              ))}
                              {task.assigneeAvatars.length > 3 && (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-700 text-[9px] text-slate-300">
                                  +{task.assigneeAvatars.length - 3}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              {task.comments.length > 0 && (
                                <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" /> {task.comments.length}</span>
                              )}
                              <span className={`flex items-center gap-0.5 ${dueDateColor(dd)}`}>
                                <Calendar className="h-3 w-3" />
                                {dd < 0 ? `${Math.abs(dd)}d overdue` : dd === 0 ? 'Today' : `${dd}d`}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 border-t border-slate-800 pt-2 text-[10px] text-slate-600">
                            <Link to={`/projects/${task.projectId}`} onClick={(e) => e.stopPropagation()} className="hover:text-cyan-400">
                              {task.projectName}
                            </Link>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  {colTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-600">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Type</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Assignees</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Priority</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Due</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((task) => {
                  const sc = taskStatusConfig(task.status)
                  const pc = taskPriorityConfig(task.priority)
                  const tp = taskTypeConfig(task.type)
                  const dd = daysUntil(task.dueDate)
                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedId(task.id)}
                      className="cursor-pointer transition hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.projectName}</p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${tp.bg} ${tp.color}`}>
                          {task.type === 'group' ? <Users className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                          {tp.label}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="flex -space-x-2">
                          {task.assigneeAvatars.slice(0, 3).map((av, i) => (
                            <img key={i} src={av} alt="" className="h-6 w-6 rounded-full border-2 border-slate-900 object-cover" />
                          ))}
                          {task.assigneeAvatars.length > 3 && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-700 text-[9px] text-slate-300">
                              +{task.assigneeAvatars.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pc.bg} ${pc.color}`}>{pc.label}</span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className={`text-xs ${dueDateColor(dd)}`}>
                          {dd < 0 ? `${Math.abs(dd)}d overdue` : dd === 0 ? 'Today' : `${dd}d left`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16"><ProgressBar value={task.progress} color={task.status === 'done' ? 'bg-emerald-500' : task.status === 'blocked' ? 'bg-rose-500' : 'bg-cyan-500'} className="h-1.5" /></div>
                          <span className="text-xs text-slate-400">{task.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-500">No tasks match your filters.</div>
          )}
        </Card>
      )}

      {/* ===== Task detail modal ===== */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${taskTypeConfig(selectedTask.type).bg} ${taskTypeConfig(selectedTask.type).color}`}>
                      {taskTypeConfig(selectedTask.type).label}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${taskStatusConfig(selectedTask.status).bg} ${taskStatusConfig(selectedTask.status).color}`}>
                      {taskStatusConfig(selectedTask.status).label}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${taskPriorityConfig(selectedTask.priority).bg} ${taskPriorityConfig(selectedTask.priority).color}`}>
                      {taskPriorityConfig(selectedTask.priority).label}
                    </span>
                    <span className="text-[10px] text-slate-500">{selectedTask.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedTask.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => deleteTask(selectedTask.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-400"
                    title="Delete task"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                  <button onClick={() => setSelectedId(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-400">{selectedTask.description}</p>

              {/* Info grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="text-slate-500">Project</p>
                  <Link to={`/projects/${selectedTask.projectId}`} className="font-medium text-cyan-400 hover:text-cyan-300">{selectedTask.projectName}</Link>
                </div>
                {selectedTask.group && (
                  <div className="rounded-lg bg-slate-800/40 p-3">
                    <p className="text-slate-500">Group</p>
                    <p className="font-medium text-violet-400">{selectedTask.group}</p>
                  </div>
                )}
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="text-slate-500">Due Date</p>
                  <p className={`font-medium ${dueDateColor(daysUntil(selectedTask.dueDate))}`}>
                    {selectedTask.dueDate} ({daysUntil(selectedTask.dueDate) < 0 ? `${Math.abs(daysUntil(selectedTask.dueDate))}d overdue` : `${daysUntil(selectedTask.dueDate)}d left`})
                  </p>
                </div>
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="text-slate-500">Time Logged</p>
                  <p className="font-medium text-slate-300">{selectedTask.loggedHours}h / {selectedTask.estimatedHours}h</p>
                </div>
              </div>

              {/* Status controls */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-400">Status</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => moveStatus(selectedTask.id, -1)}
                    disabled={selectedTask.status === 'todo'}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    {(['todo', 'in-progress', 'review', 'done', 'blocked'] as TaskStatus[]).map((s) => {
                      const sc = taskStatusConfig(s)
                      const active = selectedTask.status === s
                      return (
                        <button
                          key={s}
                          onClick={() => changeStatus(selectedTask.id, s)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${active ? `${sc.bg} ${sc.color} ring-1 ring-current` : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                          {sc.label}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => moveStatus(selectedTask.id, 1)}
                    disabled={selectedTask.status === 'done' || selectedTask.status === 'blocked'}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Advance <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress slider */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">Progress</p>
                  <span className="text-xs font-semibold text-white tabular-nums">{selectedTask.progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedTask.progress}
                  onChange={(e) => {
                    const progress = Number(e.target.value)
                    const status: TaskStatus = progress === 100 ? 'done' : progress === 0 ? 'todo' : selectedTask.status === 'todo' ? 'in-progress' : selectedTask.status
                    updateTask(selectedTask.id, { progress, status })
                  }}
                  className="w-full accent-cyan-500"
                />
                <div className="mt-2">
                  <ProgressBar value={selectedTask.progress} color={selectedTask.status === 'done' ? 'bg-emerald-500' : selectedTask.status === 'blocked' ? 'bg-rose-500' : 'bg-cyan-500'} />
                </div>
              </div>

              {/* Assignees */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-400">Assignees ({selectedTask.assigneeNames.length})</p>
                <div className="space-y-2">
                  {selectedTask.assigneeNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <img src={selectedTask.assigneeAvatars[i]} alt={name} className="h-7 w-7 rounded-full object-cover" />
                      <span className="text-sm text-slate-300">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {selectedTask.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {selectedTask.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Comments */}
              <div className="mt-4 border-t border-slate-800 pt-4">
                <p className="mb-3 text-xs font-medium text-slate-400">Comments ({selectedTask.comments.length})</p>
                <div className="space-y-3">
                  {selectedTask.comments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.author} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-[10px] font-bold text-white">A</div>
                      )}
                      <div className="flex-1 rounded-lg bg-slate-800/40 p-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-white">{c.author}</p>
                          <p className="text-[10px] text-slate-600">{new Date(c.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add comment */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-[10px] font-bold text-white">A</div>
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addComment(selectedTask.id)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
                  />
                  <button
                    onClick={() => addComment(selectedTask.id)}
                    disabled={!newComment.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-white transition hover:bg-cyan-400 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Create task modal ===== */}
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
                    <Plus className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Create New Task</h3>
                    <p className="text-xs text-slate-500">Assign work to individuals or groups</p>
                  </div>
                </div>
                <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} placeholder="Task title..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Describe the task..." rows={3} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Project</label>
                    <select value={createForm.projectId} onChange={(e) => setCreateForm({ ...createForm, projectId: e.target.value })} className={inputClass}>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Priority</label>
                    <select value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as TaskPriority })} className={inputClass}>
                      {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Due Date</label>
                    <input type="date" value={createForm.dueDate} onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Estimated Hours</label>
                    <input type="number" min={1} value={createForm.estimatedHours} onChange={(e) => setCreateForm({ ...createForm, estimatedHours: Number(e.target.value) })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Tags (comma-separated)</label>
                  <input value={createForm.tags} onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })} placeholder="frontend, urgent, bug" className={inputClass} />
                </div>

                {/* Assignee picker */}
                <div>
                  <label className={labelClass}>
                    Assignees {createForm.assigneeIds.length > 0 && <span className="text-cyan-400">({createForm.assigneeIds.length} selected · {createForm.assigneeIds.length > 1 ? 'Group' : 'Individual'})</span>}
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {employees.map((emp) => {
                      const selected = createForm.assigneeIds.includes(emp.id)
                      return (
                        <button
                          key={emp.id}
                          onClick={() => toggleAssignee(emp.id)}
                          className={`flex items-center gap-2 rounded-lg border p-2 text-left transition ${selected ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}
                        >
                          <img src={emp.avatar} alt={emp.name} className="h-7 w-7 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className={`truncate text-xs font-medium ${selected ? 'text-cyan-400' : 'text-slate-300'}`}>{emp.name.split(' ')[0]}</p>
                            <p className="truncate text-[9px] text-slate-500">{emp.role.split(' ')[0]}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleCreate}
                  disabled={!createForm.title || createForm.assigneeIds.length === 0}
                  className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-400 disabled:opacity-40"
                >
                  Create Task
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
