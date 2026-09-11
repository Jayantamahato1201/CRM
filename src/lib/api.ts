import type { Employee } from './types'

const API_BASE = '/api'

export interface CreatedEmployee {
  employee: Employee
  credentials: {
    employeeId: string
    email: string
    password: string
  }
}

export async function createEmployee(data: {
  name: string
  email: string
  role: string
  department: string
  location: string
  shiftStart: string
  shiftEnd: string
  device: string
  os: string
  avatar: string
}): Promise<CreatedEmployee> {
  const res = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to create employee')
  return json
}

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API_BASE}/employees`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to fetch employees')
  return json
}
