"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast-provider"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  CheckCircle2,
  Circle,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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
  projects?: {
    id: string
    name: string
    color?: string
  } | null
}

interface TaskTableProps {
  initialTasks: Task[]
  showViewAll?: boolean
}

export function TaskTable({ initialTasks, showViewAll = false }: TaskTableProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAddTask = () => {
    setSelectedTask(undefined)
    setIsDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    setIsDeleting(taskId)
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      setTasks(tasks.filter((task) => task.id !== taskId))

      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete task",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleTaskSaved = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, projects(id, name, color)")
        .order("created_at", { ascending: false })

      if (error) throw error

      setTasks(data || [])
      router.refresh()
    } catch (error) {
      console.error("Error refreshing tasks:", error)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">
            Low
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "todo":
        return <Circle className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  // Check if task is overdue
  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === "done") return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(task.due_date)
    return dueDate < today
  }

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-8 bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {showViewAll && (
              <Link href="/tasks">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Button onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{getStatusIcon(task.status)}</TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      {task.projects ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: task.projects.color || "#3b82f6" }}
                          />
                          <span>{task.projects.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.due_date ? (
                        <div className={`flex items-center gap-1 ${isOverdue(task) ? "text-red-500" : ""}`}>
                          {isOverdue(task) && <AlertCircle className="h-3 w-3" />}
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">No due date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={isDeleting === task.id}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting === task.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <AlertCircle className="h-8 w-8 mb-2" />
                      {searchQuery ? (
                        <p>No tasks found matching your search.</p>
                      ) : (
                        <p>No tasks found. Create your first task to get started.</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={selectedTask}
        onTaskSaved={handleTaskSaved}
      />
    </>
  )
}
