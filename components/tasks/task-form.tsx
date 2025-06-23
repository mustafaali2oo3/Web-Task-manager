"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast-provider"
import { Loader2, AlertCircle } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  due_date?: string
  project_id?: string
  user_id: string
  created_at: string
}

interface Project {
  id: string
  name: string
}

interface TaskFormProps {
  task?: Task
}

export function TaskForm({ task }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">(task?.status || "todo")
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "medium")
  const [dueDate, setDueDate] = useState(task?.due_date || "")
  const [projectId, setProjectId] = useState<string | undefined>(task?.project_id)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingProjects, setFetchingProjects] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  const isEditing = !!task

  useEffect(() => {
    const fetchProjects = async () => {
      setFetchingProjects(true)
      try {
        const { data, error } = await supabase.from("projects").select("id, name").order("name")

        if (error) throw error
        setProjects(data || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load projects. Please try again.",
        })
      } finally {
        setFetchingProjects(false)
      }
    }

    fetchProjects()
  }, [supabase, toast])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (dueDate) {
      const selectedDate = new Date(dueDate)
      if (isNaN(selectedDate.getTime())) {
        newErrors.dueDate = "Invalid date format"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const taskData = {
        title,
        description: description || null,
        status,
        priority,
        due_date: dueDate || null,
        project_id: projectId || null,
      }

      if (isEditing) {
        const { error } = await supabase.from("tasks").update(taskData).eq("id", task.id)

        if (error) throw error

        toast({
          title: "Task updated",
          description: "Your task has been updated successfully",
        })
      } else {
        const { error } = await supabase.from("tasks").insert([taskData])

        if (error) throw error

        toast({
          title: "Task created",
          description: "Your new task has been created successfully",
        })
      }

      router.refresh()
      router.push("/tasks")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save task",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto glass-card">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Task" : "Create New Task"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <div className="flex items-center text-red-500 text-xs mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.title}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description (optional)"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "todo" | "in_progress" | "done")}
                className="flex h-9 w-full rounded-md border border-gray-700 bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="flex h-9 w-full rounded-md border border-gray-700 bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={errors.dueDate ? "border-red-500" : ""}
              />
              {errors.dueDate && (
                <div className="flex items-center text-red-500 text-xs mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.dueDate}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <select
                id="project"
                value={projectId || ""}
                onChange={(e) => setProjectId(e.target.value || undefined)}
                disabled={fetchingProjects}
                className="flex h-9 w-full rounded-md border border-gray-700 bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {fetchingProjects && (
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading projects...
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Saving..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Task"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
