import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ProjectLeadDashboard } from "@/components/project-lead-dashboard"
import { DeveloperDashboard } from "@/components/developer-dashboard"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function DashboardPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "admin":
        return <AdminDashboard user={user} />
      case "project_lead":
        return <ProjectLeadDashboard user={user} />
      case "developer":
        return <DeveloperDashboard user={user} />
      default:
        return <div>Invalid role</div>
    }
  }

  return <DashboardLayout user={user}>{renderDashboard()}</DashboardLayout>
}
