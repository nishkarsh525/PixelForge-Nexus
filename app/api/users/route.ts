import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, requireAuth, hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    await requireAuth(["admin"])(user)

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!["admin", "project_lead", "developer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role})
      RETURNING id, name, email, role, created_at
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Create user error:", error)
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
    await requireAuth(["admin"])(user)

    const users = await sql`
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `

    return NextResponse.json(users)
  } catch (error: any) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      {
        status: error.message === "Authentication required" || error.message === "Insufficient permissions" ? 403 : 500,
      },
    )
  }
}
