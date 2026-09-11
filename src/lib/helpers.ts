import type { EmployeeStatus, Activity } from './types'

export function statusConfig(status: EmployeeStatus) {
  const map: Record<EmployeeStatus, { label: string; color: string; dot: string; bg: string }> = {
    active: { label: 'Active', color: 'text-emerald-400', dot: 'bg-emerald-500', bg: 'bg-emerald-500/15' },
    idle: { label: 'Idle', color: 'text-amber-400', dot: 'bg-amber-500', bg: 'bg-amber-500/15' },
    offline: { label: 'Offline', color: 'text-slate-500', dot: 'bg-slate-600', bg: 'bg-slate-700/40' },
    break: { label: 'On Break', color: 'text-violet-400', dot: 'bg-violet-500', bg: 'bg-violet-500/15' },
    meeting: { label: 'In Meeting', color: 'text-cyan-400', dot: 'bg-cyan-500', bg: 'bg-cyan-500/15' },
  }
  return map[status]
}

export function categoryConfig(cat: Activity['category']) {
  const map: Record<Activity['category'], { label: string; color: string; bg: string }> = {
    productive: { label: 'Productive', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    neutral: { label: 'Neutral', color: 'text-slate-400', bg: 'bg-slate-700/40' },
    distracting: { label: 'Distracting', color: 'text-rose-400', bg: 'bg-rose-500/15' },
    communication: { label: 'Communication', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    system: { label: 'System', color: 'text-slate-500', bg: 'bg-slate-700/40' },
  }
  return map[cat]
}

export function productivityColor(value: number): string {
  if (value >= 80) return 'text-emerald-400'
  if (value >= 60) return 'text-amber-400'
  return 'text-rose-400'
}

export function productivityBar(value: number): string {
  if (value >= 80) return 'bg-emerald-500'
  if (value >= 60) return 'bg-amber-500'
  return 'bg-rose-500'
}

import type { AttendanceStatus, TaskStatus, TaskPriority, TaskType, ProjectStatus } from './types'

export function attendanceConfig(status: AttendanceStatus) {
  const map: Record<AttendanceStatus, { label: string; color: string; bg: string; dot: string }> = {
    present: { label: 'Present', color: 'text-emerald-400', bg: 'bg-emerald-500/15', dot: 'bg-emerald-500' },
    late: { label: 'Late', color: 'text-amber-400', bg: 'bg-amber-500/15', dot: 'bg-amber-500' },
    absent: { label: 'Absent', color: 'text-rose-400', bg: 'bg-rose-500/15', dot: 'bg-rose-500' },
    leave: { label: 'On Leave', color: 'text-violet-400', bg: 'bg-violet-500/15', dot: 'bg-violet-500' },
    remote: { label: 'Remote', color: 'text-cyan-400', bg: 'bg-cyan-500/15', dot: 'bg-cyan-500' },
    'half-day': { label: 'Half Day', color: 'text-blue-400', bg: 'bg-blue-500/15', dot: 'bg-blue-500' },
  }
  return map[status]
}

export function taskStatusConfig(status: TaskStatus) {
  const map: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
    todo: { label: 'To Do', color: 'text-slate-300', bg: 'bg-slate-700/40', border: 'border-slate-600' },
    'in-progress': { label: 'In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
    review: { label: 'In Review', color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30' },
    done: { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
    blocked: { label: 'Blocked', color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  }
  return map[status]
}

export function taskPriorityConfig(priority: TaskPriority) {
  const map: Record<TaskPriority, { label: string; color: string; bg: string }> = {
    low: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-700/40' },
    medium: { label: 'Medium', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    high: { label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/15' },
    urgent: { label: 'Urgent', color: 'text-rose-400', bg: 'bg-rose-500/15' },
  }
  return map[priority]
}

export function taskTypeConfig(type: TaskType) {
  const map: Record<TaskType, { label: string; color: string; bg: string; icon: string }> = {
    individual: { label: 'Individual', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: 'user' },
    group: { label: 'Group', color: 'text-violet-400', bg: 'bg-violet-500/15', icon: 'users' },
  }
  return map[type]
}

export function projectStatusConfig(status: ProjectStatus) {
  const map: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
    planning: { label: 'Planning', color: 'text-slate-400', bg: 'bg-slate-700/40', dot: 'bg-slate-500' },
    active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/15', dot: 'bg-emerald-500' },
    'on-hold': { label: 'On Hold', color: 'text-amber-400', bg: 'bg-amber-500/15', dot: 'bg-amber-500' },
    completed: { label: 'Completed', color: 'text-cyan-400', bg: 'bg-cyan-500/15', dot: 'bg-cyan-500' },
    'at-risk': { label: 'At Risk', color: 'text-rose-400', bg: 'bg-rose-500/15', dot: 'bg-rose-500' },
  }
  return map[status]
}

export function projectHealthConfig(health: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    'on-track': { label: 'On Track', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    'at-risk': { label: 'At Risk', color: 'text-amber-400', bg: 'bg-amber-500/15' },
    delayed: { label: 'Delayed', color: 'text-rose-400', bg: 'bg-rose-500/15' },
  }
  return map[health] ?? map['on-track']
}

export function dueDateColor(days: number): string {
  if (days < 0) return 'text-rose-400'
  if (days <= 2) return 'text-amber-400'
  return 'text-slate-400'
}

import type { NoticePriority, NoticeCategory, MeetingStatus } from './types'

export function noticePriorityConfig(priority: NoticePriority) {
  const map: Record<NoticePriority, { label: string; color: string; bg: string; border: string }> = {
    info: { label: 'Info', color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
    important: { label: 'Important', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
    urgent: { label: 'Urgent', color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  }
  return map[priority]
}

export function noticeCategoryConfig(category: NoticeCategory) {
  const map: Record<NoticeCategory, { label: string; color: string; bg: string; icon: string }> = {
    company: { label: 'Company', color: 'text-cyan-400', bg: 'bg-cyan-500/15', icon: 'building' },
    policy: { label: 'Policy', color: 'text-violet-400', bg: 'bg-violet-500/15', icon: 'shield' },
    event: { label: 'Event', color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: 'calendar' },
    system: { label: 'System', color: 'text-amber-400', bg: 'bg-amber-500/15', icon: 'server' },
    hr: { label: 'HR', color: 'text-blue-400', bg: 'bg-blue-500/15', icon: 'users' },
  }
  return map[category]
}

export function meetingStatusConfig(status: MeetingStatus) {
  const map: Record<MeetingStatus, { label: string; color: string; bg: string; dot: string }> = {
    scheduled: { label: 'Scheduled', color: 'text-cyan-400', bg: 'bg-cyan-500/15', dot: 'bg-cyan-500' },
    live: { label: 'Live Now', color: 'text-rose-400', bg: 'bg-rose-500/15', dot: 'bg-rose-500' },
    completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/15', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-700/40', dot: 'bg-slate-600' },
  }
  return map[status]
}

export function platformConfig(platform: string) {
  const map: Record<string, { color: string; bg: string }> = {
    Zoom: { color: 'text-blue-400', bg: 'bg-blue-500/15' },
    'Google Meet': { color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    Teams: { color: 'text-violet-400', bg: 'bg-violet-500/15' },
    'In-Person': { color: 'text-amber-400', bg: 'bg-amber-500/15' },
  }
  return map[platform] ?? map['Zoom']
}

// ---- Internship helpers ----

import type { InternStatus } from './types'

export function internStatusConfig(status: InternStatus) {
  const map: Record<InternStatus, { label: string; color: string; bg: string; dot: string }> = {
    active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/15', dot: 'bg-emerald-500' },
    completed: { label: 'Completed', color: 'text-cyan-400', bg: 'bg-cyan-500/15', dot: 'bg-cyan-500' },
    'on-hold': { label: 'On Hold', color: 'text-amber-400', bg: 'bg-amber-500/15', dot: 'bg-amber-500' },
    terminated: { label: 'Terminated', color: 'text-rose-400', bg: 'bg-rose-500/15', dot: 'bg-rose-500' },
    'offer-extended': { label: 'Offer Extended', color: 'text-violet-400', bg: 'bg-violet-500/15', dot: 'bg-violet-500' },
  }
  return map[status]
}

export function recommendationConfig(rec: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    excellent: { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    good: { label: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    satisfactory: { label: 'Satisfactory', color: 'text-amber-400', bg: 'bg-amber-500/15' },
    'needs-improvement': { label: 'Needs Improvement', color: 'text-rose-400', bg: 'bg-rose-500/15' },
  }
  return map[rec] ?? map['satisfactory']
}
