import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getSession()
    await requireAuth(["project_lead"])(user)

    const projects = await sql`
      SELECT 
        p.*,
        COUNT(pa.user_id) as assigned_count
      FROM projects p
      LEFT JOIN project_assignments pa ON p.id = pa.project_id AND pa.role = 'developer'
      LEFT JOIN project_assignments lead_assignment ON p.id = lead_assignment.project_id 
        AND lead_assignment.user_id = ${user!.id} AND lead_assignment.role = 'lead'
      WHERE lead_assignment.user_id IS NOT NULL OR p.created_by = ${user!.id}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `

    return NextResponse.json(projects)
  } catch (error: any) {
    console.error("Get project lead projects error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      {
        status: error.message === "Authentication required" || error.message === "Insufficient permissions" ? 403 : 500,
      },
    )
  }
}
