import type { Employee, Activity, AppUsageStat, HourlyActivity } from './types'

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

function past(days: number): string {
  return new Date(today.getTime() - days * 86400000).toISOString().slice(0, 10)
}
function future(days: number): string {
  return new Date(today.getTime() + days * 86400000).toISOString().slice(0, 10)
}

function timeAgo(minutes: number): string {
  const d = new Date(now.getTime() - minutes * 60000)
  return d.toISOString()
}

function makeHourly(seed: number): HourlyActivity[] {
  const hours: HourlyActivity[] = []
  const base = [9, 10, 11, 12, 13, 14, 15, 16, 17]
  for (const h of base) {
    const factor = Math.sin((h + seed) * 1.3) * 0.5 + 0.5
    const active = Math.round(1800 + factor * 1500)
    hours.push({
      hour: h,
      activeSec: active,
      idleSec: 3600 - active,
      productivity: Math.round(40 + factor * 55),
    })
  }
  return hours
}

function makeApps(seed: number): AppUsageStat[] {
  const pools: AppUsageStat[][] = [
    [
      { app: 'VS Code', category: 'productive', durationSec: 9420, productivity: 95, icon: 'code' },
      { app: 'Chrome', category: 'neutral', durationSec: 5280, productivity: 60, icon: 'globe' },
      { app: 'Slack', category: 'communication', durationSec: 3120, productivity: 70, icon: 'message' },
      { app: 'Figma', category: 'productive', durationSec: 2880, productivity: 90, icon: 'pen' },
      { app: 'Terminal', category: 'productive', durationSec: 2160, productivity: 92, icon: 'terminal' },
      { app: 'Spotify', category: 'neutral', durationSec: 5400, productivity: 30, icon: 'music' },
      { app: 'YouTube', category: 'distracting', durationSec: 1620, productivity: 10, icon: 'play' },
    ],
    [
      { app: 'Excel', category: 'productive', durationSec: 8460, productivity: 88, icon: 'sheet' },
      { app: 'Outlook', category: 'communication', durationSec: 6120, productivity: 75, icon: 'mail' },
      { app: 'Teams', category: 'communication', durationSec: 5400, productivity: 72, icon: 'message' },
      { app: 'Chrome', category: 'neutral', durationSec: 7200, productivity: 55, icon: 'globe' },
      { app: 'PowerPoint', category: 'productive', durationSec: 2700, productivity: 85, icon: 'presentation' },
      { app: 'Twitter', category: 'distracting', durationSec: 1260, productivity: 5, icon: 'bird' },
    ],
    [
      { app: 'Figma', category: 'productive', durationSec: 10800, productivity: 92, icon: 'pen' },
      { app: 'Slack', category: 'communication', durationSec: 4320, productivity: 68, icon: 'message' },
      { app: 'Chrome', category: 'neutral', durationSec: 6480, productivity: 58, icon: 'globe' },
      { app: 'Photoshop', category: 'productive', durationSec: 3600, productivity: 90, icon: 'image' },
      { app: 'Spotify', category: 'neutral', durationSec: 7200, productivity: 25, icon: 'music' },
      { app: 'Netflix', category: 'distracting', durationSec: 900, productivity: 2, icon: 'play' },
    ],
  ]
  return pools[seed % pools.length]
}

function makeActivities(seed: number): Activity[] {
  const apps = makeApps(seed)
  const titles = [
    'main.tsx — Workspace',
    'Q3 Financial Report.xlsx',
    'Dashboard Design — Figma',
    'GitHub — Pull Request #142',
    'Inbox — Outlook',
    'Team Standup — Slack',
    'API Documentation',
    'Client Proposal v3.docx',
    'YouTube — Music Lo-Fi',
    'Twitter — Home',
  ]
  const acts: Activity[] = []
  let t = 0
  for (let i = 0; i < 14; i++) {
    const app = apps[i % apps.length]
    acts.push({
      id: `act-${seed}-${i}`,
      timestamp: timeAgo(t),
      app: app.app,
      windowTitle: titles[i % titles.length],
      category: app.category,
      durationSec: Math.round(120 + Math.sin(i + seed) * 100 + 200),
      productivity: app.productivity,
      screenshot: i % 4 === 0,
    })
    t += acts[i].durationSec / 60 + 2
  }
  return acts
}

function makeTrends(seed: number) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, i) => ({
    day,
    productivity: Math.round(50 + Math.sin(i + seed * 2) * 25 + 20),
    hours: Math.round((4 + Math.sin(i + seed) * 2 + 3) * 10) / 10,
  }))
}

function fmtTime(h: number, m: number) {
  const d = new Date(today)
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export const employees: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@acme.io',
    role: 'Senior Frontend Engineer',
    department: 'Engineering',
    avatar: '/avatars/emp1.jpg',
    status: 'active',
    device: 'MacBook Pro 16"',
    os: 'macOS Sonoma 14.4',
    ip: '192.168.1.42',
    location: 'Austin, TX',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    clockIn: '08:52',
    clockOut: null,
    activeTimeSec: 24300,
    idleTimeSec: 1800,
    awayTimeSec: 600,
    productivity: 87,
    lastActivity: timeAgo(1),
    cpuUsage: 34,
    ramUsage: 62,
    diskUsage: 71,
    battery: 78,
    online: true,
    webcamVerified: true,
    keystrokes: 18420,
    mouseClicks: 8240,
    mouseMoves: 42180,
    screenshotsTaken: 42,
    apps: makeApps(0),
    hourly: makeHourly(0),
    activities: makeActivities(0),
    trends: makeTrends(0),
  },
  {
    id: 'EMP-002',
    name: 'Marcus Johnson',
    email: 'marcus.j@acme.io',
    role: 'Financial Analyst',
    department: 'Finance',
    avatar: '/avatars/emp2.jpg',
    status: 'meeting',
    device: 'Dell Latitude 7440',
    os: 'Windows 11 Pro',
    ip: '10.0.4.118',
    location: 'Denver, CO',
    shiftStart: '08:30',
    shiftEnd: '17:00',
    clockIn: '08:24',
    clockOut: null,
    activeTimeSec: 26100,
    idleTimeSec: 2100,
    awayTimeSec: 1200,
    productivity: 76,
    lastActivity: timeAgo(3),
    cpuUsage: 52,
    ramUsage: 71,
    diskUsage: 64,
    battery: 45,
    online: true,
    webcamVerified: true,
    keystrokes: 12100,
    mouseClicks: 6420,
    mouseMoves: 28400,
    screenshotsTaken: 38,
    apps: makeApps(1),
    hourly: makeHourly(1),
    activities: makeActivities(1),
    trends: makeTrends(1),
  },
  {
    id: 'EMP-003',
    name: 'Priya Patel',
    email: 'priya.patel@acme.io',
    role: 'UX Designer',
    department: 'Design',
    avatar: '/avatars/emp3.jpg',
    status: 'active',
    device: 'MacBook Air 15"',
    os: 'macOS Ventura 13.6',
    ip: '172.16.8.22',
    location: 'Seattle, WA',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    clockIn: '09:05',
    clockOut: null,
    activeTimeSec: 21600,
    idleTimeSec: 2700,
    awayTimeSec: 900,
    productivity: 91,
    lastActivity: timeAgo(0),
    cpuUsage: 28,
    ramUsage: 54,
    diskUsage: 48,
    battery: 92,
    online: true,
    webcamVerified: true,
    keystrokes: 9800,
    mouseClicks: 12400,
    mouseMoves: 58200,
    screenshotsTaken: 51,
    apps: makeApps(2),
    hourly: makeHourly(2),
    activities: makeActivities(2),
    trends: makeTrends(2),
  },
  {
    id: 'EMP-004',
    name: 'David Kim',
    email: 'david.kim@acme.io',
    role: 'Sales Representative',
    department: 'Sales',
    avatar: '/avatars/emp4.jpg',
    status: 'idle',
    device: 'HP EliteBook 840',
    os: 'Windows 11 Pro',
    ip: '10.0.4.201',
    location: 'Chicago, IL',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    clockIn: '09:18',
    clockOut: null,
    activeTimeSec: 16200,
    idleTimeSec: 5400,
    awayTimeSec: 2400,
    productivity: 58,
    lastActivity: timeAgo(18),
    cpuUsage: 12,
    ramUsage: 43,
    diskUsage: 55,
    battery: 22,
    online: true,
    webcamVerified: false,
    keystrokes: 6200,
    mouseClicks: 3100,
    mouseMoves: 14200,
    screenshotsTaken: 24,
    apps: makeApps(1),
    hourly: makeHourly(3),
    activities: makeActivities(3),
    trends: makeTrends(3),
  },
  {
    id: 'EMP-005',
    name: 'Elena Rodriguez',
    email: 'elena.r@acme.io',
    role: 'Backend Engineer',
    department: 'Engineering',
    avatar: '/avatars/emp5.jpg',
    status: 'active',
    device: 'MacBook Pro 14"',
    os: 'macOS Sonoma 14.4',
    ip: '192.168.1.88',
    location: 'Remote, CA',
    shiftStart: '10:00',
    shiftEnd: '18:00',
    clockIn: '09:58',
    clockOut: null,
    activeTimeSec: 18900,
    idleTimeSec: 1500,
    awayTimeSec: 300,
    productivity: 93,
    lastActivity: timeAgo(0),
    cpuUsage: 61,
    ramUsage: 78,
    diskUsage: 82,
    battery: 64,
    online: true,
    webcamVerified: true,
    keystrokes: 22100,
    mouseClicks: 7800,
    mouseMoves: 38600,
    screenshotsTaken: 47,
    apps: makeApps(0),
    hourly: makeHourly(4),
    activities: makeActivities(4),
    trends: makeTrends(4),
  },
  {
    id: 'EMP-006',
    name: 'James Wilson',
    email: 'james.w@acme.io',
    role: 'Product Manager',
    department: 'Product',
    avatar: '/avatars/emp6.jpg',
    status: 'break',
    device: 'ThinkPad X1 Carbon',
    os: 'Ubuntu 22.04 LTS',
    ip: '10.0.2.55',
    location: 'Boston, MA',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    clockIn: '08:45',
    clockOut: null,
    activeTimeSec: 19800,
    idleTimeSec: 3600,
    awayTimeSec: 1800,
    productivity: 72,
    lastActivity: timeAgo(12),
    cpuUsage: 22,
    ramUsage: 58,
    diskUsage: 67,
    battery: 88,
    online: true,
    webcamVerified: true,
    keystrokes: 14200,
    mouseClicks: 5600,
    mouseMoves: 24800,
    screenshotsTaken: 33,
    apps: makeApps(1),
    hourly: makeHourly(5),
    activities: makeActivities(5),
    trends: makeTrends(5),
  },
  {
    id: 'EMP-007',
    name: 'Aisha Mohammed',
    email: 'aisha.m@acme.io',
    role: 'QA Engineer',
    department: 'Engineering',
    avatar: '/avatars/emp1.jpg',
    status: 'offline',
    device: 'MacBook Air 13"',
    os: 'macOS Ventura 13.6',
    ip: '192.168.1.91',
    location: 'Atlanta, GA',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    clockIn: '09:02',
    clockOut: '17:04',
    activeTimeSec: 27800,
    idleTimeSec: 2400,
    awayTimeSec: 800,
    productivity: 84,
    lastActivity: timeAgo(640),
    cpuUsage: 0,
    ramUsage: 0,
    diskUsage: 60,
    battery: 0,
    online: false,
    webcamVerified: true,
    keystrokes: 16800,
    mouseClicks: 7200,
    mouseMoves: 31200,
    screenshotsTaken: 40,
    apps: makeApps(0),
    hourly: makeHourly(6),
    activities: makeActivities(6),
    trends: makeTrends(6),
  },
  {
    id: 'EMP-008',
    name: 'Thomas Müller',
    email: 'thomas.m@acme.io',
    role: 'DevOps Engineer',
    department: 'Engineering',
    avatar: '/avatars/emp2.jpg',
    status: 'active',
    device: 'Custom Desktop',
    os: 'Windows 11 Pro',
    ip: '10.0.6.14',
    location: 'Portland, OR',
    shiftStart: '08:00',
    shiftEnd: '16:00',
    clockIn: '07:55',
    clockOut: null,
    activeTimeSec: 28800,
    idleTimeSec: 1200,
    awayTimeSec: 200,
    productivity: 89,
    lastActivity: timeAgo(0),
    cpuUsage: 47,
    ramUsage: 83,
    diskUsage: 91,
    battery: 100,
    online: true,
    webcamVerified: true,
    keystrokes: 19400,
    mouseClicks: 6900,
    mouseMoves: 35400,
    screenshotsTaken: 55,
    apps: makeApps(0),
    hourly: makeHourly(7),
    activities: makeActivities(7),
    trends: makeTrends(7),
  },
]

