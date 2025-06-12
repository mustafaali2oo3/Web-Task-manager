import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Get task counts for each project
  const projectIds = projects?.map((project) => project.id) || []

  let taskCounts: Record<string, number> = {}

  if (projectIds.length > 0) {
    const { data: tasks } = await supabase.from("tasks").select("project_id").in("project_id", projectIds)

    if (tasks) {
      taskCounts = tasks.reduce((acc: Record<string, number>, task) => {
        if (task.project_id) {
          acc[task.project_id] = (acc[task.project_id] || 0) + 1
        }
        return acc
      }, {})
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Link href="/projects/new">
            <Button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Project
            </Button>
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block">
                <Card className="h-full glass-card hover:border-blue-500/50 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || "#3b82f6" }} />
                      <CardTitle>{project.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.description ? (
                      <p className="text-gray-400 line-clamp-2">{project.description}</p>
                    ) : (
                      <p className="text-gray-400 italic">No description</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-gray-400">{taskCounts[project.id] || 0} tasks</p>
                  </CardFooter>
                </Card>
              </Link>
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
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium">No projects yet</h3>
            <p className="text-gray-400 mt-1">Create your first project to organize your tasks</p>
            <Link href="/projects/new" className="mt-4">
              <Button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create New Project
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
