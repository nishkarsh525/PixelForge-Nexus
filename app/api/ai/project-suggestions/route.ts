import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { generateProjectSuggestions } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Project name and description are required" }, { status: 400 })
    }

    const suggestions = await generateProjectSuggestions(name, description)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("AI suggestions error:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
