import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    await requireAuth(["project_lead", "admin"])(user)

    const projectId = Number.parseInt(params.id)
    const { developerIds } = await request.json()

    // First, remove all existing developer assignments for this project
    await sql`
      DELETE FROM project_assignments 
      WHERE project_id = ${projectId} AND role = 'developer'
    `

    // Then add the new assignments
    if (developerIds && developerIds.length > 0) {
      for (const developerId of developerIds) {
        await sql`
          INSERT INTO project_assignments (project_id, user_id, role)
          VALUES (${projectId}, ${developerId}, 'developer')
        `
      }
    }

    return NextResponse.json({ message: "Team assignments updated successfully" })
  } catch (error: any) {
    console.error("Assign team error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      {
        status: error.message === "Authentication required" || error.message === "Insufficient permissions" ? 403 : 500,
      },
    )
  }
}
