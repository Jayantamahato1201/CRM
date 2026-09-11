import { getDb } from '../../server/db'
import type { IncomingMessage, ServerResponse } from 'http'

// Minimal types for Vercel serverless functions
interface VercelRequest extends IncomingMessage {
  body: any
  query: any
  method?: string
}
interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse
  json: (data: any) => void
  end: () => void
}

// Generate a random password
function generatePassword(length = 10): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#$%'
  let pwd = ''
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

// Generate next employee ID
function generateEmployeeId(db: ReturnType<typeof getDb>): string {
  const row = db.prepare('SELECT id FROM employees WHERE id LIKE "EMP-%" ORDER BY id DESC LIMIT 1').get() as { id: string } | undefined
  if (!row) return 'EMP-001'
  const num = parseInt(row.id.replace('EMP-', ''), 10) + 1
  return `EMP-${String(num).padStart(3, '0')}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const db = getDb()

    if (req.method === 'GET') {
      // List all employees
      const rows = db.prepare('SELECT * FROM employees ORDER BY id').all() as any[]
      const employees = rows.map((r) => ({
        id: r.id, name: r.name, email: r.email, role: r.role, department: r.department,
        avatar: r.avatar, status: r.status, device: r.device, os: r.os, ip: r.ip,
        location: r.location, shiftStart: r.shift_start, shiftEnd: r.shift_end,
        clockIn: r.clock_in, clockOut: r.clock_out, activeTimeSec: r.active_time_sec,
        idleTimeSec: r.idle_time_sec, awayTimeSec: r.away_time_sec, productivity: r.productivity,
        lastActivity: r.last_activity, cpuUsage: r.cpu_usage, ramUsage: r.ram_usage,
        diskUsage: r.disk_usage, battery: r.battery, online: !!r.online,
        webcamVerified: !!r.webcam_verified, keystrokes: r.keystrokes,
        mouseClicks: r.mouse_clicks, mouseMoves: r.mouse_moves,
        screenshotsTaken: r.screenshots_taken, apps: [], hourly: [], activities: [], trends: [],
      }))
      return res.status(200).json(employees)
    }

    if (req.method === 'POST') {
      const { name, email, role, department, location, shiftStart, shiftEnd, device, os, avatar } = req.body

      // Validate
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Name, email, and role are required' })
      }

      // Check if email already exists
      const existing = db.prepare('SELECT id FROM employees WHERE email = ?').get(email) as { id: string } | undefined
      if (existing) {
        return res.status(409).json({ error: 'An employee with this email already exists' })
      }

      // Auto-generate ID and password
      const employeeId = generateEmployeeId(db)
      const password = generatePassword()
      const now = new Date().toISOString()
      const avatarPath = avatar || '/avatars/emp1.jpg'

      // Insert into employees table
      db.prepare(`
        INSERT INTO employees (id, name, email, role, department, avatar, status, device, os, ip, location,
          shift_start, shift_end, clock_in, clock_out, active_time_sec, idle_time_sec, away_time_sec,
          productivity, last_activity, cpu_usage, ram_usage, disk_usage, battery, online, webcam_verified,
          keystrokes, mouse_clicks, mouse_moves, screenshots_taken)
        VALUES (@id, @name, @email, @role, @department, @avatar, 'offline', @device, @os, @ip, @location,
          @shift_start, @shift_end, NULL, NULL, 0, 0, 0, 0, @last_activity, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0)
      `).run({
        id: employeeId, name, email, role, department: department || 'Engineering',
        avatar: avatarPath, device: device || 'MacBook Pro 14"', os: os || 'macOS Sonoma 14.4',
        ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: location || 'Remote', shift_start: shiftStart || '09:00', shift_end: shiftEnd || '17:00',
        last_activity: now,
      })

      // Insert into users table (for login)
      db.prepare(`
        INSERT INTO users (id, email, password, name, role, avatar, department, employee_id)
        VALUES (@id, @email, @password, @name, 'employer', @avatar, @department, @employee_id)
      `).run({
        id: employeeId, email, password, name, avatar: avatarPath,
        department: department || 'Engineering', employee_id: employeeId,
      })

      return res.status(201).json({
        success: true,
        employee: {
          id: employeeId, name, email, role, department: department || 'Engineering',
          avatar: avatarPath, status: 'offline',
          device: device || 'MacBook Pro 14"', os: os || 'macOS Sonoma 14.4',
          location: location || 'Remote',
          shiftStart: shiftStart || '09:00', shiftEnd: shiftEnd || '17:00',
          clockIn: null, clockOut: null, activeTimeSec: 0, idleTimeSec: 0, awayTimeSec: 0,
          productivity: 0, lastActivity: now, cpuUsage: 0, ramUsage: 0, diskUsage: 0,
          battery: 0, online: false, webcamVerified: false, keystrokes: 0, mouseClicks: 0,
          mouseMoves: 0, screenshotsTaken: 0, apps: [], hourly: [], activities: [], trends: [],
        },
        credentials: {
          employeeId,
          email,
          password,
        },
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    console.error('API Error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
