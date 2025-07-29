import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AccountSettings } from "@/components/account-settings"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function SettingsPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardLayout user={user}>
      <AccountSettings user={user} />
    </DashboardLayout>
  )
}
