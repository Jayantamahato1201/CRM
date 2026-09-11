import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Upload, Check, Copy, KeyRound, Fingerprint, Loader2, AlertCircle } from 'lucide-react'
import type { Employee } from '../lib/types'
import { createEmployee } from '../lib/api'

const departments = ['Engineering', 'Finance', 'Design', 'Sales', 'Product', 'Marketing', 'Operations', 'HR']
const avatarPool = ['/avatars/emp1.jpg', '/avatars/emp2.jpg', '/avatars/emp3.jpg', '/avatars/emp4.jpg', '/avatars/emp5.jpg', '/avatars/emp6.jpg']

interface CreatedCredentials {
  employeeId: string
  email: string
  password: string
}

export function AddEmployeeModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (emp: Employee) => void
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    department: 'Engineering',
    location: '',
    shiftStart: '09:00',
    shiftEnd: '17:00',
    device: 'MacBook Pro 14"',
    os: 'macOS Sonoma 14.4',
    avatar: avatarPool[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  async function handleSubmit() {
    if (!form.name || !form.email || !form.role) return
    setLoading(true)
    setError('')
    try {
      const result = await createEmployee(form)
      setCredentials(result.credentials)
      onAdd(result.employee)
      setCreated(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create employee')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setCreated(false)
    setCredentials(null)
    setError('')
    setForm({
      name: '', email: '', role: '', department: 'Engineering', location: '',
      shiftStart: '09:00', shiftEnd: '17:00', device: 'MacBook Pro 14"', os: 'macOS Sonoma 14.4',
      avatar: avatarPool[0],
    })
    onClose()
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none'
  const labelClass = 'mb-1 block text-xs font-medium text-slate-400'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            {created && credentials ? (
              /* Success screen with generated credentials */
              <div>
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15"
                  >
                    <Check className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <p className="mt-4 text-lg font-semibold text-white">Employee Created Successfully!</p>
                  <p className="mt-1 text-sm text-slate-400">
                    <span className="font-medium text-white">{form.name}</span> has been added to the system.
                    Share the credentials below with the employee.
                  </p>
                </div>

                {/* Generated credentials card */}
                <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-cyan-400" />
                    <p className="text-sm font-semibold text-cyan-400">Login Credentials</p>
                  </div>

                  <div className="space-y-3">
                    {/* Employee ID */}
                    <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 p-3">
                      <Fingerprint className="h-4 w-4 shrink-0 text-slate-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Employee ID</p>
                        <p className="font-mono text-sm font-semibold text-white">{credentials.employeeId}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(credentials.employeeId, 'id')}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                      >
                        {copiedField === 'id' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 p-3">
                      <div className="h-4 w-4 shrink-0 text-slate-500">@</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Email (Username)</p>
                        <p className="truncate text-sm font-medium text-white">{credentials.email}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(credentials.email, 'email')}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                      >
                        {copiedField === 'email' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password */}
                    <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 p-3">
                      <KeyRound className="h-4 w-4 shrink-0 text-slate-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Password</p>
                        <p className="font-mono text-sm font-semibold text-white">{credentials.password}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(credentials.password, 'password')}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                      >
                        {copiedField === 'password' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-slate-500">
                    The employee can now log in using these credentials. They will be prompted to change their password on first login.
                  </p>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-400"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15">
                      <UserPlus className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Add New Employee</h3>
                      <p className="text-xs text-slate-500">ID and password are auto-generated</p>
                    </div>
                  </div>
                  <button onClick={handleClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Avatar picker */}
                <div className="mb-4">
                  <label className={labelClass}>Profile Photo</label>
                  <div className="flex items-center gap-3">
                    <img src={form.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
                    <div className="flex flex-wrap gap-2">
                      {avatarPool.map((av) => (
                        <button
                          key={av}
                          onClick={() => setForm({ ...form, avatar: av })}
                          className={`h-9 w-9 overflow-hidden rounded-full border-2 transition ${form.avatar === av ? 'border-cyan-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                          <img src={av} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                      <button className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-slate-600 text-slate-500 hover:border-cyan-500 hover:text-cyan-400">
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={labelClass}>Full Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Smith" className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Email Address *</label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john.smith@acme.io" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Role / Title *</label>
                    <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Software Engineer" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Department</label>
                    <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass}>
                      {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. New York, NY" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Device</label>
                    <input value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Shift Start</label>
                    <input type="time" value={form.shiftStart} onChange={(e) => setForm({ ...form, shiftStart: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Shift End</label>
                    <input type="time" value={form.shiftEnd} onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })} className={inputClass} />
                  </div>
                </div>

                {/* Info banner */}
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                  <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <p className="text-xs text-slate-400">
                    An <span className="font-medium text-cyan-400">Employee ID</span> (e.g. EMP-009) and a secure{' '}
                    <span className="font-medium text-cyan-400">password</span> will be auto-generated upon creation.
                    The employee can use these credentials to log in to the portal.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!form.name || !form.email || !form.role || loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Employee'
                    )}
                  </button>
                  <button onClick={handleClose} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
