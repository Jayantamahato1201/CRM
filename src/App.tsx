import { useState, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { Sidebar, Topbar } from './components/Layout'
import { Login } from './pages/Login'
import { Overview } from './pages/Overview'
import { EmployerDashboard } from './pages/EmployerDashboard'
import { Employees } from './pages/Employees'
import { EmployeeDetail } from './pages/EmployeeDetail'
import { LiveActivity } from './pages/LiveActivity'
import { Reports } from './pages/Reports'
import { Security } from './pages/Security'
import { Settings } from './pages/Settings'
import { Attendance } from './pages/Attendance'
import { Tasks } from './pages/Tasks'
import { Projects } from './pages/Projects'
import { ProjectDetail } from './pages/ProjectDetail'
import { Chat } from './pages/Chat'
import { Notices } from './pages/Notices'
import { Meetings } from './pages/Meetings'
import { Internships } from './pages/Internships'
import { InternDetail } from './pages/InternDetail'
import { VSCode } from './pages/VSCode'

// Admin-only routes
const adminRoutes = [
  { path: '/employees', element: <Employees /> },
  { path: '/employees/:id', element: <EmployeeDetail /> },
  { path: '/internships', element: <Internships /> },
  { path: '/interns/:id', element: <InternDetail /> },
  { path: '/code-editor', element: <VSCode /> },
  { path: '/activity', element: <LiveActivity /> },
  { path: '/reports', element: <Reports /> },
  { path: '/security', element: <Security /> },
]

function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/my-dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <>
      <Sidebar collapsed={!sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-8">
          <Routes>
            {/* Login redirect */}
            <Route path="/login" element={<Navigate to={user?.role === 'admin' ? '/' : '/my-dashboard'} replace />} />

            {/* Shared routes */}
            <Route path="/my-dashboard" element={<ProtectedLayout><EmployerDashboard /></ProtectedLayout>} />
            <Route path="/attendance" element={<ProtectedLayout><Attendance /></ProtectedLayout>} />
            <Route path="/tasks" element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
            <Route path="/projects" element={<ProtectedLayout><Projects /></ProtectedLayout>} />
            <Route path="/projects/:id" element={<ProtectedLayout><ProjectDetail /></ProtectedLayout>} />
            <Route path="/meetings" element={<ProtectedLayout><Meetings /></ProtectedLayout>} />
            <Route path="/chat" element={<ProtectedLayout><Chat /></ProtectedLayout>} />
            <Route path="/notices" element={<ProtectedLayout><Notices /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />

            {/* Admin-only routes */}
            <Route path="/" element={<AdminRoute><Overview /></AdminRoute>} />
            {adminRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={<AdminRoute>{r.element}</AdminRoute>} />
            ))}

            {/* Fallback */}
            <Route path="*" element={<Navigate to={user?.role === 'admin' ? '/' : '/my-dashboard'} replace />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}

export default App
