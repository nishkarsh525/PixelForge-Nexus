import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST() {
  try {
    // Check if admin user already exists
    const existingAdmin = await sql`
      SELECT id FROM users WHERE email = 'admin@pixelforge.com'
    `

    if (existingAdmin.length > 0) {
      return NextResponse.json({ message: "Admin user already exists" })
    }

    // Create admin user with properly hashed password
    const hashedPassword = await hashPassword("admin123")

    await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('admin@pixelforge.com', ${hashedPassword}, 'System Admin', 'admin')
    `

    return NextResponse.json({ message: "Admin user created successfully" })
  } catch (error) {
    console.error("Init error:", error)
    return NextResponse.json({ error: "Failed to initialize admin user" }, { status: 500 })
  }
}
