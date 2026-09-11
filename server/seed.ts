import type Database from 'better-sqlite3'
import { employees as seedEmployees, tasks as seedTasks, projects as seedProjects, meetings as seedMeetings, notices as seedNotices, chatConversations as seedChats } from './seed-data'

export function seedDatabase(db: Database.Database) {
  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }
  if (count.c > 0) return

  // Seed users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, name, role, avatar, department, employee_id)
    VALUES (@id, @email, @password, @name, @role, @avatar, @department, @employee_id)
  `)
  const users = [
    { id: 'admin-001', email: 'admin@acme.io', password: 'admin123', name: 'Admin Console', role: 'admin', avatar: '', department: '', employee_id: null },
    { id: 'EMP-001', email: 'sarah.chen@acme.io', password: 'employee123', name: 'Sarah Chen', role: 'employer', avatar: '/avatars/emp1.jpg', department: 'Engineering', employee_id: 'EMP-001' },
    { id: 'EMP-002', email: 'marcus.j@acme.io', password: 'employee123', name: 'Marcus Johnson', role: 'employer', avatar: '/avatars/emp2.jpg', department: 'Finance', employee_id: 'EMP-002' },
    { id: 'EMP-003', email: 'priya.patel@acme.io', password: 'employee123', name: 'Priya Patel', role: 'employer', avatar: '/avatars/emp3.jpg', department: 'Design', employee_id: 'EMP-003' },
  ]
  for (const u of users) insertUser.run(u)

  // Seed employees
  const insertEmp = db.prepare(`
    INSERT INTO employees (id, name, email, role, department, avatar, status, device, os, ip, location,
      shift_start, shift_end, clock_in, clock_out, active_time_sec, idle_time_sec, away_time_sec,
      productivity, last_activity, cpu_usage, ram_usage, disk_usage, battery, online, webcam_verified,
      keystrokes, mouse_clicks, mouse_moves, screenshots_taken)
    VALUES (@id, @name, @email, @role, @department, @avatar, @status, @device, @os, @ip, @location,
      @shift_start, @shift_end, @clock_in, @clock_out, @active_time_sec, @idle_time_sec, @away_time_sec,
      @productivity, @last_activity, @cpu_usage, @ram_usage, @disk_usage, @battery, @online, @webcam_verified,
      @keystrokes, @mouse_clicks, @mouse_moves, @screenshots_taken)
  `)
  for (const e of seedEmployees) {
    insertEmp.run({
      ...e,
      shift_start: e.shiftStart, shift_end: e.shiftEnd,
      clock_in: e.clockIn, clock_out: e.clockOut,
      active_time_sec: e.activeTimeSec, idle_time_sec: e.idleTimeSec, away_time_sec: e.awayTimeSec,
      last_activity: e.lastActivity, cpu_usage: e.cpuUsage, ram_usage: e.ramUsage,
      disk_usage: e.diskUsage, webcam_verified: e.webcamVerified ? 1 : 0,
      online: e.online ? 1 : 0, mouse_clicks: e.mouseClicks, mouse_moves: e.mouseMoves,
      screenshots_taken: e.screenshotsTaken,
    })
  }

  // Seed projects
  const insertProj = db.prepare(`
    INSERT INTO projects (id, name, code, description, client, department, status, progress,
      start_date, end_date, budget, spent, team_members, team_avatars, team_size,
      total_tasks, completed_tasks, in_progress_tasks, blocked_tasks, health, priority)
    VALUES (@id, @name, @code, @description, @client, @department, @status, @progress,
      @start_date, @end_date, @budget, @spent, @team_members, @team_avatars, @team_size,
      @total_tasks, @completed_tasks, @in_progress_tasks, @blocked_tasks, @health, @priority)
  `)
  for (const p of seedProjects) {
    insertProj.run({
      ...p,
      start_date: p.startDate, end_date: p.endDate,
      team_members: JSON.stringify(p.teamMembers),
      team_avatars: JSON.stringify(p.teamAvatars),
      total_tasks: p.totalTasks, completed_tasks: p.completedTasks,
      in_progress_tasks: p.inProgressTasks, blocked_tasks: p.blockedTasks,
    })
  }

  // Seed milestones
  const insertMilestone = db.prepare(`
    INSERT INTO milestones (id, project_id, title, due_date, completed, progress)
    VALUES (@id, @project_id, @title, @due_date, @completed, @progress)
  `)
  for (const p of seedProjects) {
    for (const m of p.milestones) {
      insertMilestone.run({
        id: m.id, project_id: p.id, title: m.title,
        due_date: m.dueDate, completed: m.completed ? 1 : 0, progress: m.progress,
      })
    }
  }

  // Seed tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, type, assignee_ids, assignee_names, assignee_avatars,
      group_name, project_id, project_name, status, priority, progress, created_at, due_date,
      estimated_hours, logged_hours, tags)
    VALUES (@id, @title, @description, @type, @assignee_ids, @assignee_names, @assignee_avatars,
      @group_name, @project_id, @project_name, @status, @priority, @progress, @created_at, @due_date,
      @estimated_hours, @logged_hours, @tags)
  `)
  for (const t of seedTasks) {
    insertTask.run({
      id: t.id, title: t.title, description: t.description, type: t.type,
      assignee_ids: JSON.stringify(t.assigneeIds),
      assignee_names: JSON.stringify(t.assigneeNames),
      assignee_avatars: JSON.stringify(t.assigneeAvatars),
      group_name: t.group, project_id: t.projectId, project_name: t.projectName,
      status: t.status, priority: t.priority, progress: t.progress,
      created_at: t.createdAt, due_date: t.dueDate,
      estimated_hours: t.estimatedHours, logged_hours: t.loggedHours,
      tags: JSON.stringify(t.tags),
    })
  }

  // Seed task comments
  const insertComment = db.prepare(`
    INSERT INTO task_comments (id, task_id, author, avatar, text, timestamp)
    VALUES (@id, @task_id, @author, @avatar, @text, @timestamp)
  `)
  for (const t of seedTasks) {
    for (const c of t.comments) {
      insertComment.run({
        id: c.id, task_id: t.id, author: c.author,
        avatar: c.avatar, text: c.text, timestamp: c.timestamp,
      })
    }
  }

  // Seed meetings
  const insertMeeting = db.prepare(`
    INSERT INTO meetings (id, title, description, organizer, organizer_avatar,
      participant_ids, participant_names, participant_avatars, date, start_time, end_time,
      status, platform, location, meeting_link, agenda, project_name, recording_available)
    VALUES (@id, @title, @description, @organizer, @organizer_avatar,
      @participant_ids, @participant_names, @participant_avatars, @date, @start_time, @end_time,
      @status, @platform, @location, @meeting_link, @agenda, @project_name, @recording_available)
  `)
  for (const m of seedMeetings) {
    insertMeeting.run({
      id: m.id, title: m.title, description: m.description,
      organizer: m.organizer, organizer_avatar: m.organizerAvatar,
      participant_ids: JSON.stringify(m.participantIds),
      participant_names: JSON.stringify(m.participantNames),
      participant_avatars: JSON.stringify(m.participantAvatars),
      date: m.date, start_time: m.startTime, end_time: m.endTime,
      status: m.status, platform: m.platform, location: m.location,
      meeting_link: m.meetingLink, agenda: JSON.stringify(m.agenda),
      project_name: m.projectName ?? null,
      recording_available: m.recordingAvailable ? 1 : 0,
    })
  }

  // Seed notices
  const insertNotice = db.prepare(`
    INSERT INTO notices (id, title, content, category, priority, author, posted_at, pinned, acknowledgments)
    VALUES (@id, @title, @content, @category, @priority, @author, @posted_at, @pinned, @acknowledgments)
  `)
  for (const n of seedNotices) {
    insertNotice.run({
      id: n.id, title: n.title, content: n.content, category: n.category,
      priority: n.priority, author: n.author, posted_at: n.postedAt,
      pinned: n.pinned ? 1 : 0, acknowledgments: JSON.stringify(n.acknowledgments),
    })
  }

  // Seed chat conversations
  const insertChat = db.prepare(`
    INSERT INTO chat_conversations (id, type, name, avatar, participant_ids, participant_names,
      participant_avatars, online, last_message_time)
    VALUES (@id, @type, @name, @avatar, @participant_ids, @participant_names,
      @participant_avatars, @online, @last_message_time)
  `)
  for (const c of seedChats) {
    insertChat.run({
      id: c.id, type: c.type, name: c.name, avatar: c.avatar,
      participant_ids: JSON.stringify(c.participantIds),
      participant_names: JSON.stringify(c.participantNames),
      participant_avatars: JSON.stringify(c.participantAvatars),
      online: c.online ? 1 : 0, last_message_time: c.lastMessageTime,
    })
  }

  // Seed chat messages
  const insertMsg = db.prepare(`
    INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_avatar, text, timestamp, read)
    VALUES (@id, @conversation_id, @sender_id, @sender_name, @sender_avatar, @text, @timestamp, @read)
  `)
  for (const c of seedChats) {
    for (const m of c.messages) {
      insertMsg.run({
        id: m.id, conversation_id: c.id, sender_id: m.senderId,
        sender_name: m.senderName, sender_avatar: m.senderAvatar,
        text: m.text, timestamp: m.timestamp, read: m.read ? 1 : 0,
      })
    }
  }

  // Seed attendance (generate 7 days for each employee)
  const today = new Date()
  const insertAtt = db.prepare(`
    INSERT OR IGNORE INTO attendance (id, employee_id, date, clock_in, clock_out, status, worked_hours, overtime_hours, shift_start, shift_end, note)
    VALUES (@id, @employee_id, @date, @clock_in, @clock_out, @status, @worked_hours, @overtime_hours, @shift_start, @shift_end, @note)
  `)
  for (const emp of seedEmployees) {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const r = Math.sin(emp.id.charCodeAt(4) * 7 + i * 3.7) * 0.5 + 0.5
      let status = 'present'
      let workedHours = 8
      if (r > 0.92) { status = 'leave'; workedHours = 0 }
      else if (r > 0.85) { status = 'absent'; workedHours = 0 }
      else if (r > 0.75) { status = 'half-day'; workedHours = 4 }
      else if (r > 0.6) { status = 'late'; workedHours = 7 }
      else if (r > 0.3) { status = 'present'; workedHours = 8 }
      else { status = 'remote'; workedHours = 7.5 }

      const [sh, sm] = emp.shiftStart.split(':').map(Number)
      let delta = 0
      if (status === 'late') delta = 20
      else if (status === 'present') delta = -5
      else if (status === 'remote') delta = 0
      const total = sh * 60 + sm + delta
      const clockIn = status === 'absent' || status === 'leave' ? null : `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
      const clockOut = status === 'absent' || status === 'leave' ? null : `${String(Math.floor((total + workedHours * 60) / 60)).padStart(2, '0')}:${String(Math.round((workedHours % 1) * 60)).padStart(2, '0')}`
      const ot = workedHours > 8 ? Math.round((workedHours - 8) * 10) / 10 : 0

      insertAtt.run({
        id: `att-${emp.id}-${dateStr}`, employee_id: emp.id, date: dateStr,
        clock_in: clockIn, clock_out: clockOut, status, worked_hours: workedHours,
        overtime_hours: ot, shift_start: emp.shiftStart, shift_end: emp.shiftEnd,
        note: status === 'leave' ? 'Approved leave' : status === 'absent' ? 'No show' : null,
      })
    }
  }
}
