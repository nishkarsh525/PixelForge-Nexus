import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!, {
  // Suppress the browser warning for development
  disableWarningInBrowsers: true,
})

export { sql }

export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  role: "admin" | "project_lead" | "developer"
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  name: string
  description: string
  deadline: string
  status: "active" | "completed"
  created_by: number
  created_at: string
  updated_at: string
}

export interface ProjectAssignment {
  id: number
  project_id: number
  user_id: number
  role: "lead" | "developer"
  assigned_at: string
}

export interface ProjectDocument {
  id: number
  project_id: number
  name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: number
  uploaded_at: string
}
