// app/workflow/page.tsx

"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function WorkflowPage() {
  const supabase = createClientComponentClient()
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editedTaskTitle, setEditedTaskTitle] = useState("")

  const fetchTasks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setTasks(data)
    }
  }

  const addTask = async () => {
    if (newTask.trim() === "") return

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) return

    const { error } = await supabase.from("tasks").insert([
      {
        title: newTask,
        status: "todo",
        priority: "medium",
        prioritized: false,
        user_id: user.id,
        created_at: new Date(),
      },
    ])

    if (!error) {
      setNewTask("")
      await fetchTasks()
    }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (!error) fetchTasks()
  }

  const prioritizeTask = async (id: string, current: boolean) => {
    const { error } = await supabase.from("tasks").update({ prioritized: !current }).eq("id", id)
    if (!error) fetchTasks()
  }

  const saveEditedTask = async (id: string) => {
    if (editedTaskTitle.trim() === "") return
    const { error } = await supabase.from("tasks").update({ title: editedTaskTitle }).eq("id", id)
    if (!error) {
      setEditingTaskId(null)
      setEditedTaskTitle("")
      fetchTasks()
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
            <h1 className="text-2xl font-bold gradient-text">TaskFlow</h1>
          </div>
        </header>

        <main className="py-6 space-y-6">
          <div className="flex items-center gap-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter new task"
              className="max-w-sm"
            />
            <Button onClick={addTask} variant="default">Add Task</Button>
          </div>

          <Tabs defaultValue="workflow" className="w-full">
            <TabsList>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
            </TabsList>
            <Separator className="my-4" />

            <div className="overflow-x-auto">
              {tasks.length === 0 ? (
                <p className="text-muted">No tasks yet. Add one above!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
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
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditedTask(task.id)
                              }}
                            />
                          ) : (
                            <span className={task.prioritized ? "text-blue-400 font-semibold" : ""}>{task.title}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={task.prioritized ? "default" : "secondary"} className={task.prioritized ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}>
                            {task.prioritized ? "High" : "Normal"}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex flex-wrap gap-2">
                          {editingTaskId === task.id ? (
                            <Button size="sm" variant="success" onClick={() => saveEditedTask(task.id)}>Save</Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingTaskId(task.id)
                              setEditedTaskTitle(task.title)
                            }}>
                              Edit
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => deleteTask(task.id)}>Delete</Button>
                          <Button size="sm" variant="secondary" onClick={() => prioritizeTask(task.id, task.prioritized)}>
                            {task.prioritized ? "Unprioritize" : "Prioritize"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

