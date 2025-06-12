"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Filter, X, Check, Loader2 } from "lucide-react"

interface Project {
  id: string
  name: string
  color?: string
}

export function TaskFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined,
  )

  // Get current filter values from URL
  const status = searchParams.get("status") || ""
  const priority = searchParams.get("priority") || ""
  const projectId = searchParams.get("project") || ""
  const date = searchParams.get("date") || ""
  const search = searchParams.get("search") || ""

  // Count active filters
  const activeFilterCount = [status, priority, projectId, date].filter(Boolean).length

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("projects").select("id, name, color").order("name")

        if (error) throw error
        setProjects(data || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [supabase])

  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value)
      }
    })

    return newSearchParams.toString()
  }

  const handleFilterChange = (key: string, value: string | null) => {
    router.push(`${pathname}?${createQueryString({ [key]: value })}`)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    handleFilterChange("date", date ? format(date, "yyyy-MM-dd") : null)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchQuery = formData.get("search") as string
    handleFilterChange("search", searchQuery || null)
  }

  const clearAllFilters = () => {
    router.push(pathname)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Input name="search" placeholder="Search tasks..." defaultValue={search} className="pl-10" />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </form>

        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">{activeFilterCount}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2 text-xs">
                      <X className="h-3 w-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={status === "todo" ? "default" : "outline"}
                      onClick={() => handleFilterChange("status", status === "todo" ? null : "todo")}
                      className="h-8"
                    >
                      To Do
                      {status === "todo" && <Check className="ml-2 h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "in_progress" ? "default" : "outline"}
                      onClick={() => handleFilterChange("status", status === "in_progress" ? null : "in_progress")}
                      className="h-8"
                    >
                      In Progress
                      {status === "in_progress" && <Check className="ml-2 h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "done" ? "default" : "outline"}
                      onClick={() => handleFilterChange("status", status === "done" ? null : "done")}
                      className="h-8"
                    >
                      Done
                      {status === "done" && <Check className="ml-2 h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={priority === "high" ? "default" : "outline"}
                      onClick={() => handleFilterChange("priority", priority === "high" ? null : "high")}
                      className="h-8"
                    >
                      High
                      {priority === "high" && <Check className="ml-2 h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={priority === "medium" ? "default" : "outline"}
                      onClick={() => handleFilterChange("priority", priority === "medium" ? null : "medium")}
                      className="h-8"
                    >
                      Medium
                      {priority === "medium" && <Check className="ml-2 h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={priority === "low" ? "default" : "outline"}
                      onClick={() => handleFilterChange("priority", priority === "low" ? null : "low")}
                      className="h-8"
                    >
                      Low
                      {priority === "low" && <Check className="ml-2 h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </div>
                      {date && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDateSelect(undefined)}
                          className="h-8 px-2 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      className="border border-gray-700 rounded-md"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Project</Label>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {projects.map((project) => (
                        <Button
                          key={project.id}
                          size="sm"
                          variant={projectId === project.id ? "default" : "outline"}
                          onClick={() => handleFilterChange("project", projectId === project.id ? null : project.id)}
                          className="h-8"
                        >
                          <div
                            className="mr-1.5 h-2 w-2 rounded-full"
                            style={{ backgroundColor: project.color || "#3b82f6" }}
                          />
                          {project.name}
                          {projectId === project.id && <Check className="ml-2 h-3 w-3" />}
                        </Button>
                      ))}
                      {projects.length === 0 && <div className="text-sm text-gray-400">No projects found</div>}
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {status && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Status: {status === "todo" ? "To Do" : status === "in_progress" ? "In Progress" : "Done"}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("status", null)} />
            </Badge>
          )}
          {priority && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("priority", null)} />
            </Badge>
          )}
          {date && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Due: {format(new Date(date), "MMM d, yyyy")}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("date", null)} />
            </Badge>
          )}
          {projectId && projects.find((p) => p.id === projectId) && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Project: {projects.find((p) => p.id === projectId)?.name}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("project", null)} />
            </Badge>
          )}
          {search && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Search: {search}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange("search", null)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
