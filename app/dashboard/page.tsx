"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast-provider"
import { Loader2, Plus, RefreshCw } from "lucide-react"

interface Task {
  id: string
  title: string
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  prioritized?: boolean
  user_id: string
  created_at: string
}

export default function DashboardPage() {
  const supabase = createSupabaseClient()
  const router = useRouter()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editedTaskTitle, setEditedTaskTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [hasPrioritizedColumn, setHasPrioritizedColumn] = useState(true)

  // Check if prioritized column exists
  const checkPrioritizedColumn = async () => {
    try {
      const { data, error } = await supabase.from("tasks").select("prioritized").limit(1)

      if (error && error.message.includes("prioritized")) {
        console.log("Prioritized column does not exist")
        setHasPrioritizedColumn(false)
        return false
      }

      setHasPrioritizedColumn(true)
      return true
    } catch (error) {
      console.log("Error checking prioritized column:", error)
      setHasPrioritizedColumn(false)
      return false
    }
  }

  // Check authentication and get user session
  const checkAuth = async () => {
    try {
      setSessionLoading(true)

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
      }

      if (session && session.user) {
        console.log("User authenticated:", session.user.email)
        setUser(session.user)
        return session.user
      }

      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User error:", userError)
      }

      if (authUser) {
        console.log("User found via getUser:", authUser.email)
        setUser(authUser)
        return authUser
      }

      console.log("No authenticated user found")
      return null
    } catch (error) {
      console.error("Auth check error:", error)
      return null
    } finally {
      setSessionLoading(false)
    }
  }

  const fetchTasks = async (currentUser?: any) => {
    try {
      setLoading(true)

      const userToUse = currentUser || user

      if (!userToUse) {
        console.error("No user available for fetching tasks")
        return
      }

      console.log("Fetching tasks for user:", userToUse.id)

      // Check if prioritized column exists first
      const columnExists = await checkPrioritizedColumn()

      // Build select query based on column availability
      const selectFields = columnExists
        ? "id, title, status, priority, user_id, created_at, prioritized"
        : "id, title, status, priority, user_id, created_at"

      const { data, error } = await supabase
        .from("tasks")
        .select(selectFields)
        .eq("user_id", userToUse.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tasks:", error)
        toast({
          variant: "destructive",
          title: "Database Error",
          description: `Failed to fetch tasks: ${error.message}`,
        })
        return
      }

      console.log("Fetched tasks:", data)

      // Add default prioritized value if column doesn't exist
      const tasksWithDefaults = (data || []).map((task) => ({
        ...task,
        prioritized: task.prioritized ?? task.priority === "high", // Default based on priority
      }))

      setTasks(tasksWithDefaults)
    } catch (error) {
      console.error("Unexpected error fetching tasks:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching tasks.",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTask = async () => {
    if (newTask.trim() === "" || !user) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a task title.",
      })
      return
    }

    try {
      setAdding(true)
      console.log("Adding task:", { title: newTask, priority: newTaskPriority, user_id: user.id })

      const baseTaskData = {
        title: newTask.trim(),
        status: "todo" as const,
        priority: newTaskPriority,
        user_id: user.id,
      }

      // Add prioritized field only if column exists
      const taskData = hasPrioritizedColumn
        ? { ...baseTaskData, prioritized: newTaskPriority === "high" }
        : baseTaskData

      const { data, error } = await supabase.from("tasks").insert([taskData]).select()

      if (error) {
        console.error("Insert error:", error)
        toast({
          variant: "destructive",
          title: "Database Error",
          description: `Failed to add task: ${error.message}`,
        })
        return
      }

      console.log("Task added successfully:", data)

      if (data && data.length > 0) {
        const newTaskWithDefaults = {
          ...data[0],
          prioritized: data[0].prioritized ?? data[0].priority === "high",
        }
        setTasks((prevTasks) => [newTaskWithDefaults, ...prevTasks])
        setNewTask("")
        setNewTaskPriority("medium")
        toast({
          title: "Success",
          description: "Task added successfully!",
        })
      }
    } catch (error) {
      console.error("Unexpected error adding task:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while adding the task.",
      })
    } finally {
      setAdding(false)
    }
  }

  const deleteTask = async (id: string) => {
    if (!user) return

    try {
      console.log("Deleting task:", id)

      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Delete error:", error)
        toast({
          variant: "destructive",
          title: "Database Error",
          description: `Failed to delete task: ${error.message}`,
        })
        return
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      })
    } catch (error) {
      console.error("Unexpected error deleting task:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting the task.",
      })
    }
  }

  const prioritizeTask = async (id: string, current: boolean) => {
    if (!user) return

    // If prioritized column doesn't exist, show a message
    if (!hasPrioritizedColumn) {
      toast({
        variant: "destructive",
        title: "Feature Not Available",
        description: "The prioritized feature requires a database update. Please run the migration script.",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ prioritized: !current })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Update error:", error)
        toast({
          variant: "destructive",
          title: "Database Error",
          description: `Failed to update task priority: ${error.message}`,
        })
        return
      }

      setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, prioritized: !current } : task)))

      toast({
        title: "Success",
        description: `Task ${!current ? "prioritized" : "unprioritized"} successfully!`,
      })
    } catch (error) {
      console.error("Unexpected error updating priority:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating priority.",
      })
    }
  }

  const saveEditedTask = async (id: string) => {
    if (editedTaskTitle.trim() === "" || !user) return

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ title: editedTaskTitle.trim() })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Update error:", error)
        toast({
          variant: "destructive",
          title: "Database Error",
          description: `Failed to update task: ${error.message}`,
        })
        return
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? { ...task, title: editedTaskTitle.trim() } : task)),
      )

      setEditingTaskId(null)
      setEditedTaskTitle("")

      toast({
        title: "Success",
        description: "Task updated successfully!",
      })
    } catch (error) {
      console.error("Unexpected error updating task:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating the task.",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action()
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

  // Initialize authentication and data fetching
  useEffect(() => {
    const initializeDashboard = async () => {
      console.log("Initializing dashboard...")
      const authenticatedUser = await checkAuth()
      if (authenticatedUser) {
        await fetchTasks(authenticatedUser)
      } else {
        setTimeout(() => {
          if (!user) {
            console.log("No user after delay, redirecting to home")
            router.push("/")
          }
        }, 1000)
      }
    }

    initializeDashboard()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      if (event === "SIGNED_OUT") {
        setUser(null)
        router.push("/")
      } else if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        await fetchTasks(session.user)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading dashboard...</p>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Authenticating...</p>
          <p className="text-sm text-muted-foreground">Please wait while we verify your session...</p>
        </div>
      </div>
    )
  }

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
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => fetchTasks()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <span className="text-sm text-gray-400">Welcome, {user.email}</span>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/")
              }}
            >
              Logout
            </Button>
          </div>
        </header>

        {!hasPrioritizedColumn && (
          <div className="mb-4">
            <Card className="border-yellow-500/50 bg-yellow-500/10">
              <CardContent className="p-4">
                <p className="text-yellow-600 dark:text-yellow-400">
                  <strong>Notice:</strong> The prioritized feature is not available. Please run the database migration
                  script to enable this feature.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <main className="py-6 space-y-6">
          {/* Add Task Form */}
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add New Task</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addTask)}
                    placeholder="Enter task title..."
                    disabled={adding}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select value={newTaskPriority} onValueChange={(value: any) => setNewTaskPriority(value)}>
                    <SelectTrigger id="task-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addTask} disabled={adding || !newTask.trim()}>
                    {adding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="workflow" className="w-full">
            <TabsList>
              <TabsTrigger value="workflow">Task Workflow ({tasks.length})</TabsTrigger>
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
                        <TableHead>Prioritized</TableHead>
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
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {task.status === "todo"
                                ? "To Do"
                                : task.status === "in_progress"
                                  ? "In Progress"
                                  : "Done"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={task.prioritized ? "default" : "secondary"}
                              className={task.prioritized ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}
                            >
                              {task.prioritized ? "Yes" : "No"}
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
                                  onClick={() => prioritizeTask(task.id, task.prioritized || false)}
                                  disabled={!hasPrioritizedColumn}
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
