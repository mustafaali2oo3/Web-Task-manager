"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast-provider"

interface Project {
  id: string
  name: string
  description?: string
  color?: string
  user_id: string
  created_at: string
}

export default function DeleteProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/")
          return
        }

        const { data, error } = await supabase.from("projects").select("*").eq("id", params.id).single()

        if (error || !data) {
          throw error || new Error("Project not found")
        }

        setProject(data)
      } catch (error) {
        console.error("Error fetching project:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load project details",
        })
        router.push("/projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params.id, router, supabase, toast])

  const handleDelete = async () => {
    if (!project) return

    setDeleting(true)

    try {
      // First delete all tasks associated with this project
      const { error: tasksError } = await supabase.from("tasks").delete().eq("project_id", project.id)

      if (tasksError) throw tasksError

      // Then delete the project
      const { error } = await supabase.from("projects").delete().eq("id", project.id)

      if (error) throw error

      toast({
        title: "Project deleted",
        description: "The project and all its tasks have been deleted",
      })

      router.push("/projects")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete project",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : project ? (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Delete Project
              </CardTitle>
              <CardDescription>
                Are you sure you want to delete this project? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Project Name</h3>
                  <p>{project.name}</p>
                </div>

                {project.description && (
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p>{project.description}</p>
                  </div>
                )}

                <div className="rounded-md bg-red-500/10 p-4 text-red-500">
                  <p className="text-sm">
                    <strong>Warning:</strong> Deleting this project will also delete all tasks associated with it.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCancel} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Project"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Project Not Found</CardTitle>
              <CardDescription>The project you are trying to delete could not be found.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => router.push("/projects")}>Back to Projects</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
