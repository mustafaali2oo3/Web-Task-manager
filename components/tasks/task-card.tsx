"use client"

import { useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, Clock, Circle } from "lucide-react"

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
  description?: string
  color?: string
}

interface TaskCardProps {
  task: Task
  project?: Project
}

export function TaskCard({ task, project }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createSupabaseClient()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 border-red-500"
      case "medium":
        return "text-yellow-500 border-yellow-500"
      case "low":
        return "text-green-500 border-green-500"
      default:
        return "text-blue-500 border-blue-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-500"
      case "in_progress":
        return "bg-blue-500"
      case "done":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do"
      case "in_progress":
        return "In Progress"
      case "done":
        return "Done"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "todo":
        return <Circle className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", task.id)

      if (error) throw error

      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete task",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleTaskStatus = async () => {
    setIsUpdatingStatus(true)

    // Cycle through statuses: todo -> in_progress -> done -> todo
    const newStatus = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo"

    try {
      const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id)

      if (error) throw error

      toast({
        title: "Status updated",
        description: `Task marked as ${formatStatus(newStatus)}`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update task status",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.due_date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(task.due_date)
    return dueDate < today && task.status !== "done"
  }

  return (
    <Card className={`h-full glass-card animate-fade-in ${isOverdue() ? "border-red-500" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-lg line-clamp-2">{task.title}</h3>
            {task.description && <p className="text-gray-400 text-sm line-clamp-3">{task.description}</p>}
          </div>
          <Button
            variant="ghost"
            className="h-8 w-8 text-gray-400 hover:text-white p-1"
            onClick={toggleTaskStatus}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? <Loader2 className="h-5 w-5 animate-spin" /> : getStatusIcon(task.status)}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </Badge>

          <Badge className={getStatusColor(task.status)}>{formatStatus(task.status)}</Badge>

          {project && (
            <Badge variant="outline" className="border-blue-500 text-blue-500">
              {project.name}
            </Badge>
          )}
        </div>

        {task.due_date && (
          <div className={`mt-4 text-sm ${isOverdue() ? "text-red-500 font-medium" : "text-gray-400"}`}>
            {isOverdue() ? "Overdue: " : "Due: "}
            {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <Link href={`/tasks/${task.id}/edit`}>
          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
