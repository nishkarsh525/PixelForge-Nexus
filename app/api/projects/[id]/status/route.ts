import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, requireAuth } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    await requireAuth(["admin"])(user)

    const projectId = Number.parseInt(params.id)
    const { status } = await request.json()

    if (!["active", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await sql`
      UPDATE projects 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${projectId}
    `

    return NextResponse.json({ message: "Project status updated successfully" })
  } catch (error: any) {
    console.error("Update project status error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      {
        status: error.message === "Authentication required" || error.message === "Insufficient permissions" ? 403 : 500,
      },
    )
  }
}
