export interface FileNode {
  name: string
  type: 'file' | 'folder'
  path: string
  language?: string
  content?: string
  children?: FileNode[]
  icon?: string
}

export const fileSystem: FileNode[] = [
  {
    name: 'pulsetrack',
    type: 'folder',
    path: '/',
    children: [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          {
            name: 'components',
            type: 'folder',
            path: '/src/components',
            children: [
              {
                name: 'Button.tsx',
                type: 'file',
                path: '/src/components/Button.tsx',
                language: 'typescript',
                content: `import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants = {
  primary: 'bg-cyan-500 text-white hover:bg-cyan-400',
  secondary: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
  ghost: 'bg-transparent text-slate-400 hover:bg-slate-800',
  danger: 'bg-rose-500 text-white hover:bg-rose-400',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={\`rounded-lg font-medium transition \${variants[variant]} \${sizes[size]} \${className}\`}
      {...props}
    >
      {children}
    </button>
  )
}
`,
              },
              {
                name: 'Card.tsx',
                type: 'file',
                path: '/src/components/Card.tsx',
                language: 'typescript',
                content: `import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <div
      className={\`rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur \${hoverable ? 'transition hover:border-slate-700 hover:bg-slate-800/40' : ''} \${className}\`}
    >
      {children}
    </div>
  )
}
`,
              },
              {
                name: 'Modal.tsx',
                type: 'file',
                path: '/src/components/Modal.tsx',
                language: 'typescript',
                content: `import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
`,
              },
            ],
          },
          {
            name: 'pages',
            type: 'folder',
            path: '/src/pages',
            children: [
              {
                name: 'Dashboard.tsx',
                type: 'file',
                path: '/src/pages/Dashboard.tsx',
                language: 'typescript',
                content: `import { useState, useEffect } from 'react'
import { Card, StatCard, ProgressBar } from '../components/ui'
import { Users, Activity, Clock, TrendingUp } from 'lucide-react'

export function Dashboard() {
  const [stats, setStats] = useState({ online: 0, avgProductivity: 0, activeHours: 0 })

  useEffect(() => {
    // Fetch monitoring stats from API
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Online" value={stats.online} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Avg Productivity" value={\`\${stats.avgProductivity}%\`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Active Hours" value={stats.activeHours} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Monitoring" value="Live" icon={<Activity className="h-5 w-5" />} />
      </div>
    </div>
  )
}
`,
              },
              {
                name: 'Login.tsx',
                type: 'file',
                path: '/src/pages/Login.tsx',
                language: 'typescript',
                content: `import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = login(email, password, 'admin')
    if (result.success) {
      navigate('/')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Sign In</button>
    </form>
  )
}
`,
              },
            ],
          },
          {
            name: 'lib',
            type: 'folder',
            path: '/src/lib',
            children: [
              {
                name: 'auth.tsx',
                type: 'file',
                path: '/src/lib/auth.tsx',
                language: 'typescript',
                content: `import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole = 'admin' | 'employer'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string, role: UserRole) => { success: boolean; error?: string }
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const credentials: Record<string, { password: string; user: AuthUser }> = {
  'admin@acme.io': {
    password: 'admin123',
    user: { id: 'admin-001', name: 'Admin', email: 'admin@acme.io', role: 'admin', avatar: '' },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  function login(email: string, password: string, role: UserRole) {
    const cred = credentials[email.toLowerCase()]
    if (!cred) return { success: false, error: 'Account not found' }
    if (cred.password !== password) return { success: false, error: 'Wrong password' }
    if (cred.user.role !== role) return { success: false, error: 'Wrong role' }
    setUser(cred.user)
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout: () => setUser(null), isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
`,
              },
              {
                name: 'api.ts',
                type: 'file',
                path: '/src/lib/api.ts',
                language: 'typescript',
                content: `const API_BASE = '/api'

export async function fetchEmployees() {
  const res = await fetch(\`\${API_BASE}/employees\`)
  if (!res.ok) throw new Error('Failed to fetch employees')
  return res.json()
}

export async function createEmployee(data: {
  name: string
  email: string
  role: string
  department: string
}) {
  const res = await fetch(\`\${API_BASE}/employees\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to create employee')
  return json
}

export async function fetchTasks() {
  const res = await fetch(\`\${API_BASE}/tasks\`)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function updateTask(id: string, updates: Record<string, unknown>) {
  const res = await fetch(\`\${API_BASE}/tasks/\${id}\`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error('Failed to update task')
  return res.json()
}
`,
              },
            ],
          },
          {
            name: 'App.tsx',
            type: 'file',
            path: '/src/App.tsx',
            language: 'typescript',
            content: `import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { Sidebar, Topbar } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'

function AppRoutes() {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}
`,
          },
          {
            name: 'main.tsx',
            type: 'file',
            path: '/src/main.tsx',
            language: 'typescript',
            content: `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
`,
          },
          {
            name: 'index.css',
            type: 'file',
            path: '/src/index.css',
            language: 'css',
            content: `@import "tailwindcss";

html {
  scroll-behavior: smooth;
}

body {
  background-color: #020617;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0f172a;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
`,
          },
        ],
      },
      {
        name: 'server',
        type: 'folder',
        path: '/server',
        children: [
          {
            name: 'db.ts',
            type: 'file',
            path: '/server/db.ts',
            language: 'typescript',
            content: `import Database from 'better-sqlite3'
import { seedDatabase } from './seed'

let dbInstance: Database.Database | null = null

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance

  const dbPath = process.env.VERCEL ? '/tmp/pulsetrack.db' : './data/pulsetrack.db'
  dbInstance = new Database(dbPath)
  dbInstance.pragma('journal_mode = WAL')
  dbInstance.pragma('foreign_keys = ON')

  initSchema(dbInstance)
  seedDatabase(dbInstance)

  return dbInstance
}

function initSchema(db: Database.Database) {
  db.exec(\`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employer'
    );
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'offline'
    );
  \`)
}
`,
          },
          {
            name: 'seed.ts',
            type: 'file',
            path: '/server/seed.ts',
            language: 'typescript',
            content: `import type Database from 'better-sqlite3'

export function seedDatabase(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }
  if (count.c > 0) return

  const insertUser = db.prepare(
    'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)'
  )
  insertUser.run('admin-001', 'admin@acme.io', 'admin123', 'Admin Console', 'admin')
  insertUser.run('EMP-001', 'sarah.chen@acme.io', 'employee123', 'Sarah Chen', 'employer')
  insertUser.run('EMP-002', 'marcus.j@acme.io', 'employee123', 'Marcus Johnson', 'employer')

  console.log('Database seeded successfully')
}
`,
          },
        ],
      },
      {
        name: 'api',
        type: 'folder',
        path: '/api',
        children: [
          {
            name: 'employees.ts',
            type: 'file',
            path: '/api/employees.ts',
            language: 'typescript',
            content: `import { getDb } from '../server/db'

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db = getDb()

    if (req.method === 'GET') {
      const employees = db.prepare('SELECT * FROM employees ORDER BY id').all()
      return res.status(200).json(employees)
    }

    if (req.method === 'POST') {
      const { name, email, role, department } = req.body
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Name, email, and role are required' })
      }

      const id = \`EMP-\${String(Date.now()).slice(-3)}\`
      db.prepare('INSERT INTO employees (id, name, email, role, department) VALUES (?, ?, ?, ?, ?)')
        .run(id, name, email, role, department || 'Engineering')

      return res.status(201).json({ success: true, employeeId: id })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
`,
          },
        ],
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        language: 'json',
        content: `{
  "name": "pulsetrack",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "@tailwindcss/vite": "^4.2.1",
    "better-sqlite3": "^11.8.1",
    "framer-motion": "^12.35.0",
    "lucide-react": "^0.577.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.1",
    "tailwindcss": "^4.2.1"
  }
}
`,
      },
      {
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        language: 'markdown',
        content: `# PulseTrack — WFH Employee Monitoring

A comprehensive work-from-home employee monitoring system built with React, TypeScript, and SQLite.

## Features

- 🔐 **Admin & Employer Login** — Role-based authentication
- 📊 **Live Dashboard** — Real-time monitoring of remote employees
- 👥 **Employee Management** — Add, track, and manage employees
- 📅 **Attendance Tracking** — Clock in/out, weekly calendar
- ✅ **Task Management** — Kanban board with drag-and-drop
- 📁 **Project Tracking** — Milestones, budgets, and team management
- 💬 **Chat** — Real-time messaging with file attachments
- 📢 **Notices** — Company announcements with acknowledgments
- 📹 **Meetings** — Schedule and track video meetings
- 🎓 **Internships** — Intern management with mentor tracking
- 💻 **Code Editor** — Built-in VS Code editor

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acme.io | admin123 |
| Employer | sarah.chen@acme.io | employee123 |

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite
- **Backend**: Express API routes, SQLite (better-sqlite3)
- **Editor**: Monaco Editor (VS Code editor)
- **Deployment**: Vercel
`,
      },
      {
        name: 'vite.config.ts',
        type: 'file',
        path: '/vite.config.ts',
        language: 'typescript',
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
})
`,
      },
      {
        name: 'tsconfig.json',
        type: 'file',
        path: '/tsconfig.json',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
`,
      },
    ],
  },
]

