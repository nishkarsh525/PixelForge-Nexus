import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    await requireAuth(["project_lead", "admin"])(user)

    const projectId = Number.parseInt(params.id)

    const developers = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        CASE WHEN pa.user_id IS NOT NULL THEN true ELSE false END as is_assigned
      FROM users u
      LEFT JOIN project_assignments pa ON u.id = pa.user_id 
        AND pa.project_id = ${projectId} AND pa.role = 'developer'
      WHERE u.role = 'developer'
      ORDER BY u.name
    `

    return NextResponse.json(developers)
  } catch (error: any) {
    console.error("Get project developers error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      {
        status: error.message === "Authentication required" || error.message === "Insufficient permissions" ? 403 : 500,
      },
    )
  }
}