export function getEmployee(id: string): Employee | undefined {
  return employees.find((e) => e.id === id)
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function formatTimeAgo(iso: string): string {
  const diff = (now.getTime() - new Date(iso).getTime()) / 60000
  if (diff < 1) return 'just now'
  if (diff < 60) return `${Math.round(diff)}m ago`
  const h = Math.floor(diff / 60)
  return `${h}h ${Math.round(diff % 60)}m ago`
}

// =================== Office Management Data ===================

import type {
  AttendanceRecord,
  AttendanceSummary,
  Task,
  Project,
} from './types'

const dates = (() => {
  const arr: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    arr.push(d.toISOString().slice(0, 10))
  }
  return arr
})()

function attStatus(seed: number, dayIdx: number): AttendanceRecord['status'] {
  const r = Math.sin(seed * 7 + dayIdx * 3.7) * 0.5 + 0.5
  if (r > 0.92) return 'leave'
  if (r > 0.85) return 'absent'
  if (r > 0.75) return 'half-day'
  if (r > 0.6) return 'late'
  if (r > 0.3) return 'present'
  return 'remote'
}

function clockInTime(status: AttendanceRecord['status'], shiftStart: string): string | null {
  if (status === 'absent' || status === 'leave') return null
  const [sh, sm] = shiftStart.split(':').map(Number)
  let delta = 0
  if (status === 'late') delta = 18 + Math.round(Math.random() * 25)
  if (status === 'present') delta = -8 + Math.round(Math.random() * 10)
  if (status === 'remote') delta = -5 + Math.round(Math.random() * 15)
  if (status === 'half-day') delta = -5 + Math.round(Math.random() * 10)
  const total = sh * 60 + sm + delta
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function workedHours(status: AttendanceRecord['status']): number {
  switch (status) {
    case 'present': return 8 + Math.round(Math.random() * 20) / 10
    case 'remote': return 7.5 + Math.round(Math.random() * 15) / 10
    case 'late': return 7 + Math.round(Math.random() * 10) / 10
    case 'half-day': return 4 + Math.round(Math.random() * 5) / 10
    case 'absent': return 0
    case 'leave': return 0
  }
}

export const attendanceRecords: AttendanceRecord[] = (() => {
  const recs: AttendanceRecord[] = []
  employees.forEach((emp, seed) => {
    dates.forEach((date, dayIdx) => {
      const status = attStatus(seed, dayIdx)
      const wh = workedHours(status)
      const ot = wh > 8 ? Math.round((wh - 8) * 10) / 10 : 0
      const outH = Math.floor(8 + wh)
      const outM = Math.round((wh % 1) * 60)
      recs.push({
        id: `att-${emp.id}-${date}`,
        employeeId: emp.id,
        employeeName: emp.name,
        avatar: emp.avatar,
        department: emp.department,
        date,
        clockIn: clockInTime(status, emp.shiftStart),
        clockOut: status === 'absent' || status === 'leave' ? null : `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}`,
        status,
        workedHours: wh,
        overtimeHours: ot,
        shiftStart: emp.shiftStart,
        shiftEnd: emp.shiftEnd,
        note: status === 'leave' ? 'Approved leave' : status === 'absent' ? 'No show' : status === 'late' ? 'Late arrival' : undefined,
      })
    })
  })
  return recs
})()

export const attendanceSummaries: AttendanceSummary[] = employees.map((emp, seed) => {
  const empRecs = attendanceRecords.filter((r) => r.employeeId === emp.id)
  const present = empRecs.filter((r) => r.status === 'present').length
  const late = empRecs.filter((r) => r.status === 'late').length
  const absent = empRecs.filter((r) => r.status === 'absent').length
  const leave = empRecs.filter((r) => r.status === 'leave').length
  const remote = empRecs.filter((r) => r.status === 'remote').length
  const halfDay = empRecs.filter((r) => r.status === 'half-day').length
  const totalHours = Math.round(empRecs.reduce((s, r) => s + r.workedHours, 0) * 10) / 10
  const overtime = Math.round(empRecs.reduce((s, r) => s + r.overtimeHours, 0) * 10) / 10
  const attendanceRate = Math.round(((present + late + remote + halfDay) / empRecs.length) * 100)
  return {
    employeeId: emp.id,
    employeeName: emp.name,
    avatar: emp.avatar,
    department: emp.department,
    present,
    late,
    absent,
    leave,
    remote,
    halfDay,
    totalHours,
    overtime,
    attendanceRate,
  }
})

export const tasks: Task[] = [
  {
    id: 'TSK-001',
    title: 'Implement authentication flow with OAuth 2.0',
    description: 'Build the complete login/register flow using OAuth 2.0 with PKCE. Include social login (Google, GitHub) and email/password with 2FA support.',
    type: 'group',
    assigneeIds: ['EMP-001', 'EMP-005', 'EMP-007'],
    assigneeNames: ['Sarah Chen', 'Elena Rodriguez', 'Aisha Mohammed'],
    assigneeAvatars: ['/avatars/emp1.jpg', '/avatars/emp5.jpg', '/avatars/emp1.jpg'],
    group: 'Backend Squad',
    projectId: 'PRJ-001',
    projectName: 'Customer Portal v3',
    status: 'in-progress',
    priority: 'high',
    progress: 65,
    createdAt: dates[5],
    dueDate: new Date(today.getTime() + 4 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 40,
    loggedHours: 26,
    tags: ['backend', 'security', 'api'],
    comments: [
      { id: 'c1', author: 'Sarah Chen', avatar: '/avatars/emp1.jpg', text: 'OAuth flow is implemented, working on 2FA now.', timestamp: timeAgo(120) },
      { id: 'c2', author: 'Elena Rodriguez', avatar: '/avatars/emp5.jpg', text: 'Token refresh logic is ready for review.', timestamp: timeAgo(60) },
    ],
  },
  {
    id: 'TSK-002',
    title: 'Design dashboard wireframes for analytics module',
    description: 'Create low-fidelity wireframes for the new analytics dashboard. Include data viz components, filter panels, and export options.',
    type: 'individual',
    assigneeIds: ['EMP-003'],
    assigneeNames: ['Priya Patel'],
    assigneeAvatars: ['/avatars/emp3.jpg'],
    group: null,
    projectId: 'PRJ-001',
    projectName: 'Customer Portal v3',
    status: 'review',
    priority: 'medium',
    progress: 90,
    createdAt: dates[6],
    dueDate: new Date(today.getTime() + 1 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 16,
    loggedHours: 14,
    tags: ['design', 'ux', 'wireframes'],
    comments: [
      { id: 'c3', author: 'Priya Patel', avatar: '/avatars/emp3.jpg', text: 'Wireframes submitted for stakeholder review.', timestamp: timeAgo(30) },
    ],
  },
  {
    id: 'TSK-003',
    title: 'Q3 financial reconciliation report',
    description: 'Complete the Q3 reconciliation between internal ledger and bank statements. Flag and investigate any discrepancies over $500.',
    type: 'individual',
    assigneeIds: ['EMP-002'],
    assigneeNames: ['Marcus Johnson'],
    assigneeAvatars: ['/avatars/emp2.jpg'],
    group: null,
    projectId: 'PRJ-003',
    projectName: 'Q3 Financial Close',
    status: 'in-progress' as const,
    priority: 'urgent' as const,
    progress: 45,
    createdAt: dates[4],
    dueDate: new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 24,
    loggedHours: 11,
    tags: ['finance', 'report', 'urgent'],
    comments: [
      { id: 'c4', author: 'Marcus Johnson', avatar: '/avatars/emp2.jpg', text: 'Found 3 discrepancies, investigating transaction batch #4821.', timestamp: timeAgo(180) },
    ],
  },
  {
    id: 'TSK-004',
    title: 'Set up CI/CD pipeline with automated testing',
    description: 'Configure GitHub Actions for CI/CD with automated unit, integration, and e2e tests. Deploy to staging on every PR merge.',
    type: 'group',
    assigneeIds: ['EMP-008', 'EMP-005'],
    assigneeNames: ['Thomas Müller', 'Elena Rodriguez'],
    assigneeAvatars: ['/avatars/emp2.jpg', '/avatars/emp5.jpg'],
    group: 'DevOps Team',
    projectId: 'PRJ-002',
    projectName: 'Platform Infrastructure',
    status: 'done',
    priority: 'high',
    progress: 100,
    createdAt: dates[6],
    dueDate: dates[1],
    estimatedHours: 32,
    loggedHours: 34,
    tags: ['devops', 'ci-cd', 'automation'],
    comments: [
      { id: 'c5', author: 'Thomas Müller', avatar: '/avatars/emp2.jpg', text: 'Pipeline is live. All tests passing on staging.', timestamp: timeAgo(1440) },
    ],
  },
  {
    id: 'TSK-005',
    title: 'Prepare client demo presentation for Acme Corp',
    description: 'Create a 20-slide deck showcasing the v3 portal features, roadmap, and migration plan for the Acme Corp stakeholder meeting.',
    type: 'individual',
    assigneeIds: ['EMP-006'],
    assigneeNames: ['James Wilson'],
    assigneeAvatars: ['/avatars/emp6.jpg'],
    group: null,
    projectId: 'PRJ-001',
    projectName: 'Customer Portal v3',
    status: 'todo',
    priority: 'medium',
    progress: 0,
    createdAt: dates[3],
    dueDate: new Date(today.getTime() + 5 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 12,
    loggedHours: 0,
    tags: ['product', 'presentation', 'client'],
    comments: [],
  },
  {
    id: 'TSK-006',
    title: 'QA regression test suite for payment module',
    description: 'Write and execute regression tests for the payment processing module. Cover edge cases, failure scenarios, and refund flows.',
    type: 'individual',
    assigneeIds: ['EMP-007'],
    assigneeNames: ['Aisha Mohammed'],
    assigneeAvatars: ['/avatars/emp1.jpg'],
    group: null,
    projectId: 'PRJ-001',
    projectName: 'Customer Portal v3',
    status: 'in-progress',
    priority: 'high',
    progress: 55,
    createdAt: dates[4],
    dueDate: new Date(today.getTime() + 3 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 20,
    loggedHours: 12,
    tags: ['qa', 'testing', 'payments'],
    comments: [
      { id: 'c6', author: 'Aisha Mohammed', avatar: '/avatars/emp1.jpg', text: '12 test cases written, 8 passing. Found a bug in refund flow.', timestamp: timeAgo(90) },
    ],
  },
  {
    id: 'TSK-007',
    title: 'Migrate legacy database to PostgreSQL 16',
    description: 'Plan and execute the migration of the legacy MySQL database to PostgreSQL 16. Zero downtime required, with data validation at each step.',
    type: 'group',
    assigneeIds: ['EMP-008', 'EMP-005', 'EMP-001'],
    assigneeNames: ['Thomas Müller', 'Elena Rodriguez', 'Sarah Chen'],
    assigneeAvatars: ['/avatars/emp2.jpg', '/avatars/emp5.jpg', '/avatars/emp1.jpg'],
    group: 'Infrastructure Squad',
    projectId: 'PRJ-002',
    projectName: 'Platform Infrastructure',
    status: 'blocked',
    priority: 'urgent',
    progress: 30,
    createdAt: dates[6],
    dueDate: new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 60,
    loggedHours: 18,
    tags: ['database', 'migration', 'infra'],
    comments: [
      { id: 'c7', author: 'Thomas Müller', avatar: '/avatars/emp2.jpg', text: 'Blocked on DBA access credentials from IT.', timestamp: timeAgo(240) },
      { id: 'c8', author: 'Elena Rodriguez', avatar: '/avatars/emp5.jpg', text: 'Schema mapping is 80% done once access is restored.', timestamp: timeAgo(120) },
    ],
  },
  {
    id: 'TSK-008',
    title: 'Update brand guidelines and component library',
    description: 'Refresh the design system with new brand colors, typography, and a complete component library in Figma.',
    type: 'individual',
    assigneeIds: ['EMP-003'],
    assigneeNames: ['Priya Patel'],
    assigneeAvatars: ['/avatars/emp3.jpg'],
    group: null,
    projectId: 'PRJ-004',
    projectName: 'Brand Refresh 2024',
    status: 'in-progress',
    priority: 'low',
    progress: 40,
    createdAt: dates[5],
    dueDate: new Date(today.getTime() + 10 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 30,
    loggedHours: 12,
    tags: ['design', 'branding', 'figma'],
    comments: [],
  },
  {
    id: 'TSK-009',
    title: 'Sales outreach campaign for Q4 prospects',
    description: 'Contact 50 warm leads, schedule demos, and update CRM. Target 15% conversion rate to qualified pipeline.',
    type: 'individual',
    assigneeIds: ['EMP-004'],
    assigneeNames: ['David Kim'],
    assigneeAvatars: ['/avatars/emp4.jpg'],
    group: null,
    projectId: 'PRJ-005',
    projectName: 'Q4 Sales Pipeline',
    status: 'in-progress',
    priority: 'medium',
    progress: 25,
    createdAt: dates[3],
    dueDate: new Date(today.getTime() + 14 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 40,
    loggedHours: 10,
    tags: ['sales', 'outreach', 'crm'],
    comments: [
      { id: 'c9', author: 'David Kim', avatar: '/avatars/emp4.jpg', text: 'Contacted 12 prospects, 3 demos scheduled.', timestamp: timeAgo(200) },
    ],
  },
  {
    id: 'TSK-010',
    title: 'API rate limiting and request throttling',
    description: 'Implement rate limiting on all public API endpoints. Use token bucket algorithm with per-client limits.',
    type: 'individual',
    assigneeIds: ['EMP-005'],
    assigneeNames: ['Elena Rodriguez'],
    assigneeAvatars: ['/avatars/emp5.jpg'],
    group: null,
    projectId: 'PRJ-002',
    projectName: 'Platform Infrastructure',
    status: 'review',
    priority: 'high',
    progress: 85,
    createdAt: dates[4],
    dueDate: new Date(today.getTime() + 1 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 16,
    loggedHours: 14,
    tags: ['backend', 'api', 'security'],
    comments: [
      { id: 'c10', author: 'Elena Rodriguez', avatar: '/avatars/emp5.jpg', text: 'Token bucket implemented, PR #142 ready for review.', timestamp: timeAgo(45) },
    ],
  },
  {
    id: 'TSK-011',
    title: 'Weekly team standup and sprint planning',
    description: 'Facilitate the weekly sprint planning meeting. Groom backlog, assign story points, and set sprint goals.',
    type: 'group',
    assigneeIds: ['EMP-006', 'EMP-001', 'EMP-005', 'EMP-003', 'EMP-007', 'EMP-008'],
    assigneeNames: ['James Wilson', 'Sarah Chen', 'Elena Rodriguez', 'Priya Patel', 'Aisha Mohammed', 'Thomas Müller'],
    assigneeAvatars: ['/avatars/emp6.jpg', '/avatars/emp1.jpg', '/avatars/emp5.jpg', '/avatars/emp3.jpg', '/avatars/emp1.jpg', '/avatars/emp2.jpg'],
    group: 'Engineering Chapter',
    projectId: 'PRJ-001',
    projectName: 'Customer Portal v3',
    status: 'done',
    priority: 'medium',
    progress: 100,
    createdAt: dates[6],
    dueDate: dates[0],
    estimatedHours: 4,
    loggedHours: 4,
    tags: ['agile', 'planning', 'process'],
    comments: [],
  },
  {
    id: 'TSK-012',
    title: 'Frontend performance optimization — LCP below 2s',
    description: 'Optimize Largest Contentful Paint to under 2 seconds. Implement code splitting, image lazy loading, and CDN caching.',
    type: 'individual',
    assigneeIds: ['EMP-001'],
    assigneeNames: ['Sarah Chen'],
    assigneeAvatars: ['/avatars/emp1.jpg'],
    group: null,
    projectId: 'PRJ-001',
    projectName: 'Customer Portal v3',
    status: 'todo',
    priority: 'medium',
    progress: 0,
    createdAt: dates[2],
    dueDate: new Date(today.getTime() + 6 * 86400000).toISOString().slice(0, 10),
    estimatedHours: 20,
    loggedHours: 0,
    tags: ['frontend', 'performance', 'optimization'],
    comments: [],
  },
]

export const projects: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Customer Portal v3',
    code: 'CPV3',
    description: 'Complete rebuild of the customer-facing portal with new design system, OAuth auth, and analytics dashboard.',
    client: 'Internal',
    department: 'Engineering',
    status: 'active',
    progress: 62,
    startDate: dates[6],
    endDate: new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10),
    budget: 180000,
    spent: 112000,
    teamMembers: ['Sarah Chen', 'Elena Rodriguez', 'Priya Patel', 'Aisha Mohammed', 'James Wilson'],
    teamAvatars: ['/avatars/emp1.jpg', '/avatars/emp5.jpg', '/avatars/emp3.jpg', '/avatars/emp1.jpg', '/avatars/emp6.jpg'],
    teamSize: 5,
    totalTasks: 18,
    completedTasks: 8,
    inProgressTasks: 7,
    blockedTasks: 0,
    milestones: [
      { id: 'm1', title: 'Auth & Security Module', dueDate: dates[1], completed: true, progress: 100 },
      { id: 'm2', title: 'Analytics Dashboard', dueDate: new Date(today.getTime() + 10 * 86400000).toISOString().slice(0, 10), completed: false, progress: 65 },
      { id: 'm3', title: 'Payment Integration', dueDate: new Date(today.getTime() + 20 * 86400000).toISOString().slice(0, 10), completed: false, progress: 20 },
      { id: 'm4', title: 'Production Launch', dueDate: new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10), completed: false, progress: 0 },
    ],
    health: 'on-track',
    priority: 'high',
  },
  {
    id: 'PRJ-002',
    name: 'Platform Infrastructure',
    code: 'INFRA',
    description: 'Infrastructure modernization including CI/CD, database migration, API rate limiting, and monitoring stack.',
    client: 'Internal',
    department: 'Engineering',
    status: 'active',
    progress: 48,
    startDate: dates[6],
    endDate: new Date(today.getTime() + 45 * 86400000).toISOString().slice(0, 10),
    budget: 250000,
    spent: 138000,
    teamMembers: ['Thomas Müller', 'Elena Rodriguez', 'Sarah Chen'],
    teamAvatars: ['/avatars/emp2.jpg', '/avatars/emp5.jpg', '/avatars/emp1.jpg'],
    teamSize: 3,
    totalTasks: 22,
    completedTasks: 9,
    inProgressTasks: 5,
    blockedTasks: 3,
    milestones: [
      { id: 'm5', title: 'CI/CD Pipeline', dueDate: dates[1], completed: true, progress: 100 },
      { id: 'm6', title: 'DB Migration to PostgreSQL 16', dueDate: new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10), completed: false, progress: 30 },
      { id: 'm7', title: 'Monitoring & Alerting Stack', dueDate: new Date(today.getTime() + 25 * 86400000).toISOString().slice(0, 10), completed: false, progress: 15 },
      { id: 'm8', title: 'Production Cutover', dueDate: new Date(today.getTime() + 45 * 86400000).toISOString().slice(0, 10), completed: false, progress: 0 },
    ],
    health: 'at-risk',
    priority: 'high',
  },
  {
    id: 'PRJ-003',
    name: 'Q3 Financial Close',
    code: 'Q3FC',
    description: 'Complete Q3 financial reconciliation, reporting, and audit preparation.',
    client: 'Internal',
    department: 'Finance',
    status: 'active',
    progress: 55,
    startDate: dates[5],
    endDate: new Date(today.getTime() + 5 * 86400000).toISOString().slice(0, 10),
    budget: 45000,
    spent: 26000,
    teamMembers: ['Marcus Johnson'],
    teamAvatars: ['/avatars/emp2.jpg'],
    teamSize: 1,
    totalTasks: 8,
    completedTasks: 4,
    inProgressTasks: 3,
    blockedTasks: 0,
    milestones: [
      { id: 'm9', title: 'Ledger Reconciliation', dueDate: new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10), completed: false, progress: 45 },
      { id: 'm10', title: 'Audit Report Submission', dueDate: new Date(today.getTime() + 5 * 86400000).toISOString().slice(0, 10), completed: false, progress: 10 },
    ],
    health: 'on-track',
    priority: 'medium',
  },
  {
    id: 'PRJ-004',
    name: 'Brand Refresh 2024',
    code: 'BRND',
    description: 'Complete brand identity refresh including logo, color system, typography, and component library.',
    client: 'Internal',
    department: 'Design',
    status: 'on-hold',
    progress: 35,
    startDate: dates[6],
    endDate: new Date(today.getTime() + 60 * 86400000).toISOString().slice(0, 10),
    budget: 80000,
    spent: 28000,
    teamMembers: ['Priya Patel'],
    teamAvatars: ['/avatars/emp3.jpg'],
    teamSize: 1,
    totalTasks: 12,
    completedTasks: 4,
    inProgressTasks: 3,
    blockedTasks: 1,
    milestones: [
      { id: 'm11', title: 'Mood Board & Direction', dueDate: dates[3], completed: true, progress: 100 },
      { id: 'm12', title: 'Component Library v1', dueDate: new Date(today.getTime() + 20 * 86400000).toISOString().slice(0, 10), completed: false, progress: 40 },
      { id: 'm13', title: 'Brand Guidelines Doc', dueDate: new Date(today.getTime() + 40 * 86400000).toISOString().slice(0, 10), completed: false, progress: 10 },
    ],
    health: 'on-track',
    priority: 'low',
  },
  {
    id: 'PRJ-005',
    name: 'Q4 Sales Pipeline',
    code: 'Q4SP',
    description: 'Build and convert Q4 sales pipeline through outbound outreach, demos, and proposal generation.',
    client: 'Internal',
    department: 'Sales',
    status: 'active',
    progress: 28,
    startDate: dates[3],
    endDate: new Date(today.getTime() + 75 * 86400000).toISOString().slice(0, 10),
    budget: 120000,
    spent: 34000,
    teamMembers: ['David Kim', 'James Wilson'],
    teamAvatars: ['/avatars/emp4.jpg', '/avatars/emp6.jpg'],
    teamSize: 2,
    totalTasks: 10,
    completedTasks: 2,
    inProgressTasks: 5,
    blockedTasks: 0,
    milestones: [
      { id: 'm14', title: 'Lead List Generation', dueDate: dates[1], completed: true, progress: 100 },
      { id: 'm15', title: '50 Outreach Demos', dueDate: new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10), completed: false, progress: 25 },
      { id: 'm16', title: 'Q4 Target Close', dueDate: new Date(today.getTime() + 75 * 86400000).toISOString().slice(0, 10), completed: false, progress: 0 },
    ],
    health: 'on-track',
    priority: 'medium',
  },
  {
    id: 'PRJ-006',
    name: 'Mobile App MVP',
    code: 'MOBO',
    description: 'Build a React Native mobile app MVP with core portal features: auth, dashboard, and notifications.',
    client: 'Internal',
    department: 'Engineering',
    status: 'planning',
    progress: 8,
    startDate: new Date(today.getTime() + 3 * 86400000).toISOString().slice(0, 10),
    endDate: new Date(today.getTime() + 90 * 86400000).toISOString().slice(0, 10),
    budget: 200000,
    spent: 5000,
    teamMembers: ['Sarah Chen', 'Elena Rodriguez', 'Priya Patel'],
    teamAvatars: ['/avatars/emp1.jpg', '/avatars/emp5.jpg', '/avatars/emp3.jpg'],
    teamSize: 3,
    totalTasks: 6,
    completedTasks: 0,
    inProgressTasks: 1,
    blockedTasks: 0,
    milestones: [
      { id: 'm17', title: 'Tech Stack Selection', dueDate: new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10), completed: false, progress: 40 },
      { id: 'm18', title: 'Auth & Navigation', dueDate: new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10), completed: false, progress: 0 },
      { id: 'm19', title: 'MVP Release', dueDate: new Date(today.getTime() + 90 * 86400000).toISOString().slice(0, 10), completed: false, progress: 0 },
    ],
    health: 'on-track',
    priority: 'medium',
  },
]

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

