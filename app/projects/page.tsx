import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ProjectsList } from "@/components/projects-list"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function ProjectsPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardLayout user={user}>
      <ProjectsList user={user} />
    </DashboardLayout>
  )
}
