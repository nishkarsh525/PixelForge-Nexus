import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSession()
    await requireAuth(["admin"])(user)

    const [projectStats] = await sql`
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects
      FROM projects
    `

    const [userStats] = await sql`
      SELECT COUNT(*) as total_users FROM users
    `

    const recentProjects = await sql`
      SELECT * FROM projects 
      ORDER BY created_at DESC 
      LIMIT 5
    `

    return NextResponse.json({
      totalProjects: Number.parseInt(projectStats.total_projects),
      activeProjects: Number.parseInt(projectStats.active_projects),
      completedProjects: Number.parseInt(projectStats.completed_projects),
      totalUsers: Number.parseInt(userStats.total_users),
      recentProjects,
    })
  } catch (error: any) {
    console.error("Get admin stats error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      {
        status: error.message === "Authentication required" || error.message === "Insufficient permissions" ? 403 : 500,
      },
    )
  }
}