export function getTasksForProject(projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId)
}

export function getTasksForEmployee(employeeId: string): Task[] {
  return tasks.filter((t) => t.assigneeIds.includes(employeeId))
}

export function getAttendanceForEmployee(employeeId: string): AttendanceRecord[] {
  return attendanceRecords.filter((r) => r.employeeId === employeeId)
}

export function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

// =================== Chat Data ===================

import type { ChatConversation, ChatMessage, Notice, Meeting } from './types'

export const chatConversations: ChatConversation[] = [
  {
    id: 'chat-1',
    type: 'direct',
    name: 'Sarah Chen',
    avatar: '/avatars/emp1.jpg',
    participantIds: ['EMP-001'],
    participantNames: ['Sarah Chen'],
    participantAvatars: ['/avatars/emp1.jpg'],
    unreadCount: 2,
    lastMessageTime: timeAgo(3),
    online: true,
    messages: [
      { id: 'm1', senderId: 'EMP-001', senderName: 'Sarah Chen', senderAvatar: '/avatars/emp1.jpg', text: 'Hey! Did you get a chance to review the OAuth PR?', timestamp: timeAgo(35), read: true },
      { id: 'm2', senderId: 'admin', senderName: 'Admin', senderAvatar: '', text: 'Yes, just looked at it. The token refresh logic looks solid.', timestamp: timeAgo(20), read: true },
      { id: 'm3', senderId: 'EMP-001', senderName: 'Sarah Chen', senderAvatar: '/avatars/emp1.jpg', text: 'Great! I also added 2FA support. Can you test the flow?', timestamp: timeAgo(5), read: false },
      { id: 'm4', senderId: 'EMP-001', senderName: 'Sarah Chen', senderAvatar: '/avatars/emp1.jpg', text: 'The staging link is in the PR description.', timestamp: timeAgo(3), read: false },
    ],
  },
  {
    id: 'chat-2',
    type: 'group',
    name: 'Engineering Team',
    avatar: '',
    participantIds: ['EMP-001', 'EMP-005', 'EMP-007', 'EMP-008'],
    participantNames: ['Sarah Chen', 'Elena Rodriguez', 'Aisha Mohammed', 'Thomas Müller'],
    participantAvatars: ['/avatars/emp1.jpg', '/avatars/emp5.jpg', '/avatars/emp1.jpg', '/avatars/emp2.jpg'],
    unreadCount: 5,
    lastMessageTime: timeAgo(1),
    online: true,
    messages: [
      { id: 'm5', senderId: 'EMP-008', senderName: 'Thomas Müller', senderAvatar: '/avatars/emp2.jpg', text: 'CI/CD pipeline is now live! All tests passing on staging.', timestamp: timeAgo(60), read: true },
      { id: 'm6', senderId: 'EMP-005', senderName: 'Elena Rodriguez', senderAvatar: '/avatars/emp5.jpg', text: 'Excellent! That unblocks the rate limiting work.', timestamp: timeAgo(45), read: true },
      { id: 'm7', senderId: 'EMP-001', senderName: 'Sarah Chen', senderAvatar: '/avatars/emp1.jpg', text: 'Should we schedule a deployment review for Friday?', timestamp: timeAgo(30), read: true },
      { id: 'm8', senderId: 'EMP-007', senderName: 'Aisha Mohammed', senderAvatar: '/avatars/emp1.jpg', text: 'I found a bug in the refund flow during regression testing.', timestamp: timeAgo(10), read: false },
      { id: 'm9', senderId: 'EMP-005', senderName: 'Elena Rodriguez', senderAvatar: '/avatars/emp5.jpg', text: 'Can you create a ticket for that? I will look into it today.', timestamp: timeAgo(1), read: false },
    ],
  },
  {
    id: 'chat-3',
    type: 'direct',
    name: 'James Wilson',
    avatar: '/avatars/emp6.jpg',
    participantIds: ['EMP-006'],
    participantNames: ['James Wilson'],
    participantAvatars: ['/avatars/emp6.jpg'],
    unreadCount: 0,
    lastMessageTime: timeAgo(120),
    online: true,
    messages: [
      { id: 'm10', senderId: 'admin', senderName: 'Admin', senderAvatar: '', text: 'James, can you prepare the client demo deck by Friday?', timestamp: timeAgo(180), read: true },
      { id: 'm11', senderId: 'EMP-006', senderName: 'James Wilson', senderAvatar: '/avatars/emp6.jpg', text: 'Sure, I will start on it today. Any specific features to highlight?', timestamp: timeAgo(120), read: true },
    ],
  },
  {
    id: 'chat-4',
    type: 'group',
    name: 'Design Sync',
    avatar: '',
    participantIds: ['EMP-003', 'EMP-001'],
    participantNames: ['Priya Patel', 'Sarah Chen'],
    participantAvatars: ['/avatars/emp3.jpg', '/avatars/emp1.jpg'],
    unreadCount: 1,
    lastMessageTime: timeAgo(15),
    online: true,
    messages: [
      { id: 'm12', senderId: 'EMP-003', senderName: 'Priya Patel', senderAvatar: '/avatars/emp3.jpg', text: 'I uploaded the new dashboard wireframes to Figma.', timestamp: timeAgo(40), read: true },
      { id: 'm13', senderId: 'EMP-001', senderName: 'Sarah Chen', senderAvatar: '/avatars/emp1.jpg', text: 'Looks great! The filter panel placement is much better now.', timestamp: timeAgo(20), read: true },
      { id: 'm14', senderId: 'EMP-003', senderName: 'Priya Patel', senderAvatar: '/avatars/emp3.jpg', text: 'Thanks! I will finalize the component library update this week.', timestamp: timeAgo(15), read: false },
    ],
  },
  {
    id: 'chat-5',
    type: 'direct',
    name: 'Marcus Johnson',
    avatar: '/avatars/emp2.jpg',
    participantIds: ['EMP-002'],
    participantNames: ['Marcus Johnson'],
    participantAvatars: ['/avatars/emp2.jpg'],
    unreadCount: 0,
    lastMessageTime: timeAgo(240),
    online: true,
    messages: [
      { id: 'm15', senderId: 'EMP-002', senderName: 'Marcus Johnson', senderAvatar: '/avatars/emp2.jpg', text: 'The Q3 reconciliation is 45% done. Found 3 discrepancies so far.', timestamp: timeAgo(240), read: true },
      { id: 'm16', senderId: 'admin', senderName: 'Admin', senderAvatar: '', text: 'Good progress. Flag anything over $500 and we will investigate together.', timestamp: timeAgo(230), read: true },
    ],
  },
  {
    id: 'chat-6',
    type: 'direct',
    name: 'David Kim',
    avatar: '/avatars/emp4.jpg',
    participantIds: ['EMP-004'],
    participantNames: ['David Kim'],
    participantAvatars: ['/avatars/emp4.jpg'],
    unreadCount: 0,
    lastMessageTime: timeAgo(360),
    online: true,
    messages: [
      { id: 'm17', senderId: 'admin', senderName: 'Admin', senderAvatar: '', text: 'David, how is the Q4 outreach going?', timestamp: timeAgo(400), read: true },
      { id: 'm18', senderId: 'EMP-004', senderName: 'David Kim', senderAvatar: '/avatars/emp4.jpg', text: 'Contacted 12 prospects, 3 demos scheduled. On track for the target.', timestamp: timeAgo(360), read: true },
    ],
  },
]

