import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity as ActivityIcon, Camera, Clock } from 'lucide-react'
import { Card, Badge } from '../components/ui'
import { employees, formatTimeAgo, formatDuration } from '../lib/data'
import { categoryConfig, statusConfig, productivityColor } from '../lib/helpers'
import type { Activity } from '../lib/types'

interface FeedItem extends Activity {
  empId: string
  empName: string
  empAvatar: string
  empStatus: string
  empProductivity: number
}

export function LiveActivity() {
  const [feed, setFeed] = useState<FeedItem[]>(() => {
    return employees
      .filter((e) => e.online)
      .flatMap((e) =>
        e.activities.slice(0, 3).map((a) => ({
          ...a,
          empId: e.id,
          empName: e.name,
          empAvatar: e.avatar,
          empStatus: e.status,
          empProductivity: e.productivity,
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 16)
  })

  // Simulate live updates by rotating the feed every few seconds
  useEffect(() => {
    const pool = employees.filter((e) => e.online)
    const interval = setInterval(() => {
      const emp = pool[Math.floor(Math.random() * pool.length)]
      const baseAct = emp.activities[Math.floor(Math.random() * emp.activities.length)]
      const newItem: FeedItem = {
        ...baseAct,
        id: `live-${Date.now()}`,
        timestamp: new Date().toISOString(),
        empId: emp.id,
        empName: emp.name,
        empAvatar: emp.avatar,
        empStatus: emp.status,
        empProductivity: emp.productivity,
      }
      setFeed((prev) => [newItem, ...prev].slice(0, 24))
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const online = useMemo(() => employees.filter((e) => e.online), [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Activity</h1>
          <p className="text-sm text-slate-400">Real-time monitoring stream · {online.length} employees online</p>
        </div>
        <Badge variant="success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Streaming
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Online employees sidebar */}
        <Card className="h-fit p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Online Now</h2>
          <div className="space-y-3">
            {online.map((e) => {
              const sc = statusConfig(e.status)
              return (
                <Link
                  key={e.id}
                  to={`/employees/${e.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-slate-800/40"
                >
                  <div className="relative">
                    <img src={e.avatar} alt={e.name} className="h-9 w-9 rounded-full object-cover" />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${sc.dot}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{e.name}</p>
                    <p className={`text-xs ${sc.color}`}>{sc.label}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${productivityColor(e.productivity)}`}>
                    {e.productivity}%
                  </span>
                </Link>
              )
            })}
          </div>
        </Card>

        {/* Live feed */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-white">Activity Stream</h2>
            <span className="text-xs text-slate-500">Auto-refreshing</span>
          </div>
          <div className="max-h-[600px] divide-y divide-slate-800 overflow-y-auto">
            <AnimatePresence initial={false}>
                {feed.map((item) => {
                  const cc = categoryConfig(item.category)
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -10, backgroundColor: 'rgba(34, 211, 238, 0.08)' }}
                      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(15, 23, 42, 0)' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.8 }}
                      className="flex items-center gap-3 p-4"
                    >
                      <div className="relative shrink-0">
                        <img src={item.empAvatar} alt={item.empName} className="h-10 w-10 rounded-full object-cover" />
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${statusConfig(item.empStatus as never).dot}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{item.empName}</p>
                          <span className="text-xs text-slate-500">opened</span>
                          <span className="text-sm text-cyan-400">{item.app}</span>
                        </div>
                        <p className="truncate text-xs text-slate-500">{item.windowTitle}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={item.category === 'productive' ? 'success' : item.category === 'distracting' ? 'danger' : 'neutral'}>
                          {cc.label}
                        </Badge>
                        {item.screenshot && <Camera className="h-3.5 w-3.5 text-cyan-400" />}
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="h-3 w-3" /> {formatDuration(item.durationSec)}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  )
}
