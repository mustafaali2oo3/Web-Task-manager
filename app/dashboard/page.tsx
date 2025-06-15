"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast-provider"
import { Loader2 } from "lucide-react"

interface Task {
  id: string
  title: string
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  prioritized: boolean
  user_id: string
  created_at: string
}

export default function DashboardPage() {
  const supabase = createSupabaseClient()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editedTaskTitle, setEditedTaskTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("User fetch error:", userError)
        return
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tasks:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch tasks. Please try again.",
        })
        return
      }

      setTasks(data || [])
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTask = async () => {
    if (newTask.trim() === "") return

    try {
      setAdding(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("User fetch error:", userError)
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to add tasks.",
        })
        return
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: newTask,
            status: "todo",
            priority: "medium",
            prioritized: false,
            user_id: user.id,
          },
        ])
        .select()

      if (error) {
        console.error("Insert error:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add task. Please try again.",
        })
        return
      }

      if (data && data.length > 0) {
        setTasks((prevTasks) => [data[0], ...prevTasks])
        setNewTask("")
        toast({
          title: "Success",
          description: "Task added successfully!",
        })
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    } finally {
      setAdding(false)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) {
        console.error("Delete error:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete task. Please try again.",
        })
        return
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      })
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    }
  }

  const prioritizeTask = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("tasks").update({ prioritized: !current }).eq("id", id)

      if (error) {
        console.error("Update error:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update task priority. Please try again.",
        })
        return
      }

      setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, prioritized: !current } : task)))

      toast({
        title: "Success",
        description: `Task ${!current ? "prioritized" : "unprioritized"} successfully!`,
      })
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    }
  }

  const saveEditedTask = async (id: string) => {
    if (editedTaskTitle.trim() === "") return

    try {
      const { error } = await supabase.from("tasks").update({ title: editedTaskTitle }).eq("id", id)

      if (error) {
        console.error("Update error:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update task. Please try again.",
        })
        return
      }

      setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, title: editedTaskTitle } : task)))

      setEditingTaskId(null)
      setEditedTaskTitle("")

      toast({
        title: "Success",
        description: "Task updated successfully!",
      })
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action()
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h1 className="text-2xl font-bold gradient-text">TaskFlow Dashboard</h1>
          </div>
        </header>

        <main className="py-6 space-y-6">
          <div className="flex items-center gap-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addTask)}
              placeholder="Enter new task"
              className="max-w-sm"
              disabled={adding}
            />
            <Button onClick={addTask} variant="default" disabled={adding || !newTask.trim()}>
              {adding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Task"
              )}
            </Button>
          </div>

          <Tabs defaultValue="workflow" className="w-full">
            <TabsList>
              <TabsTrigger value="workflow">Task Workflow</TabsTrigger>
            </TabsList>
            <Separator className="my-4" />

            <TabsContent value="workflow">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading tasks...</span>
                  </div>
                ) : tasks.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">No tasks yet. Add one above to get started!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            {editingTaskId === task.id ? (
                              <Input
                                value={editedTaskTitle}
                                onChange={(e) => setEditedTaskTitle(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, () => saveEditedTask(task.id))}
                                className="max-w-xs"
                              />
                            ) : (
                              <span className={task.prioritized ? "text-blue-400 font-semibold" : ""}>
                                {task.title}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={task.prioritized ? "default" : "secondary"}
                              className={task.prioritized ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}
                            >
                              {task.prioritized ? "High" : "Normal"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {task.status === "todo"
                                ? "To Do"
                                : task.status === "in_progress"
                                  ? "In Progress"
                                  : "Done"}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex flex-wrap gap-2">
                            {editingTaskId === task.id ? (
                              <>
                                <Button size="sm" variant="default" onClick={() => saveEditedTask(task.id)}>
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingTaskId(null)
                                    setEditedTaskTitle("")
                                  }}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingTaskId(task.id)
                                    setEditedTaskTitle(task.title)
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteTask(task.id)}>
                                  Delete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => prioritizeTask(task.id, task.prioritized)}
                                >
                                  {task.prioritized ? "Unprioritize" : "Prioritize"}
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
