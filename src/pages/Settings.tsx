import { useState } from 'react'
import { Camera, Clock, Eye, Keyboard, MousePointerClick, Bell, Lock, Save } from 'lucide-react'
import { Card, Badge } from '../components/ui'

export function Settings() {
  const [screenshotInterval, setScreenshotInterval] = useState(3)
  const [idleThreshold, setIdleThreshold] = useState(10)
  const [productivityGoal, setProductivityGoal] = useState(80)
  const [notifications, setNotifications] = useState({
    lowProductivity: true,
    idleExceeded: true,
    webcamPending: true,
    offlineAlert: false,
    dailyReport: true,
  })

  const toggles = [
    { key: 'lowProductivity', label: 'Low productivity alert', desc: 'Notify when an employee drops below 60%' },
    { key: 'idleExceeded', label: 'Idle threshold exceeded', desc: 'Notify when idle time exceeds the threshold' },
    { key: 'webcamPending', label: 'Webcam verification pending', desc: 'Notify when verification is incomplete' },
    { key: 'offlineAlert', label: 'Employee went offline', desc: 'Notify when an employee disconnects' },
    { key: 'dailyReport', label: 'Daily summary report', desc: 'Send a daily productivity digest at 6 PM' },
  ] as const

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Configure monitoring parameters and preferences</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monitoring intervals */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Camera className="h-4 w-4 text-cyan-400" /> Capture Settings
          </h2>
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm text-slate-300">Screenshot interval</label>
                <Badge variant="info">{screenshotInterval} min</Badge>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={screenshotInterval}
                onChange={(e) => setScreenshotInterval(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <p className="mt-1 text-xs text-slate-500">Screenshots are captured automatically every {screenshotInterval} minutes during active time.</p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm text-slate-300">Idle threshold</label>
                <Badge variant="warning">{idleThreshold} min</Badge>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={idleThreshold}
                onChange={(e) => setIdleThreshold(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="mt-1 text-xs text-slate-500">Employees are flagged as idle after {idleThreshold} minutes of inactivity.</p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm text-slate-300">Productivity goal</label>
                <Badge variant="success">{productivityGoal}%</Badge>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={productivityGoal}
                onChange={(e) => setProductivityGoal(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <p className="mt-1 text-xs text-slate-500">Target productivity benchmark for all employees.</p>
            </div>
          </div>
        </Card>

        {/* Data collection */}
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Eye className="h-4 w-4 text-violet-400" /> Data Collection
          </h2>
          <div className="space-y-3">
            {[
              { icon: Camera, label: 'Screenshot capture', desc: 'Periodic screen captures', on: true },
              { icon: Keyboard, label: 'Keystroke counting', desc: 'Aggregate key counts only', on: true },
              { icon: MousePointerClick, label: 'Mouse activity', desc: 'Clicks and movement tracking', on: true },
              { icon: Eye, label: 'App & URL tracking', desc: 'Active window and browser tabs', on: true },
              { icon: Lock, label: 'Webcam snapshots', desc: 'Periodic identity verification', on: true },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                <div className="rounded-lg bg-slate-800 p-2 text-violet-400">
                  <d.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{d.label}</p>
                  <p className="text-xs text-slate-500">{d.desc}</p>
                </div>
                <button
                  className={`relative h-6 w-11 rounded-full transition ${d.on ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${d.on ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Bell className="h-4 w-4 text-amber-400" /> Notification Preferences
        </h2>
        <div className="space-y-2">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <div>
                <p className="text-sm font-medium text-white">{t.label}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((n) => ({ ...n, [t.key]: !n[t.key] }))}
                className={`relative h-6 w-11 rounded-full transition ${notifications[t.key] ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${notifications[t.key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Save bar */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-400">
          <Save className="h-4 w-4" /> Save changes
        </button>
      </div>
    </div>
  )
}