// Terminal command handler
export function handleTerminalCommand(cmd: string): { output: string; type: 'output' | 'error' | 'command' }[] {
  const parts = cmd.trim().split(/\s+/)
  const command = parts[0]
  const args = parts.slice(1)
  const results: { output: string; type: 'output' | 'error' | 'command' }[] = []

  results.push({ output: `$ ${cmd}`, type: 'command' })

  switch (command) {
    case 'help':
      results.push({ output: 'Available commands: help, ls, cat, clear, npm, git, node, echo, pwd, whoami, date', type: 'output' })
      break
    case 'ls':
      results.push({ output: 'src/  server/  api/  node_modules/  dist/  public/', type: 'output' })
      break
    case 'pwd':
      results.push({ output: '/home/user/pulsetrack', type: 'output' })
      break
    case 'whoami':
      results.push({ output: 'admin@acme.io', type: 'output' })
      break
    case 'date':
      results.push({ output: new Date().toString(), type: 'output' })
      break
    case 'echo':
      results.push({ output: args.join(' '), type: 'output' })
      break
    case 'cat':
      if (args[0]) {
        results.push({ output: `cat: ${args[0]}: File content displayed in editor`, type: 'output' })
      } else {
        results.push({ output: 'cat: missing file operand', type: 'error' })
      }
      break
    case 'clear':
      return []
    case 'npm':
      if (args[0] === 'run' && args[1] === 'dev') {
        results.push({ output: '> pulsetrack@1.0.0 dev', type: 'output' })
        results.push({ output: '> vite', type: 'output' })
        results.push({ output: '', type: 'output' })
        results.push({ output: '  VITE v7.3.1  ready in 312 ms', type: 'output' })
        results.push({ output: '', type: 'output' })
        results.push({ output: '  ➜  Local:   http://localhost:3000/', type: 'output' })
        results.push({ output: '  ➜  Network: use --host to expose', type: 'output' })
      } else if (args[0] === 'run' && args[1] === 'build') {
        results.push({ output: '> pulsetrack@1.0.0 build', type: 'output' })
        results.push({ output: '> vite build', type: 'output' })
        results.push({ output: '', type: 'output' })
        results.push({ output: '✓ 2178 modules transformed.', type: 'output' })
        results.push({ output: '✓ built in 14.71s', type: 'output' })
      } else if (args[0] === 'install') {
        results.push({ output: 'added 248 packages in 8s', type: 'output' })
        results.push({ output: '', type: 'output' })
        results.push({ output: '248 packages are looking for funding', type: 'output' })
      } else {
        results.push({ output: `npm ${args.join(' ')}`, type: 'output' })
      }
      break
    case 'git':
      if (args[0] === 'status') {
        results.push({ output: 'On branch main', type: 'output' })
        results.push({ output: "Your branch is up to date with 'origin/main'.", type: 'output' })
        results.push({ output: '', type: 'output' })
        results.push({ output: 'Changes not staged for commit:', type: 'output' })
        results.push({ output: '  modified:   src/pages/Dashboard.tsx', type: 'output' })
        results.push({ output: '  modified:   src/lib/auth.tsx', type: 'output' })
      } else if (args[0] === 'log') {
        results.push({ output: 'commit a4f3e9b (HEAD -> main, origin/main)', type: 'output' })
        results.push({ output: 'Author: Admin <admin@acme.io>', type: 'output' })
        results.push({ output: 'Date:   ' + new Date().toDateString(), type: 'output' })
        results.push({ output: '', type: 'output' })
        results.push({ output: '    feat: add VS Code editor integration', type: 'output' })
      } else if (args[0] === 'branch') {
        results.push({ output: '* main', type: 'output' })
        results.push({ output: '  develop', type: 'output' })
        results.push({ output: '  feature/chat-attachments', type: 'output' })
      } else {
        results.push({ output: `git ${args.join(' ')}`, type: 'output' })
      }
      break
    case 'node':
      if (args[0] === '-v' || args[0] === '--version') {
        results.push({ output: 'v20.20.2', type: 'output' })
      } else {
        results.push({ output: `node ${args.join(' ')}`, type: 'output' })
      }
      break
    case '':
      break
    default:
      results.push({ output: `command not found: ${command}. Type 'help' for available commands.`, type: 'error' })
  }

  return results
}
