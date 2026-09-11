import Database from 'better-sqlite3'
import { seedDatabase } from './seed'

let dbInstance: Database.Database | null = null

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance

  // Use /tmp on Vercel serverless, local file in dev
  const dbPath = process.env.VERCEL ? '/tmp/pulsetrack.db' : './data/pulsetrack.db'

  const fs = require('fs')
  const path = require('path')
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  dbInstance = new Database(dbPath)
  dbInstance.pragma('journal_mode = WAL')
  dbInstance.pragma('foreign_keys = ON')

  initSchema(dbInstance)
  seedDatabase(dbInstance)

  return dbInstance
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employer',
      avatar TEXT DEFAULT '',
      department TEXT DEFAULT '',
      employee_id TEXT
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      avatar TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'offline',
      device TEXT DEFAULT '',
      os TEXT DEFAULT '',
      ip TEXT DEFAULT '',
      location TEXT DEFAULT '',
      shift_start TEXT DEFAULT '09:00',
      shift_end TEXT DEFAULT '17:00',
      clock_in TEXT,
      clock_out TEXT,
      active_time_sec INTEGER DEFAULT 0,
      idle_time_sec INTEGER DEFAULT 0,
      away_time_sec INTEGER DEFAULT 0,
      productivity INTEGER DEFAULT 0,
      last_activity TEXT,
      cpu_usage INTEGER DEFAULT 0,
      ram_usage INTEGER DEFAULT 0,
      disk_usage INTEGER DEFAULT 0,
      battery INTEGER DEFAULT 0,
      online INTEGER DEFAULT 0,
      webcam_verified INTEGER DEFAULT 0,
      keystrokes INTEGER DEFAULT 0,
      mouse_clicks INTEGER DEFAULT 0,
      mouse_moves INTEGER DEFAULT 0,
      screenshots_taken INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      clock_in TEXT,
      clock_out TEXT,
      status TEXT NOT NULL DEFAULT 'present',
      worked_hours REAL DEFAULT 0,
      overtime_hours REAL DEFAULT 0,
      shift_start TEXT,
      shift_end TEXT,
      note TEXT,
      UNIQUE(employee_id, date)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT DEFAULT '',
      client TEXT DEFAULT '',
      department TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'planning',
      progress INTEGER DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      budget INTEGER DEFAULT 0,
      spent INTEGER DEFAULT 0,
      team_members TEXT DEFAULT '[]',
      team_avatars TEXT DEFAULT '[]',
      team_size INTEGER DEFAULT 0,
      total_tasks INTEGER DEFAULT 0,
      completed_tasks INTEGER DEFAULT 0,
      in_progress_tasks INTEGER DEFAULT 0,
      blocked_tasks INTEGER DEFAULT 0,
      health TEXT DEFAULT 'on-track',
      priority TEXT DEFAULT 'medium'
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT NOT NULL DEFAULT 'individual',
      assignee_ids TEXT DEFAULT '[]',
      assignee_names TEXT DEFAULT '[]',
      assignee_avatars TEXT DEFAULT '[]',
      group_name TEXT,
      project_id TEXT,
      project_name TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      progress INTEGER DEFAULT 0,
      created_at TEXT,
      due_date TEXT,
      estimated_hours REAL DEFAULT 0,
      logged_hours REAL DEFAULT 0,
      tags TEXT DEFAULT '[]',
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS task_comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      author TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      organizer TEXT NOT NULL,
      organizer_avatar TEXT DEFAULT '',
      participant_ids TEXT DEFAULT '[]',
      participant_names TEXT DEFAULT '[]',
      participant_avatars TEXT DEFAULT '[]',
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      platform TEXT DEFAULT 'Zoom',
      location TEXT DEFAULT 'Virtual',
      meeting_link TEXT DEFAULT '',
      agenda TEXT DEFAULT '[]',
      project_name TEXT,
      recording_available INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'company',
      priority TEXT NOT NULL DEFAULT 'info',
      author TEXT NOT NULL,
      posted_at TEXT NOT NULL,
      pinned INTEGER DEFAULT 0,
      acknowledgments TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS chat_conversations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'direct',
      name TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      participant_ids TEXT DEFAULT '[]',
      participant_names TEXT DEFAULT '[]',
      participant_avatars TEXT DEFAULT '[]',
      online INTEGER DEFAULT 0,
      last_message_time TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_avatar TEXT DEFAULT '',
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
    );
  `)
}
