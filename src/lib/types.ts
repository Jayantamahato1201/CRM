export type EmployeeStatus = 'active' | 'idle' | 'offline' | 'break' | 'meeting'

export interface Activity {
  id: string
  timestamp: string
  app: string
  windowTitle: string
  category: 'productive' | 'neutral' | 'distracting' | 'communication' | 'system'
  durationSec: number
  productivity: number
  screenshot?: boolean
}

export interface AppUsageStat {
  app: string
  category: Activity['category']
  durationSec: number
  productivity: number
  icon: string
}

export interface HourlyActivity {
  hour: number
  activeSec: number
  idleSec: number
  productivity: number
}

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar: string
  status: EmployeeStatus
  device: string
  os: string
  ip: string
  location: string
  shiftStart: string
  shiftEnd: string
  clockIn: string | null
  clockOut: string | null
  activeTimeSec: number
  idleTimeSec: number
  awayTimeSec: number
  productivity: number
  lastActivity: string
  cpuUsage: number
  ramUsage: number
  diskUsage: number
  battery: number
  online: boolean
  webcamVerified: boolean
  keystrokes: number
  mouseClicks: number
  mouseMoves: number
  screenshotsTaken: number
  apps: AppUsageStat[]
  hourly: HourlyActivity[]
  activities: Activity[]
  trends: { day: string; productivity: number; hours: number }[]
}

// ---- Office Management Types ----

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'remote' | 'half-day'

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  date: string
  clockIn: string | null
  clockOut: string | null
  status: AttendanceStatus
  workedHours: number
  overtimeHours: number
  shiftStart: string
  shiftEnd: string
  note?: string
}

export interface AttendanceSummary {
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  present: number
  late: number
  absent: number
  leave: number
  remote: number
  halfDay: number
  totalHours: number
  overtime: number
  attendanceRate: number
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'
export type TaskType = 'individual' | 'group'

export interface TaskComment {
  id: string
  author: string
  avatar: string
  text: string
  timestamp: string
}

export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  assigneeIds: string[]
  assigneeNames: string[]
  assigneeAvatars: string[]
  group: string | null
  projectId: string
  projectName: string
  status: TaskStatus
  priority: TaskPriority
  progress: number
  createdAt: string
  dueDate: string
  estimatedHours: number
  loggedHours: number
  tags: string[]
  comments: TaskComment[]
}

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'at-risk'

export interface Milestone {
  id: string
  title: string
  dueDate: string
  completed: boolean
  progress: number
}

export interface Project {
  id: string
  name: string
  code: string
  description: string
  client: string
  department: string
  status: ProjectStatus
  progress: number
  startDate: string
  endDate: string
  budget: number
  spent: number
  teamMembers: string[]
  teamAvatars: string[]
  teamSize: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
  milestones: Milestone[]
  health: 'on-track' | 'at-risk' | 'delayed'
  priority: 'low' | 'medium' | 'high'
}

// ---- Chat Types ----

export interface ChatAttachment {
  id: string
  name: string
  size: number
  type: string
  dataUrl: string
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  text: string
  timestamp: string
  read: boolean
  attachments?: ChatAttachment[]
}

export interface ChatConversation {
  id: string
  type: 'direct' | 'group'
  name: string
  avatar: string
  participantIds: string[]
  participantNames: string[]
  participantAvatars: string[]
  messages: ChatMessage[]
  unreadCount: number
  lastMessageTime: string
  online: boolean
}

// ---- Notice Types ----

export type NoticePriority = 'info' | 'important' | 'urgent'
export type NoticeCategory = 'company' | 'policy' | 'event' | 'system' | 'hr'

export interface Notice {
  id: string
  title: string
  content: string
  category: NoticeCategory
  priority: NoticePriority
  author: string
  authorAvatar: string
  postedAt: string
  pinned: boolean
  readBy: string[]
  acknowledgments: string[]
}

// ---- Meeting Types ----

export type MeetingStatus = 'scheduled' | 'live' | 'completed' | 'cancelled'

export interface Meeting {
  id: string
  title: string
  description: string
  organizer: string
  organizerAvatar: string
  participantIds: string[]
  participantNames: string[]
  participantAvatars: string[]
  date: string
  startTime: string
  endTime: string
  status: MeetingStatus
  platform: 'Zoom' | 'Google Meet' | 'Teams' | 'In-Person'
  location: string
  meetingLink: string
  agenda: string[]
  projectId?: string
  projectName?: string
  recordingAvailable: boolean
}

// ---- Internship Types ----

export type InternStatus = 'active' | 'completed' | 'on-hold' | 'terminated' | 'offer-extended'

export interface InternEvaluation {
  id: string
  date: string
  evaluator: string
  evaluatorAvatar: string
  period: string
  technical: number
  communication: number
  teamwork: number
  initiative: number
  overall: number
  feedback: string
  recommendation: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement'
}

export interface InternGoal {
  id: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  progress: number
}

export interface Intern {
  id: string
  name: string
  email: string
  avatar: string
  university: string
  degree: string
  graduationYear: number
  department: string
  position: string
  mentorId: string
  mentorName: string
  mentorAvatar: string
  status: InternStatus
  startDate: string
  endDate: string
  duration: number
  progress: number
  hoursCompleted: number
  totalHours: number
  stipend: number
  location: string
  phone: string
  skills: string[]
  tasksCompleted: number
  tasksAssigned: number
  meetingsAttended: number
  evaluations: InternEvaluation[]
  goals: InternGoal[]
  weeklyHours: { week: string; hours: number; productivity: number }[]
  feedback: { id: string; author: string; avatar: string; text: string; date: string }[]
}
