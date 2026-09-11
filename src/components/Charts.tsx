import { motion } from 'framer-motion'
import type { HourlyActivity } from '../lib/types'

export function BarChart({
  data,
  height = 160,
}: {
  data: { label: string; value: number; color?: string }[]
  height?: number
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
              className={`w-full rounded-t ${d.color ?? 'bg-gradient-to-t from-cyan-600 to-cyan-400'}`}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-[10px] text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function HourlyActivityChart({ data, height = 180 }: { data: HourlyActivity[]; height?: number }) {
  const max = 3600
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((h, i) => (
          <div key={i} className="group relative flex flex-1 flex-col items-center">
            <div className="flex w-full flex-1 flex-col justify-end gap-0.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(h.idleSec / max) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="w-full rounded-t-sm bg-slate-700"
                title={`Idle: ${Math.round(h.idleSec / 60)}m`}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(h.activeSec / max) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }}
                className={`w-full rounded-t-sm ${
                  h.productivity > 70
                    ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                    : h.productivity > 45
                      ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                      : 'bg-gradient-to-t from-rose-600 to-rose-400'
                }`}
                title={`Active: ${Math.round(h.activeSec / 60)}m · ${h.productivity}%`}
              />
            </div>
            <span className="mt-1.5 text-[10px] text-slate-500">{h.hour}:00</span>
            <div className="absolute -top-8 hidden rounded-lg bg-slate-800 px-2 py-1 text-[10px] text-white group-hover:block">
              {h.productivity}%
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-emerald-400" /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-slate-700" /> Idle
        </span>
      </div>
    </div>
  )
}

export function TrendChart({
  data,
  height = 140,
}: {
  data: { day: string; productivity: number; hours: number }[]
  height?: number
}) {
  const w = 100
  const h = height
  const max = 100
  const step = w / (data.length - 1)

  const points = data.map((d, i) => ({ x: i * step, y: h - (d.productivity / max) * h, d }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath}
          fill="url(#trendGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill="#22d3ee"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08 }}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        {data.map((d, i) => (
          <span key={i}>{d.day}</span>
        ))}
      </div>
    </div>
  )
}

export function DonutChart({
  data,
  size = 160,
}: {
  data: { label: string; value: number; color: string }[]
  size?: number
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
          {data.map((d, i) => {
            const len = (d.value / total) * c
            const seg = (
              <motion.circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${c - len}`}
                initial={{ strokeDashoffset: -offset + c }}
                animate={{ strokeDashoffset: -offset }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              />
            )
            offset += len
            return seg
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.round(total / 3600)}h</span>
          <span className="text-[10px] text-slate-500">total</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-xs text-slate-300">{d.label}</span>
            <span className="ml-auto text-xs font-medium text-slate-400">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
