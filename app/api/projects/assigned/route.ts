import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSession()
    await requireAuth(["developer"])(user)

    const projects = await sql`
      SELECT 
        p.*,
        COUNT(pd.id) as document_count,
        u.name as project_lead
      FROM projects p
      INNER JOIN project_assignments pa ON p.id = pa.project_id 
        AND pa.user_id = ${user!.id} AND pa.role = 'developer'
      LEFT JOIN project_documents pd ON p.id = pd.project_id
      LEFT JOIN project_assignments lead_pa ON p.id = lead_pa.project_id AND lead_pa.role = 'lead'
      LEFT JOIN users u ON lead_pa.user_id = u.id
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC
    `

    return NextResponse.json(projects)
  } catch (error: any) {
    console.error("Get assigned projects error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      {
        status: error.message === "Authentication required" || error.message === "Insufficient permissions" ? 403 : 500,
      },
    )
  }
}