// =================== Notices Data ===================

export const notices: Notice[] = [
  {
    id: 'NOT-001',
    title: 'Company Wide Q4 All-Hands Meeting',
    content: 'Our Q4 All-Hands meeting is scheduled for this Friday at 3:00 PM. We will cover Q3 results, Q4 roadmap, and team achievements. Attendance is mandatory for all employees. The meeting will be held via Zoom and the link will be shared 30 minutes before start.',
    category: 'event',
    priority: 'important',
    author: 'HR Department',
    authorAvatar: '',
    postedAt: timeAgo(60),
    pinned: true,
    readBy: ['EMP-001', 'EMP-002', 'EMP-003'],
    acknowledgments: ['EMP-001', 'EMP-002'],
  },
  {
    id: 'NOT-002',
    title: 'New VPN Security Policy Effective Monday',
    content: 'Starting Monday, all employees must connect through the corporate VPN before accessing internal tools. This is part of our enhanced security initiative. VPN setup instructions have been sent to your email. Contact IT support if you need assistance.',
    category: 'policy',
    priority: 'urgent',
    author: 'IT Security',
    authorAvatar: '',
    postedAt: timeAgo(180),
    pinned: true,
    readBy: ['EMP-001', 'EMP-005', 'EMP-008'],
    acknowledgments: ['EMP-001', 'EMP-005', 'EMP-008'],
  },
  {
    id: 'NOT-003',
    title: 'WFH Equipment Upgrade Program',
    content: 'We are launching a work-from-home equipment upgrade program. Eligible employees can request up to $500 for ergonomic chairs, monitors, or accessories. Submit your request through the HR portal by end of month.',
    category: 'hr',
    priority: 'info',
    author: 'HR Department',
    authorAvatar: '',
    postedAt: timeAgo(360),
    pinned: false,
    readBy: ['EMP-003', 'EMP-004'],
    acknowledgments: ['EMP-003'],
  },
  {
    id: 'NOT-004',
    title: 'Scheduled System Maintenance — Saturday 2-6 AM',
    content: 'The monitoring platform will undergo scheduled maintenance this Saturday from 2:00 AM to 6:00 AM EST. During this time, screenshots, activity tracking, and reports will be temporarily unavailable. All data will be backfilled after maintenance.',
    category: 'system',
    priority: 'important',
    author: 'IT Operations',
    authorAvatar: '',
    postedAt: timeAgo(480),
    pinned: false,
    readBy: ['EMP-001', 'EMP-002', 'EMP-005', 'EMP-006'],
    acknowledgments: ['EMP-001', 'EMP-005'],
  },
  {
    id: 'NOT-005',
    title: 'New Time-Off Request Process',
    content: 'We have streamlined the time-off request process. All leave requests must now be submitted through the attendance module at least 5 business days in advance. Manager approval is required for leaves longer than 2 days.',
    category: 'policy',
    priority: 'info',
    author: 'HR Department',
    authorAvatar: '',
    postedAt: timeAgo(720),
    pinned: false,
    readBy: ['EMP-003', 'EMP-007'],
    acknowledgments: [],
  },
  {
    id: 'NOT-006',
    title: 'Annual Performance Reviews Start Next Week',
    content: 'Annual performance reviews will begin next Monday. Please complete your self-assessment in the HR portal by Friday. Your manager will schedule a 1-on-1 review session. Reviews will cover goals, achievements, and development plans for next year.',
    category: 'company',
    priority: 'important',
    author: 'HR Department',
    authorAvatar: '',
    postedAt: timeAgo(1440),
    pinned: false,
    readBy: ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005'],
    acknowledgments: ['EMP-001', 'EMP-003', 'EMP-005'],
  },
  {
    id: 'NOT-007',
    title: 'Team Building Virtual Event — Next Thursday',
    content: 'Join us for a virtual team building event next Thursday at 5 PM! We will have online trivia, virtual escape rooms, and prizes. Sign up on the events portal. Families are welcome to join!',
    category: 'event',
    priority: 'info',
    author: 'HR Department',
    authorAvatar: '',
    postedAt: timeAgo(2880),
    pinned: false,
    readBy: [],
    acknowledgments: [],
  },
]

