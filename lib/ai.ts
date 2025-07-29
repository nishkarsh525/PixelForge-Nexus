import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export async function generateProjectSuggestions(projectName: string, description: string) {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Based on the project name "${projectName}" and description "${description}", provide 3-5 actionable suggestions for project management, team collaboration, or technical implementation. Keep suggestions practical and specific.`,
      system: "You are an expert project manager and technical consultant for game development projects.",
    })

    return text
  } catch (error) {
    console.error("AI suggestion generation failed:", error)
    return "AI suggestions temporarily unavailable."
  }
}

export async function analyzeProjectRisks(projectData: {
  name: string
  description: string
  deadline: string
  teamSize: number
}) {
  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Analyze potential risks for this game development project:
      
Project: ${projectData.name}
Description: ${projectData.description}
Deadline: ${projectData.deadline}
Team Size: ${projectData.teamSize}

Identify 3-5 key risks and provide mitigation strategies.`,
      system: "You are a senior project manager specializing in game development risk assessment.",
    })

    return text
  } catch (error) {
    console.error("Risk analysis failed:", error)
    return "Risk analysis temporarily unavailable."
  }
}
