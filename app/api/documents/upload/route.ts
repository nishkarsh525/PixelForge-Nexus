import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, requireAuth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    await requireAuth(["admin", "project_lead"])(user)

    const formData = await request.formData()
    const file = formData.get("file") as File
    const projectId = formData.get("projectId") as string

    if (!file || !projectId) {
      return NextResponse.json({ error: "File and project ID are required" }, { status: 400 })
    }

    // Verify user has access to this project
    if (user!.role !== "admin") {
      const projectAccess = await sql`
        SELECT p.id FROM projects p
        LEFT JOIN project_assignments pa ON p.id = pa.project_id
        WHERE p.id = ${Number.parseInt(projectId)} 
        AND (p.created_by = ${user!.id} OR (pa.user_id = ${user!.id} AND pa.role = 'lead'))
      `

      if (projectAccess.length === 0) {
        return NextResponse.json({ error: "Access denied to this project" }, { status: 403 })
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", projectId)
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save to database
    const result = await sql`
      INSERT INTO project_documents (project_id, name, file_path, file_size, mime_type, uploaded_by)
      VALUES (
        ${Number.parseInt(projectId)}, 
        ${file.name}, 
        ${`/uploads/${projectId}/${filename}`}, 
        ${file.size}, 
        ${file.type}, 
        ${user!.id}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      {
        status: error.message === "Authentication required" || error.message === "Insufficient permissions" ? 403 : 500,
      },
    )
  }
}