// =================== Meetings Data ===================

const todayStr = today.toISOString().slice(0, 10)
const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().slice(0, 10)
const dayAfterStr = new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10)
const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().slice(0, 10)
const lastWeekStr = new Date(today.getTime() - 3 * 86400000).toISOString().slice(0, 10)

export const meetings: Meeting[] = [
  {
    id: 'MTG-001',
    title: 'Daily Engineering Standup',
    description: 'Quick daily sync to discuss progress, blockers, and priorities for the day.',
    organizer: 'James Wilson',
    organizerAvatar: '/avatars/emp6.jpg',
    participantIds: ['EMP-001', 'EMP-005', 'EMP-007', 'EMP-008', 'EMP-006'],
    participantNames: ['Sarah Chen', 'Elena Rodriguez', 'Aisha Mohammed', 'Thomas Müller', 'James Wilson'],
    participantAvatars: ['/avatars/emp1.jpg', '/avatars/emp5.jpg', '/avatars/emp1.jpg', '/avatars/emp2.jpg', '/avatars/emp6.jpg'],
    date: todayStr,
    startTime: '09:00',
    endTime: '09:15',
    status: 'completed',
    platform: 'Google Meet',
    location: 'Virtual',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    agenda: ['Review yesterday progress', 'Discuss blockers', 'Plan today priorities'],
    projectName: 'Customer Portal v3',
    recordingAvailable: true,
  },
  {
    id: 'MTG-002',
    title: 'Sprint Planning — Portal v3',
    description: 'Plan the next 2-week sprint for the Customer Portal v3 project. Groom backlog and assign story points.',
    organizer: 'James Wilson',
    organizerAvatar: '/avatars/emp6.jpg',
    participantIds: ['EMP-001', 'EMP-005', 'EMP-003', 'EMP-007', 'EMP-006'],
    participantNames: ['Sarah Chen', 'Elena Rodriguez', 'Priya Patel', 'Aisha Mohammed', 'James Wilson'],
    participantAvatars: ['/avatars/emp1.jpg', '/avatars/emp5.jpg', '/avatars/emp3.jpg', '/avatars/emp1.jpg', '/avatars/emp6.jpg'],
    date: todayStr,
    startTime: '14:00',
    endTime: '15:30',
    status: 'live',
    platform: 'Zoom',
    location: 'Virtual',
    meetingLink: 'https://zoom.us/j/1234567890',
    agenda: ['Review sprint goals', 'Groom backlog items', 'Assign story points', 'Identify risks'],
    projectName: 'Customer Portal v3',
    recordingAvailable: false,
  },
  {
    id: 'MTG-003',
    title: 'Q3 Financial Review with CFO',
    description: 'Present Q3 financial reconciliation results and audit findings to the CFO.',
    organizer: 'Marcus Johnson',
    organizerAvatar: '/avatars/emp2.jpg',
    participantIds: ['EMP-002'],
    participantNames: ['Marcus Johnson'],
    participantAvatars: ['/avatars/emp2.jpg'],
    date: todayStr,
    startTime: '16:00',
    endTime: '17:00',
    status: 'scheduled',
    platform: 'Teams',
    location: 'Virtual',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/abc',
    agenda: ['Present reconciliation summary', 'Discuss discrepancies', 'Review audit timeline'],
    projectName: 'Q3 Financial Close',
    recordingAvailable: false,
  },
  {
    id: 'MTG-004',
    title: 'Design Review — Analytics Dashboard',
    description: 'Review the analytics dashboard wireframes and finalize the component design direction.',
    organizer: 'Priya Patel',
    organizerAvatar: '/avatars/emp3.jpg',
    participantIds: ['EMP-003', 'EMP-001', 'EMP-006'],
    participantNames: ['Priya Patel', 'Sarah Chen', 'James Wilson'],
    participantAvatars: ['/avatars/emp3.jpg', '/avatars/emp1.jpg', '/avatars/emp6.jpg'],
    date: tomorrowStr,
    startTime: '10:00',
    endTime: '11:00',
    status: 'scheduled',
    platform: 'Zoom',
    location: 'Virtual',
    meetingLink: 'https://zoom.us/j/9876543210',
    agenda: ['Review wireframes', 'Discuss data viz components', 'Finalize color system'],
    projectName: 'Customer Portal v3',
    recordingAvailable: false,
  },
  {
    id: 'MTG-005',
    title: 'Infrastructure Migration Sync',
    description: 'Sync on the PostgreSQL migration progress and unblock the DBA access issue.',
    organizer: 'Thomas Müller',
    organizerAvatar: '/avatars/emp2.jpg',
    participantIds: ['EMP-008', 'EMP-005', 'EMP-001'],
    participantNames: ['Thomas Müller', 'Elena Rodriguez', 'Sarah Chen'],
    participantAvatars: ['/avatars/emp2.jpg', '/avatars/emp5.jpg', '/avatars/emp1.jpg'],
    date: tomorrowStr,
    startTime: '13:00',
    endTime: '14:00',
    status: 'scheduled',
    platform: 'Google Meet',
    location: 'Virtual',
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    agenda: ['Review migration plan', 'Resolve DBA access blocker', 'Set cutover timeline'],
    projectName: 'Platform Infrastructure',
    recordingAvailable: false,
  },
  {
    id: 'MTG-006',
    title: 'Client Demo — Acme Corp',
    description: 'Demo the v3 portal features and migration plan to Acme Corp stakeholders.',
    organizer: 'James Wilson',
    organizerAvatar: '/avatars/emp6.jpg',
    participantIds: ['EMP-006', 'EMP-001', 'EMP-003', 'EMP-004'],
    participantNames: ['James Wilson', 'Sarah Chen', 'Priya Patel', 'David Kim'],
    participantAvatars: ['/avatars/emp6.jpg', '/avatars/emp1.jpg', '/avatars/emp3.jpg', '/avatars/emp4.jpg'],
    date: dayAfterStr,
    startTime: '11:00',
    endTime: '12:00',
    status: 'scheduled',
    platform: 'Zoom',
    location: 'Virtual',
    meetingLink: 'https://zoom.us/j/5555555555',
    agenda: ['Product overview', 'Feature demo', 'Migration roadmap', 'Q&A session'],
    projectName: 'Customer Portal v3',
    recordingAvailable: false,
  },
  {
    id: 'MTG-007',
    title: 'Weekly 1-on-1 — Sarah Chen',
    description: 'Weekly check-in to discuss progress, challenges, and career development.',
    organizer: 'James Wilson',
    organizerAvatar: '/avatars/emp6.jpg',
    participantIds: ['EMP-001', 'EMP-006'],
    participantNames: ['Sarah Chen', 'James Wilson'],
    participantAvatars: ['/avatars/emp1.jpg', '/avatars/emp6.jpg'],
    date: dayAfterStr,
    startTime: '15:00',
    endTime: '15:30',
    status: 'scheduled',
    platform: 'Google Meet',
    location: 'Virtual',
    meetingLink: 'https://meet.google.com/one-on-one',
    agenda: ['Review weekly progress', 'Discuss blockers', 'Career development goals'],
    recordingAvailable: false,
  },
  {
    id: 'MTG-008',
    title: 'API Design Review',
    description: 'Review the rate limiting API design and approve the implementation approach.',
    organizer: 'Elena Rodriguez',
    organizerAvatar: '/avatars/emp5.jpg',
    participantIds: ['EMP-005', 'EMP-001', 'EMP-008'],
    participantNames: ['Elena Rodriguez', 'Sarah Chen', 'Thomas Müller'],
    participantAvatars: ['/avatars/emp5.jpg', '/avatars/emp1.jpg', '/avatars/emp2.jpg'],
    date: yesterdayStr,
    startTime: '14:00',
    endTime: '15:00',
    status: 'completed',
    platform: 'Teams',
    location: 'Virtual',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/def',
    agenda: ['Review token bucket design', 'Discuss client limits', 'Approve implementation'],
    projectName: 'Platform Infrastructure',
    recordingAvailable: true,
  },
  {
    id: 'MTG-009',
    title: 'Q4 Sales Strategy Session',
    description: 'Define Q4 sales targets, outreach strategy, and pipeline conversion goals.',
    organizer: 'James Wilson',
    organizerAvatar: '/avatars/emp6.jpg',
    participantIds: ['EMP-004', 'EMP-006'],
    participantNames: ['David Kim', 'James Wilson'],
    participantAvatars: ['/avatars/emp4.jpg', '/avatars/emp6.jpg'],
    date: lastWeekStr,
    startTime: '10:00',
    endTime: '11:30',
    status: 'completed',
    platform: 'Zoom',
    location: 'Virtual',
    meetingLink: 'https://zoom.us/j/7777777777',
    agenda: ['Set Q4 targets', 'Define outreach strategy', 'Assign territories'],
    projectName: 'Q4 Sales Pipeline',
    recordingAvailable: true,
  },
  {
    id: 'MTG-010',
    title: 'Brand Direction Workshop',
    description: 'Collaborative workshop to define the new brand direction and visual identity.',
    organizer: 'Priya Patel',
    organizerAvatar: '/avatars/emp3.jpg',
    participantIds: ['EMP-003', 'EMP-006'],
    participantNames: ['Priya Patel', 'James Wilson'],
    participantAvatars: ['/avatars/emp3.jpg', '/avatars/emp6.jpg'],
    date: lastWeekStr,
    startTime: '13:00',
    endTime: '15:00',
    status: 'completed',
    platform: 'In-Person',
    location: 'HQ — Design Studio',
    meetingLink: '',
    agenda: ['Review mood boards', 'Discuss brand values', 'Select color direction'],
    projectName: 'Brand Refresh 2024',
    recordingAvailable: false,
  },
]

