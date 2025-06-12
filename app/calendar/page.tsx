"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { createSupabaseClient } from "@/lib/supabase"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react"
import type { Task } from "@/lib/types"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add days from previous and next month to fill the calendar grid
  const startDay = monthStart.getDay() // 0 = Sunday, 1 = Monday, etc.
  const endDay = monthEnd.getDay()

  const prevMonthDays =
    startDay > 0
      ? Array.from({ length: startDay }, (_, i) => {
          const d = new Date(monthStart)
          d.setDate(-i)
          return d
        }).reverse()
      : []

  const nextMonthDays =
    endDay < 6
      ? Array.from({ length: 6 - endDay }, (_, i) => {
          const d = new Date(monthEnd)
          d.setDate(monthEnd.getDate() + i + 1)
          return d
        })
      : []

  const allDays = [...prevMonthDays, ...monthDays, ...nextMonthDays]

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          return
        }

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", session.user.id)
          .not("due_date", "is", null)

        if (error) throw error
        setTasks(data || [])
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tasks",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [supabase, toast])

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return tasks.filter((task) => task.due_date === dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const handleTaskSaved = () => {
    // Refresh tasks after a new task is created
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase.from("tasks").select("*").not("due_date", "is", null)

        if (error) throw error
        setTasks(data || [])
      } catch (error) {
        console.error("Error refreshing tasks:", error)
      }
    }

    fetchTasks()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <h2 className="text-lg font-medium min-w-[150px] text-center">{format(currentDate, "MMMM yyyy")}</h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-medium py-2">
                    {day}
                  </div>
                ))}

                {allDays.map((day, i) => {
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isToday = isSameDay(day, new Date())
                  const dayTasks = getTasksForDate(day)

                  return (
                    <div
                      key={i}
                      className={`min-h-[100px] p-1 border rounded-md ${
                        isCurrentMonth ? "bg-black/20" : "bg-black/10 text-muted-foreground"
                      } ${isToday ? "border-blue-500" : "border-transparent"}`}
                      onClick={() => isCurrentMonth && handleDateClick(day)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${isToday ? "text-blue-500" : ""}`}>
                          {format(day, "d")}
                        </span>
                        {isCurrentMonth && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDateClick(day)
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Add task</span>
                          </Button>
                        )}
                      </div>

                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded truncate ${
                              task.priority === "high"
                                ? "bg-red-500/20 text-red-500"
                                : task.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : "bg-green-500/20 text-green-500"
                            }`}
                          >
                            {task.title}
                          </div>
                        ))}

                        {dayTasks.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">+{dayTasks.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedDate && (
        <TaskDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          task={{
            id: "",
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            due_date: format(selectedDate, "yyyy-MM-dd"),
            user_id: "",
            created_at: "",
          }}
          onTaskSaved={handleTaskSaved}
        />
      )}
    </AppLayout>
  )
}
