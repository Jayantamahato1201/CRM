import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Download, UserPlus } from 'lucide-react'
import { Card, ProgressBar, Badge } from '../components/ui'
import { AddEmployeeModal } from '../components/AddEmployeeModal'
import { employees as initialEmployees, formatDuration, formatTimeAgo } from '../lib/data'
import { statusConfig, productivityColor, productivityBar } from '../lib/helpers'
import type { Employee } from '../lib/types'

const departments = ['All', 'Engineering', 'Finance', 'Design', 'Sales', 'Product', 'Marketing', 'Operations', 'HR']
const statuses = ['All', 'active', 'idle', 'break', 'meeting', 'offline']

export function Employees() {
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('All')
  const [status, setStatus] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [employeeList, setEmployeeList] = useState<Employee[]>(initialEmployees)

  const filtered = useMemo(() => {
    return employeeList.filter((e) => {
      const matchQuery =
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.role.toLowerCase().includes(query.toLowerCase()) ||
        e.id.toLowerCase().includes(query.toLowerCase())
      const matchDept = dept === 'All' || e.department === dept
      const matchStatus = status === 'All' || e.status === status
      return matchQuery && matchDept && matchStatus
    })
  }, [query, dept, status, employeeList])

  function handleAdd(emp: Employee) {
    setEmployeeList((prev) => [...prev, emp])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Employees</h1>
        <p className="text-sm text-slate-400">{filtered.length} of {employeeList.length} monitored employees</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role, or ID..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 shrink-0 text-slate-500" />
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-400"
            >
              <UserPlus className="h-4 w-4" /> Add Employee
            </button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Active Time</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Last Activity</th>
                <th className="px-4 py-3 font-medium">Productivity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((e) => {
                const sc = statusConfig(e.status)
                return (
                  <tr key={e.id} className="group transition hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <Link to={`/employees/${e.id}`} className="flex items-center gap-3">
                        <div className="relative">
                          <img src={e.avatar} alt={e.name} className="h-9 w-9 rounded-full object-cover" />
                          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${sc.dot}`} />
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-cyan-400">{e.name}</p>
                          <p className="text-xs text-slate-500">{e.role}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{e.department}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${sc.color}`}>
                        <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-300 lg:table-cell">{e.activeTimeSec > 0 ? formatDuration(e.activeTimeSec) : '—'}</td>
                    <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">{e.activeTimeSec > 0 ? formatTimeAgo(e.lastActivity) : 'Never'}</td>
                    <td className="px-4 py-3">
                      {e.productivity > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className={`w-10 font-semibold tabular-nums ${productivityColor(e.productivity)}`}>{e.productivity}%</span>
                          <div className="w-16">
                            <ProgressBar value={e.productivity} color={productivityBar(e.productivity)} className="h-1.5" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">Not started</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-slate-500">No employees match your filters.</div>
        )}
      </Card>

      <AddEmployeeModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
    </div>
  )
}
