import { StatsCard } from "@/components/dashboard/stats-card"
import { TaskAnalytics } from "@/components/dashboard/task-analytics"
import { TaskOverview } from "@/components/dashboard/task-overview"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const userEmail = session.user.email

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6 gradient-text">TaskFlow</h2>
        <nav className="space-y-4">
          <Link href="/dashboard" className="block px-3 py-2 rounded-md bg-blue-600 text-white font-medium">
            Dashboard
          </Link>
          <Link href="/tasks" className="block px-3 py-2 rounded-md hover:bg-gray-800 transition">
            Tasks
          </Link>
          <Link href="/settings" className="block px-3 py-2 rounded-md hover:bg-gray-800 transition">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold gradient-text">Welcome back, {userEmail?.split("@")[0] || "User"} 👋</h1>
          </div>
        </header>

        <main className="space-y-12">
          {/* Stats Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Stats</h2>
            <StatsCard />
          </section>

          {/* Task Analytics */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Task Analytics</h2>
            <TaskAnalytics />
          </section>

          {/* Task Overview */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Task Overview</h2>
            <TaskOverview />
          </section>
        </main>
      </div>
    </div>
  )
}
