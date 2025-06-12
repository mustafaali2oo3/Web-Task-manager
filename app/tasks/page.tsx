import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { TaskCard } from "@/components/tasks/task-card"
import { Button } from "@/components/ui/button"
import { TaskFilter } from "@/components/tasks/task-filter"
import Link from "next/link"
import { Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Parse filter parameters
  const status = searchParams.status as string | undefined
  const priority = searchParams.priority as string | undefined
  const projectId = searchParams.project as string | undefined
  const date = searchParams.date as string | undefined
  const search = searchParams.search as string | undefined

  // Build query
  let query = supabase
    .from("tasks")
    .select(`
      *,
      projects(id, name, color)
    `)
    .eq("user_id", session.user.id)

  if (status) {
    query = query.eq("status", status)
  }

  if (priority) {
    query = query.eq("priority", priority)
  }

  if (projectId) {
    query = query.eq("project_id", projectId)
  }

  if (date) {
    query = query.eq("due_date", date)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Execute query
  const { data: tasks, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Tasks</h1>

          <Link href="/tasks/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>

        <TaskFilter />

        {tasks && tasks.length > 0 ? (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} project={task.projects} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-blue-500/20 p-3 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <h3 className="text-xl font-medium">No tasks found</h3>
            <p className="text-gray-400 mt-1">
              {Object.keys(searchParams).length > 0
                ? "Try changing your filters or create a new task"
                : "Get started by creating your first task"}
            </p>
            <Link href="/tasks/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Task
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
