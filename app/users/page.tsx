import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { UsersManagement } from "@/components/users-management"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function UsersPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <DashboardLayout user={user}>
      <UsersManagement />
    </DashboardLayout>
  )
}
