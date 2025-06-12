"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"

interface Task {
  id: string
  title: string
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  created_at: string
  due_date?: string
}

interface TaskAnalyticsProps {
  tasks: Task[]
}

export function TaskAnalytics({ tasks }: TaskAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("week")

  // Filter tasks based on timeframe
  const filteredTasks = tasks.filter((task) => {
    const taskDate = new Date(task.created_at)
    const now = new Date()

    if (timeframe === "week") {
      return taskDate >= subDays(now, 7)
    } else if (timeframe === "month") {
      return taskDate >= subDays(now, 30)
    }

    return true
  })

  // Calculate completion rate
  const completedTasks = filteredTasks.filter((task) => task.status === "done").length
  const completionRate = filteredTasks.length > 0 ? Math.round((completedTasks / filteredTasks.length) * 100) : 0

  // Calculate priority distribution
  const highPriorityTasks = filteredTasks.filter((task) => task.priority === "high").length
  const mediumPriorityTasks = filteredTasks.filter((task) => task.priority === "medium").length
  const lowPriorityTasks = filteredTasks.filter((task) => task.priority === "low").length

  // Calculate status distribution
  const todoTasks = filteredTasks.filter((task) => task.status === "todo").length
  const inProgressTasks = filteredTasks.filter((task) => task.status === "in_progress").length
  const doneTasks = filteredTasks.filter((task) => task.status === "done").length

  // Calculate overdue tasks
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueTasks = filteredTasks.filter((task) => {
    if (!task.due_date || task.status === "done") return false
    const dueDate = new Date(task.due_date)
    return dueDate < today
  }).length

  // Calculate weekly activity
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
  const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 })
  const daysOfWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek })

  const weeklyActivity = daysOfWeek.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd")
    return {
      day: format(day, "EEE"),
      count: filteredTasks.filter((task) => {
        const taskDate = new Date(task.created_at)
        return format(taskDate, "yyyy-MM-dd") === dayStr
      }).length,
    }
  })

  // Find the max count for scaling
  const maxCount = Math.max(...weeklyActivity.map((d) => d.count), 1)

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Task Analytics</CardTitle>
            <CardDescription>Overview of your task performance and activity</CardDescription>
          </div>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as "week" | "month" | "all")}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Completion Rate */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">Completion Rate</h3>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="ml-auto text-sm text-gray-400">
                {completedTasks} of {filteredTasks.length} tasks completed
              </div>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">Overdue Tasks</h3>
            <div className="flex items-center">
              <div className="text-2xl font-bold text-red-500">{overdueTasks}</div>
              <div className="ml-auto text-sm text-gray-400">
                {overdueTasks > 0
                  ? `${Math.round((overdueTasks / filteredTasks.length) * 100)}% of all tasks`
                  : "No overdue tasks"}
              </div>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${filteredTasks.length > 0 ? (overdueTasks / filteredTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <Separator className="md:col-span-2" />

          {/* Priority Distribution */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Priority Distribution</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-16 text-sm">High</div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${filteredTasks.length > 0 ? (highPriorityTasks / filteredTasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-10 text-right text-sm">{highPriorityTasks}</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 text-sm">Medium</div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{
                        width: `${filteredTasks.length > 0 ? (mediumPriorityTasks / filteredTasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-10 text-right text-sm">{mediumPriorityTasks}</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 text-sm">Low</div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${filteredTasks.length > 0 ? (lowPriorityTasks / filteredTasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-10 text-right text-sm">{lowPriorityTasks}</div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Status Distribution</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-16 text-sm">To Do</div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500 rounded-full"
                      style={{ width: `${filteredTasks.length > 0 ? (todoTasks / filteredTasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="w-10 text-right text-sm">{todoTasks}</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 text-sm">Progress</div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${filteredTasks.length > 0 ? (inProgressTasks / filteredTasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-10 text-right text-sm">{inProgressTasks}</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 text-sm">Done</div>
                <div className="flex-1">
                  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${filteredTasks.length > 0 ? (doneTasks / filteredTasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="w-10 text-right text-sm">{doneTasks}</div>
              </div>
            </div>
          </div>

          <Separator className="md:col-span-2" />

          {/* Weekly Activity */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Weekly Activity</h3>
            <div className="flex items-end justify-between h-32">
              {weeklyActivity.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full">
                  <div
                    className="w-full max-w-[30px] bg-blue-500/80 rounded-t-sm"
                    style={{
                      height: `${(day.count / maxCount) * 100}%`,
                      minHeight: day.count > 0 ? "4px" : "0",
                    }}
                  />
                  <div className="text-xs text-gray-400">{day.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
