import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LaptopMinimal,
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Activity,
  Users,
  Clock,
} from 'lucide-react'
import { useAuth, demoAccounts, type UserRole } from '../lib/auth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = login(email, password, role)
      if (result.success) {
        navigate(role === 'admin' ? '/' : '/my-dashboard')
      } else {
        setError(result.error ?? 'Login failed.')
        setLoading(false)
      }
    }, 600)
  }

  function fillDemo(acc: (typeof demoAccounts)[0]) {
    setRole(acc.role)
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 right-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl"
          />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
            <LaptopMinimal className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">PulseTrack</p>
            <p className="text-xs text-slate-400">WFH Employee Monitoring</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold leading-tight text-white"
          >
            Monitor, manage, and empower your remote workforce.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-slate-400"
          >
            Real-time activity tracking, attendance management, task assignment, project tracking, meetings, and team communication — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 grid grid-cols-2 gap-3"
          >
            {[
              { icon: Activity, label: 'Live Monitoring' },
              { icon: Users, label: 'Team Management' },
              { icon: Clock, label: 'Attendance Tracking' },
              { icon: CheckCircle2, label: 'Task & Projects' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 backdrop-blur">
                <f.icon className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-slate-300">{f.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 flex gap-8">
          {[
            { value: '8+', label: 'Employees' },
            { value: '6', label: 'Projects' },
            { value: '99.9%', label: 'Uptime' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
              <LaptopMinimal className="h-5 w-5 text-white" />
            </div>
            <p className="text-lg font-bold text-white">PulseTrack</p>
          </div>

          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-400">Sign in to access your dashboard</p>

          {/* Role toggle */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1.5">
            <button
              onClick={() => { setRole('admin'); setError('') }}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                role === 'admin' ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="h-4 w-4" /> Admin
            </button>
            <button
              onClick={() => { setRole('employer'); setError('') }}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                role === 'employer' ? 'bg-violet-500/15 text-violet-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="h-4 w-4" /> Employer
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@acme.io' : 'sarah.chen@acme.io'}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-800 accent-cyan-500" />
                Remember me
              </label>
              <button type="button" className="text-cyan-400 hover:text-cyan-300">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-60"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                />
              ) : (
                <>
                  Sign in as {role === 'admin' ? 'Admin' : 'Employer'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-xs text-slate-500">Quick demo login</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => fillDemo(acc)}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-left transition hover:border-slate-700 hover:bg-slate-800/60"
                >
                  {acc.avatar ? (
                    <img src={acc.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${acc.role === 'admin' ? 'bg-cyan-500/15' : 'bg-violet-500/15'}`}>
                      {acc.role === 'admin' ? <Shield className="h-4 w-4 text-cyan-400" /> : <User className="h-4 w-4 text-violet-400" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-200">{acc.name}</p>
                    <p className="truncate text-[10px] text-slate-500 capitalize">{acc.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
