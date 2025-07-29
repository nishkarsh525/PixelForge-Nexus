import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const projectId = Number.parseInt(params.id)

    // Get project details
    const projectResult = await sql`
      SELECT * FROM projects WHERE id = ${projectId}
    `

    if (projectResult.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const project = projectResult[0]

    // Check if user has access to this project
    if (user.role !== "admin") {
      const accessCheck = await sql`
        SELECT 1 FROM project_assignments 
        WHERE project_id = ${projectId} AND user_id = ${user.id}
        UNION
        SELECT 1 FROM projects 
        WHERE id = ${projectId} AND created_by = ${user.id}
      `

      if (accessCheck.length === 0) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
    }

    // Get team members
    const teamMembers = await sql`
      SELECT u.id, u.name, u.email, pa.role
      FROM users u
      JOIN project_assignments pa ON u.id = pa.user_id
      WHERE pa.project_id = ${projectId}
      ORDER BY pa.role, u.name
    `

    // Get documents
    const documents = await sql`
      SELECT pd.*, u.name as uploader_name
      FROM project_documents pd
      JOIN users u ON pd.uploaded_by = u.id
      WHERE pd.project_id = ${projectId}
      ORDER BY pd.uploaded_at DESC
    `

    return NextResponse.json({
      ...project,
      team_members: teamMembers,
      documents,
    })
  } catch (error) {
    console.error("Get project details error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
