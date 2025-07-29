import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProjectDetails } from "@/components/project-details"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  const projectId = Number.parseInt(params.id)

  return (
    <DashboardLayout user={user}>
      <ProjectDetails projectId={projectId} user={user} />
    </DashboardLayout>
  )
}
