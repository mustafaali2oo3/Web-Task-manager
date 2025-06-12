"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export function TaskOverview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

        if (error) throw error
        setTasks(data || [])
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [supabase])

  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress")
  const doneTasks = tasks.filter((task) => task.status === "done")

  const getCompletionRate = () => {
    if (tasks.length === 0) return "0%"
    return `${Math.round((doneTasks.length / tasks.length) * 100)}%`
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Task Overview</CardTitle>
        <CardDescription>Your task completion rate is {getCompletionRate()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
            <TabsTrigger value="todo">To Do ({todoTasks.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="done">Done ({doneTasks.length})</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <TabsContent value="all">
                <TaskList tasks={tasks} />
              </TabsContent>
              <TabsContent value="todo">
                <TaskList tasks={todoTasks} />
              </TabsContent>
              <TabsContent value="in-progress">
                <TaskList tasks={inProgressTasks} />
              </TabsContent>
              <TabsContent value="done">
                <TaskList tasks={doneTasks} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tasks found</div>
  }

  return (
    <div className="space-y-4">
      {tasks.slice(0, 5).map((task) => (
        <div key={task.id} className="flex items-center justify-between border-b pb-2">
          <div>
            <p className="font-medium">{task.title}</p>
            <p className="text-sm text-muted-foreground">
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </p>
          </div>
          <div>
            <span
              className={`inline-block px-2 py-1 text-xs rounded-full ${
                task.status === "todo" ? "bg-slate-500" : task.status === "in_progress" ? "bg-blue-500" : "bg-green-500"
              }`}
            >
              {task.status === "todo" ? "To Do" : task.status === "in_progress" ? "In Progress" : "Done"}
            </span>
          </div>
        </div>
      ))}

      {tasks.length > 5 && (
        <div className="text-center text-sm text-muted-foreground pt-2">+ {tasks.length - 5} more tasks</div>
      )}
    </div>
  )
}
