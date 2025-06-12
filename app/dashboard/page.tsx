import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { TaskTable } from "@/components/tasks/task-table"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TaskAnalytics } from "@/components/dashboard/task-analytics"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Fetch task statistics
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, projects(id, name, color)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  const { data: projects } = await supabase.from("projects").select("*").eq("user_id", session.user.id)

  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter((task) => task.status === "done").length || 0
  const totalProjects = projects?.length || 0

  // Calculate overdue tasks
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueTasks =
    tasks?.filter((task) => {
      if (!task.due_date || task.status === "done") return false
      const dueDate = new Date(task.due_date)
      return dueDate < today
    }).length || 0

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <StatsCards
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          totalProjects={totalProjects}
          overdueTasks={overdueTasks}
        />

        <TaskAnalytics tasks={tasks || []} />

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Tasks</h2>
          <TaskTable initialTasks={tasks?.slice(0, 5) || []} showViewAll={true} />
        </div>
      </div>
    </AppLayout>
  )
}
