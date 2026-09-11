import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Activity,
  ShieldCheck,
  BarChart3,
  Settings,
  Search,
  Bell,
  LaptopMinimal,
  CalendarCheck,
  ListChecks,
  FolderKanban,
  MessageSquare,
  Megaphone,
  Video,
  LogOut,
  Shield,
  User,
  GraduationCap,
  Code2,
} from 'lucide-react'
import { useAuth } from '../lib/auth'

const adminNav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/internships', label: 'Internships', icon: GraduationCap },
  { to: '/code-editor', label: 'Code Editor', icon: Code2 },
  { to: '/activity', label: 'Live Activity', icon: Activity },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/meetings', label: 'Meetings', icon: Video },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/notices', label: 'Notices', icon: Megaphone },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/security', label: 'Security', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const employerNav = [
  { to: '/my-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'My Tasks', icon: ListChecks },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/meetings', label: 'Meetings', icon: Video },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/notices', label: 'Notices', icon: Megaphone },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ collapsed, onClose }: { collapsed: boolean; onClose: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = user?.role === 'admin' ? adminNav : employerNav

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 lg:translate-x-0 ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
            <LaptopMinimal className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">PulseTrack</p>
            <p className="text-[10px] text-slate-500">WFH Monitoring</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-3 pt-3">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${user?.role === 'admin' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-violet-500/10 text-violet-400'}`}>
            {user?.role === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            <span className="capitalize">{user?.role} Panel</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/my-dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="rounded-lg bg-slate-900 p-3">
            <div className="flex items-center gap-2">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-400"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur lg:px-8">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          placeholder={user?.role === 'admin' ? 'Search employees, devices...' : 'Search tasks, projects...'}
          className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-400">Live</span>
        </div>
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </header>
  )
}
