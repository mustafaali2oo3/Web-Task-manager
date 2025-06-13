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

  // Calculate tasks due today
  const tasksDueToday =
    tasks?.filter((task) => {
      if (!task.due_date || task.status === "done") return false
      const dueDate = new Date(task.due_date)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate.getTime() === today.getTime()
    }).length || 0

  // Calculate completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Welcome back, {session.user.email?.split("@")[0] || "User"}
            </span>
          </div>
        </div>

        <StatsCards
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          totalProjects={totalProjects}
          overdueTasks={overdueTasks}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Task Overview</h2>
            <div className="rounded-lg border bg-card p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm font-medium">{completionRate}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium">Due Today</div>
                  <div className="text-2xl font-bold">{tasksDueToday}</div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium">Overdue</div>
                  <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Project Status</h2>
            <div className="rounded-lg border bg-card p-6">
              {projects && projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => {
                    const projectTasks = tasks?.filter((task) => task.project_id === project.id) || []
                    const projectCompletedTasks = projectTasks.filter((task) => task.status === "done").length
                    const projectCompletionRate =
                      projectTasks.length > 0 ? Math.round((projectCompletedTasks / projectTasks.length) * 100) : 0

                    return (
                      <div key={project.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{project.name}</span>
                          <span className="text-sm font-medium">{projectCompletionRate}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full"
                            style={{
                              width: `${projectCompletionRate}%`,
                              backgroundColor: project.color || "#3b82f6",
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {projects.length > 3 && (
                    <div className="mt-2 text-center">
                      <a href="/projects" className="text-sm text-primary hover:underline">
                        View all projects
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-[100px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">No projects found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <TaskAnalytics tasks={tasks || []} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Tasks</h2>
            <a href="/tasks" className="text-sm text-primary hover:underline">
              View all tasks
            </a>
          </div>
          <TaskTable initialTasks={tasks?.slice(0, 5) || []} showViewAll={true} />
        </div>
      </div>
    </AppLayout>
  )
}
