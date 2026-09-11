import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'text-cyan-400',
  trend,
}: {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  accent?: string
  trend?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur transition hover:border-slate-700"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`rounded-lg bg-slate-800/60 p-2 ${accent}`}>{icon}</div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500">vs yesterday</span>
        </div>
      )}
    </motion.div>
  )
}

export function ProgressBar({
  value,
  max = 100,
  color = 'bg-cyan-500',
  className = '',
}: {
  value: number
  max?: number
  color?: string
  className?: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-800 ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  )
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}) {
  const variants = {
    default: 'bg-slate-800 text-slate-300',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger: 'bg-rose-500/15 text-rose-400',
    info: 'bg-cyan-500/15 text-cyan-400',
    neutral: 'bg-slate-700 text-slate-400',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

export function Ring({
  value,
  size = 120,
  stroke = 10,
  color = '#22d3ee',
  label,
  sublabel,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  label?: string
  sublabel?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-white tabular-nums">{label ?? `${value}%`}</span>
        {sublabel && <span className="text-[10px] text-slate-500">{sublabel}</span>}
      </div>
    </div>
  )
}
