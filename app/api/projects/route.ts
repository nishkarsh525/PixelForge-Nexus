import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    await requireAuth(["admin"])(user)

    const { name, description, deadline } = await request.json()

    if (!name || !description || !deadline) {
      return NextResponse.json({ error: "Name, description, and deadline are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO projects (name, description, deadline, created_by)
      VALUES (${name}, ${description}, ${deadline}, ${user!.id})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Create project error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      {
        status: error.message === "Authentication required" || error.message === "Insufficient permissions" ? 403 : 500,
      },
    )
  }
}

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    let projects

    if (user.role === "admin") {
      projects = await sql`
        SELECT p.*, u.name as created_by_name 
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        ORDER BY p.created_at DESC
      `
    } else {
      projects = await sql`
        SELECT DISTINCT p.*, u.name as created_by_name 
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_assignments pa ON p.id = pa.project_id
        WHERE pa.user_id = ${user.id} OR p.created_by = ${user.id}
        ORDER BY p.created_at DESC
      `
    }

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
