import { createContext, useContext, useState, type ReactNode } from 'react'

export type UserRole = 'admin' | 'employer'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  department?: string
  employeeId?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string, role: UserRole) => { success: boolean; error?: string }
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// Demo credentials
const credentials: Record<string, { password: string; user: AuthUser }> = {
  'admin@acme.io': {
    password: 'admin123',
    user: {
      id: 'admin-001',
      name: 'Admin Console',
      email: 'admin@acme.io',
      role: 'admin',
      avatar: '',
    },
  },
  'sarah.chen@acme.io': {
    password: 'employee123',
    user: {
      id: 'EMP-001',
      name: 'Sarah Chen',
      email: 'sarah.chen@acme.io',
      role: 'employer',
      avatar: '/avatars/emp1.jpg',
      department: 'Engineering',
      employeeId: 'EMP-001',
    },
  },
  'marcus.j@acme.io': {
    password: 'employee123',
    user: {
      id: 'EMP-002',
      name: 'Marcus Johnson',
      email: 'marcus.j@acme.io',
      role: 'employer',
      avatar: '/avatars/emp2.jpg',
      department: 'Finance',
      employeeId: 'EMP-002',
    },
  },
  'priya.patel@acme.io': {
    password: 'employee123',
    user: {
      id: 'EMP-003',
      name: 'Priya Patel',
      email: 'priya.patel@acme.io',
      role: 'employer',
      avatar: '/avatars/emp3.jpg',
      department: 'Design',
      employeeId: 'EMP-003',
    },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  function login(email: string, password: string, role: UserRole): { success: boolean; error?: string } {
    const normalizedEmail = email.toLowerCase().trim()
    const cred = credentials[normalizedEmail]
    if (!cred) {
      return { success: false, error: 'No account found with this email address.' }
    }
    if (cred.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' }
    }
    if (cred.user.role !== role) {
      return { success: false, error: `This account is registered as ${cred.user.role === 'admin' ? 'an admin' : 'an employer'}, not ${role === 'admin' ? 'an admin' : 'an employer'}.` }
    }
    setUser(cred.user)
    return { success: true }
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const demoAccounts = [
  { role: 'admin' as const, email: 'admin@acme.io', password: 'admin123', name: 'Admin Console', avatar: '' },
  { role: 'employer' as const, email: 'sarah.chen@acme.io', password: 'employee123', name: 'Sarah Chen', avatar: '/avatars/emp1.jpg' },
  { role: 'employer' as const, email: 'marcus.j@acme.io', password: 'employee123', name: 'Marcus Johnson', avatar: '/avatars/emp2.jpg' },
  { role: 'employer' as const, email: 'priya.patel@acme.io', password: 'employee123', name: 'Priya Patel', avatar: '/avatars/emp3.jpg' },
]