export function getMeetingsForEmployee(employeeId: string): Meeting[] {
  return meetings.filter((m) => m.participantIds.includes(employeeId) || m.organizer === employees.find((e) => e.id === employeeId)?.name)
}

export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// =================== Internship Data ===================

import type { Intern } from './types'

function makeWeeklyHours(seed: number) {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8']
  return weeks.map((week, i) => ({
    week,
    hours: Math.round((30 + Math.sin(i + seed * 2) * 8) * 10) / 10,
    productivity: Math.round(60 + Math.sin(i + seed) * 20 + 15),
  }))
}

export const interns: Intern[] = [
  {
    id: 'INT-001',
    name: 'Olivia Martinez',
    email: 'olivia.m@acme.io',
    avatar: '/avatars/emp1.jpg',
    university: 'Stanford University',
    degree: 'B.S. Computer Science',
    graduationYear: 2025,
    department: 'Engineering',
    position: 'Software Engineering Intern',
    mentorId: 'EMP-001',
    mentorName: 'Sarah Chen',
    mentorAvatar: '/avatars/emp1.jpg',
    status: 'active',
    startDate: past(42),
    endDate: future(48),
    duration: 12,
    progress: 35,
    hoursCompleted: 168,
    totalHours: 480,
    stipend: 4500,
    location: 'Remote, CA',
    phone: '+1 (555) 102-3456',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Git'],
    tasksCompleted: 12,
    tasksAssigned: 18,
    meetingsAttended: 24,
    evaluations: [
      { id: 'eval-1', date: past(21), evaluator: 'Sarah Chen', evaluatorAvatar: '/avatars/emp1.jpg', period: '30-Day Review', technical: 88, communication: 82, teamwork: 90, initiative: 85, overall: 86, feedback: 'Olivia has shown excellent progress in her first month. She picked up the React codebase quickly and has been contributing meaningfully to the frontend. Great attitude and eager to learn.', recommendation: 'excellent' },
    ],
    goals: [
      { id: 'g1', title: 'Complete React component library', description: 'Build 10 reusable components for the design system', dueDate: future(7), completed: false, progress: 60 },
      { id: 'g2', title: 'Ship a feature to production', description: 'Take a feature from design to deployment', dueDate: future(21), completed: false, progress: 30 },
      { id: 'g3', title: 'Present at engineering demo', description: 'Present your work at the monthly engineering demo', dueDate: future(35), completed: false, progress: 0 },
      { id: 'g4', title: 'Complete onboarding modules', description: 'Finish all required onboarding training modules', dueDate: past(7), completed: true, progress: 100 },
    ],
    weeklyHours: makeWeeklyHours(0),
    feedback: [
      { id: 'f1', author: 'Sarah Chen', avatar: '/avatars/emp1.jpg', text: 'Olivia did an excellent job on the authentication component. Clean code and great attention to detail.', date: past(5) },
      { id: 'f2', author: 'Elena Rodriguez', avatar: '/avatars/emp5.jpg', text: 'Quick learner and asks the right questions. Would love to have her on the team full-time.', date: past(14) },
    ],
  },
  {
    id: 'INT-002',
    name: 'Ryan Thompson',
    email: 'ryan.t@acme.io',
    avatar: '/avatars/emp2.jpg',
    university: 'MIT',
    degree: 'M.S. Data Science',
    graduationYear: 2024,
    department: 'Finance',
    position: 'Data Analytics Intern',
    mentorId: 'EMP-002',
    mentorName: 'Marcus Johnson',
    mentorAvatar: '/avatars/emp2.jpg',
    status: 'active',
    startDate: past(28),
    endDate: future(62),
    duration: 12,
    progress: 25,
    hoursCompleted: 112,
    totalHours: 480,
    stipend: 5000,
    location: 'Remote, NY',
    phone: '+1 (555) 203-4567',
    skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
    tasksCompleted: 8,
    tasksAssigned: 15,
    meetingsAttended: 16,
    evaluations: [
      { id: 'eval-2', date: past(14), evaluator: 'Marcus Johnson', evaluatorAvatar: '/avatars/emp2.jpg', period: '14-Day Check-in', technical: 80, communication: 75, teamwork: 78, initiative: 72, overall: 76, feedback: 'Ryan is off to a solid start. His SQL and Python skills are strong. He needs to work on communicating his findings more clearly to non-technical stakeholders.', recommendation: 'good' },
    ],
    goals: [
      { id: 'g5', title: 'Build Q3 financial dashboard', description: 'Create an interactive dashboard for Q3 financial data', dueDate: future(14), completed: false, progress: 45 },
      { id: 'g6', title: 'Automate monthly report', description: 'Write a script to automate the monthly financial report generation', dueDate: future(30), completed: false, progress: 15 },
      { id: 'g7', title: 'Complete finance onboarding', description: 'Finish all finance department onboarding modules', dueDate: past(7), completed: true, progress: 100 },
    ],
    weeklyHours: makeWeeklyHours(1),
    feedback: [
      { id: 'f3', author: 'Marcus Johnson', avatar: '/avatars/emp2.jpg', text: 'Ryan is great with data. His dashboard prototype looks promising.', date: past(3) },
    ],
  },
  {
    id: 'INT-003',
    name: 'Sophia Lee',
    email: 'sophia.l@acme.io',
    avatar: '/avatars/emp3.jpg',
    university: 'Rhode Island School of Design',
    degree: 'B.F.A. Graphic Design',
    graduationYear: 2025,
    department: 'Design',
    position: 'UX/UI Design Intern',
    mentorId: 'EMP-003',
    mentorName: 'Priya Patel',
    mentorAvatar: '/avatars/emp3.jpg',
    status: 'active',
    startDate: past(56),
    endDate: future(34),
    duration: 12,
    progress: 62,
    hoursCompleted: 224,
    totalHours: 480,
    stipend: 4000,
    location: 'Seattle, WA',
    phone: '+1 (555) 304-5678',
    skills: ['Figma', 'Photoshop', 'Illustrator', 'Prototyping', 'User Research'],
    tasksCompleted: 20,
    tasksAssigned: 22,
    meetingsAttended: 38,
    evaluations: [
      { id: 'eval-3', date: past(42), evaluator: 'Priya Patel', evaluatorAvatar: '/avatars/emp3.jpg', period: '30-Day Review', technical: 92, communication: 88, teamwork: 95, initiative: 90, overall: 91, feedback: 'Sophia is an outstanding intern. Her design sense is exceptional and she takes feedback constructively. She has already contributed to the component library and dashboard redesign. Highly recommend for a full-time offer.', recommendation: 'excellent' },
      { id: 'eval-4', date: past(14), evaluator: 'Priya Patel', evaluatorAvatar: '/avatars/emp3.jpg', period: '60-Day Review', technical: 94, communication: 90, teamwork: 93, initiative: 92, overall: 92, feedback: 'Continued excellence. Sophia has taken ownership of the analytics dashboard design and is mentoring the new intern. Outstanding performance.', recommendation: 'excellent' },
    ],
    goals: [
      { id: 'g8', title: 'Complete analytics dashboard design', description: 'Finalize all screens for the analytics dashboard', dueDate: future(7), completed: false, progress: 85 },
      { id: 'g9', title: 'Build component library v2', description: 'Design and document 20 new components', dueDate: past(7), completed: true, progress: 100 },
      { id: 'g10', title: 'Conduct user research study', description: 'Run usability tests with 10 users and report findings', dueDate: future(21), completed: false, progress: 40 },
      { id: 'g11', title: 'Present design portfolio', description: 'Present internship design work to the team', dueDate: future(28), completed: false, progress: 20 },
    ],
    weeklyHours: makeWeeklyHours(2),
    feedback: [
      { id: 'f4', author: 'Priya Patel', avatar: '/avatars/emp3.jpg', text: 'Sophia is incredibly talented. Her work on the dashboard has been transformative for the product.', date: past(7) },
      { id: 'f5', author: 'James Wilson', avatar: '/avatars/emp6.jpg', text: 'Exceptional design work. The stakeholders love the new dashboard direction.', date: past(10) },
    ],
  },
  {
    id: 'INT-004',
    name: 'Ethan Wright',
    email: 'ethan.w@acme.io',
    avatar: '/avatars/emp4.jpg',
    university: 'UC Berkeley',
    degree: 'B.S. Business Administration',
    graduationYear: 2024,
    department: 'Sales',
    position: 'Sales & Marketing Intern',
    mentorId: 'EMP-004',
    mentorName: 'David Kim',
    mentorAvatar: '/avatars/emp4.jpg',
    status: 'on-hold',
    startDate: past(70),
    endDate: future(20),
    duration: 12,
    progress: 58,
    hoursCompleted: 280,
    totalHours: 480,
    stipend: 3500,
    location: 'Chicago, IL',
    phone: '+1 (555) 405-6789',
    skills: ['CRM', 'Salesforce', 'Marketing', 'Communication', 'Analytics'],
    tasksCompleted: 14,
    tasksAssigned: 20,
    meetingsAttended: 30,
    evaluations: [
      { id: 'eval-5', date: past(42), evaluator: 'David Kim', evaluatorAvatar: '/avatars/emp4.jpg', period: '30-Day Review', technical: 72, communication: 85, teamwork: 80, initiative: 68, overall: 76, feedback: 'Ethan has good communication skills and builds rapport with prospects easily. He needs to improve his CRM data entry discipline and follow-up consistency.', recommendation: 'satisfactory' },
    ],
    goals: [
      { id: 'g12', title: 'Generate 50 qualified leads', description: 'Research and qualify 50 potential customer leads', dueDate: past(7), completed: true, progress: 100 },
      { id: 'g13', title: 'Conduct 20 sales calls', description: 'Complete 20 outbound sales calls with prospects', dueDate: future(7), completed: false, progress: 65 },
      { id: 'g14', title: 'Create marketing campaign', description: 'Design and launch a Q4 email marketing campaign', dueDate: future(14), completed: false, progress: 30 },
    ],
    weeklyHours: makeWeeklyHours(3),
    feedback: [
      { id: 'f6', author: 'David Kim', avatar: '/avatars/emp4.jpg', text: 'Ethan has potential but needs to be more proactive with follow-ups.', date: past(14) },
    ],
  },
  {
    id: 'INT-005',
    name: 'Maya Patel',
    email: 'maya.p@acme.io',
    avatar: '/avatars/emp5.jpg',
    university: 'Carnegie Mellon University',
    degree: 'B.S. Information Systems',
    graduationYear: 2024,
    department: 'Engineering',
    position: 'DevOps Intern',
    mentorId: 'EMP-008',
    mentorName: 'Thomas Müller',
    mentorAvatar: '/avatars/emp2.jpg',
    status: 'offer-extended',
    startDate: past(90),
    endDate: past(6),
    duration: 12,
    progress: 100,
    hoursCompleted: 480,
    totalHours: 480,
    stipend: 5000,
    location: 'Remote, OR',
    phone: '+1 (555) 506-7890',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
    tasksCompleted: 25,
    tasksAssigned: 25,
    meetingsAttended: 45,
    evaluations: [
      { id: 'eval-6', date: past(60), evaluator: 'Thomas Müller', evaluatorAvatar: '/avatars/emp2.jpg', period: '60-Day Review', technical: 90, communication: 82, teamwork: 88, initiative: 92, overall: 88, feedback: 'Maya is exceptional. She independently set up the monitoring stack and improved our CI/CD pipeline. She works like a full-time engineer.', recommendation: 'excellent' },
      { id: 'eval-7', date: past(14), evaluator: 'Thomas Müller', evaluatorAvatar: '/avatars/emp2.jpg', period: 'Final Evaluation', technical: 95, communication: 85, teamwork: 90, initiative: 95, overall: 91, feedback: 'Outstanding internship. Maya exceeded all expectations. She has been extended a full-time offer as a Junior DevOps Engineer. Highly recommended.', recommendation: 'excellent' },
    ],
    goals: [
      { id: 'g15', title: 'Set up monitoring stack', description: 'Configure Prometheus, Grafana, and alerting', dueDate: past(45), completed: true, progress: 100 },
      { id: 'g16', title: 'Improve CI/CD pipeline', description: 'Reduce build times by 30%', dueDate: past(30), completed: true, progress: 100 },
      { id: 'g17', title: 'Write infrastructure documentation', description: 'Document all infrastructure as code', dueDate: past(10), completed: true, progress: 100 },
      { id: 'g18', title: 'Present final project', description: 'Present internship project to engineering team', dueDate: past(7), completed: true, progress: 100 },
    ],
    weeklyHours: makeWeeklyHours(4),
    feedback: [
      { id: 'f7', author: 'Thomas Müller', avatar: '/avatars/emp2.jpg', text: 'Maya is the best intern I have mentored. She is getting a full-time offer!', date: past(7) },
      { id: 'f8', author: 'Elena Rodriguez', avatar: '/avatars/emp5.jpg', text: 'Working with Maya was a pleasure. She will be a great addition to the team.', date: past(10) },
    ],
  },
  {
    id: 'INT-006',
    name: 'Alex Chen',
    email: 'alex.c@acme.io',
    avatar: '/avatars/emp6.jpg',
    university: 'Georgia Tech',
    degree: 'B.S. Computer Science',
    graduationYear: 2025,
    department: 'Engineering',
    position: 'QA Engineering Intern',
    mentorId: 'EMP-007',
    mentorName: 'Aisha Mohammed',
    mentorAvatar: '/avatars/emp1.jpg',
    status: 'completed',
    startDate: past(120),
    endDate: past(20),
    duration: 12,
    progress: 100,
    hoursCompleted: 480,
    totalHours: 480,
    stipend: 4500,
    location: 'Remote, GA',
    phone: '+1 (555) 607-8901',
    skills: ['Selenium', 'Cypress', 'JavaScript', 'Testing', 'Bug Tracking'],
    tasksCompleted: 22,
    tasksAssigned: 22,
    meetingsAttended: 42,
    evaluations: [
      { id: 'eval-8', date: past(90), evaluator: 'Aisha Mohammed', evaluatorAvatar: '/avatars/emp1.jpg', period: '60-Day Review', technical: 82, communication: 78, teamwork: 85, initiative: 75, overall: 80, feedback: 'Alex is a solid QA intern. He writes thorough test cases and finds good bugs. Could improve his communication with developers when reporting issues.', recommendation: 'good' },
      { id: 'eval-9', date: past(25), evaluator: 'Aisha Mohammed', evaluatorAvatar: '/avatars/emp1.jpg', period: 'Final Evaluation', technical: 85, communication: 82, teamwork: 88, initiative: 80, overall: 84, feedback: 'Good performance throughout the internship. Alex built a solid test automation framework. We will keep in touch for future opportunities.', recommendation: 'good' },
    ],
    goals: [
      { id: 'g19', title: 'Build test automation framework', description: 'Set up Cypress test automation from scratch', dueDate: past(60), completed: true, progress: 100 },
      { id: 'g20', title: 'Achieve 80% test coverage', description: 'Write tests to cover 80% of critical paths', dueDate: past(30), completed: true, progress: 100 },
      { id: 'g21', title: 'Document testing process', description: 'Create a testing guide for the team', dueDate: past(15), completed: true, progress: 100 },
    ],
    weeklyHours: makeWeeklyHours(5),
    feedback: [
      { id: 'f9', author: 'Aisha Mohammed', avatar: '/avatars/emp1.jpg', text: 'Alex built a great test framework. We will miss having him on the team.', date: past(20) },
    ],
  },
]

export function getIntern(id: string): Intern | undefined {
  return interns.find((i) => i.id === id)
}

export function getActiveInterns(): Intern[] {
  return interns.filter((i) => i.status === 'active')
}
