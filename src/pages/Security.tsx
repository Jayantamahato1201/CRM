import { Shield, ShieldCheck, ShieldAlert, Lock, Eye, KeyRound, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Card, Badge, ProgressBar, StatCard } from '../components/ui'
import { employees } from '../lib/data'

export function Security() {
  const verified = employees.filter((e) => e.webcamVerified)
  const unverified = employees.filter((e) => !e.webcamVerified)
  const securityScore = Math.round((verified.length / employees.length) * 100)

  const securityEvents = [
    { type: 'success', title: 'Webcam verification completed', desc: 'Sarah Chen (EMP-001) verified identity', time: '2m ago' },
    { type: 'warning', title: 'Idle threshold exceeded', desc: 'David Kim (EMP-004) idle for 18 minutes', time: '18m ago' },
    { type: 'danger', title: 'Webcam verification pending', desc: 'David Kim (EMP-004) has not completed verification', time: '1h ago' },
    { type: 'success', title: 'VPN connection established', desc: 'Elena Rodriguez (EMP-005) connected via secure tunnel', time: '2h ago' },
    { type: 'warning', title: 'Unusual app usage detected', desc: 'Streaming media detected on Priya Patel device', time: '3h ago' },
    { type: 'success', title: 'Device health check passed', desc: 'Thomas Müller (EMP-008) disk usage at 91%', time: '4h ago' },
  ]

  const policies = [
    { name: 'Screenshot capture', enabled: true, desc: 'Automatic screenshots every 3 minutes' },
    { name: 'Webcam verification', enabled: true, desc: 'Periodic identity verification via webcam' },
    { name: 'Keystroke logging', enabled: true, desc: 'Aggregate keystroke counts (no content stored)' },
    { name: 'App & URL tracking', enabled: true, desc: 'Monitor active applications and browser tabs' },
    { name: 'Idle detection', enabled: true, desc: 'Flag inactivity beyond 10 minutes' },
    { name: 'Location tracking', enabled: false, desc: 'GPS location of remote devices' },
    { name: 'VPN enforcement', enabled: true, desc: 'Require corporate VPN for work apps' },
    { name: 'USB device blocking', enabled: false, desc: 'Block external storage devices' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Security & Compliance</h1>
        <p className="text-sm text-slate-400">Monitoring policies, access controls, and audit trail</p>
      </div>

      {/* Security score */}
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Security Score"
          value={`${securityScore}%`}
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="text-emerald-400"
          sub="compliance rating"
        />
        <StatCard
          label="Verified Employees"
          value={`${verified.length}/${employees.length}`}
          icon={<Eye className="h-5 w-5" />}
          accent="text-cyan-400"
          sub="webcam verified"
        />
        <StatCard
          label="Active Policies"
          value={policies.filter((p) => p.enabled).length}
          icon={<KeyRound className="h-5 w-5" />}
          accent="text-violet-400"
          sub={`of ${policies.length} total`}
        />
        <StatCard
          label="Pending Alerts"
          value={unverified.length}
          icon={<ShieldAlert className="h-5 w-5" />}
          accent="text-amber-400"
          sub="need attention"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Policies */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-white">Monitoring Policies</h2>
          <div className="space-y-2">
            {policies.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${p.enabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {p.enabled ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.desc}</p>
                  </div>
                </div>
                <Badge variant={p.enabled ? 'success' : 'neutral'}>
                  {p.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Compliance ring */}
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Compliance Status</h2>
          <div className="space-y-4">
            {[
              { label: 'GDPR Compliance', value: 92 },
              { label: 'Data Encryption', value: 100 },
              { label: 'Access Controls', value: 88 },
              { label: 'Audit Logging', value: 95 },
            ].map((c) => (
              <div key={c.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{c.label}</span>
                  <span className="text-xs font-medium text-white">{c.value}%</span>
                </div>
                <ProgressBar
                  value={c.value}
                  color={c.value >= 90 ? 'bg-emerald-500' : c.value >= 75 ? 'bg-amber-500' : 'bg-rose-500'}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-semibold">All systems compliant</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Last audit completed 2 days ago. No critical violations detected.
            </p>
          </div>
        </Card>
      </div>

      {/* Security events */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-white">Security Event Log</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {securityEvents.map((ev, i) => {
            const cfg = {
              success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
              warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/15' },
              danger: { icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/15' },
            }[ev.type]!
            return (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2 ${cfg.bg}`}>
                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{ev.title}</p>
                  <p className="text-xs text-slate-500">{ev.desc}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-500">{ev.time}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
