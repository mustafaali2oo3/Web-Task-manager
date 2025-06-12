"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  Home,
  ListTodo,
  Calendar,
  Settings,
  LogOut,
  PlusCircle,
  Loader2,
  FolderKanban,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { Project } from "@/lib/types"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const { data: projectData, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setProjects(projectData || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()

    // Subscribe to changes
    const projectsSubscription = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        () => {
          fetchProjects()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(projectsSubscription)
    }
  }, [supabase])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "Logged out successfully",
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      })
    } finally {
      setLogoutLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/50 border-r border-white/10 w-64">
      <div className="p-4">
        <Link href="/dashboard">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold gradient-text">TaskFlow</h1>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant={pathname === "/tasks" ? "secondary" : "ghost"} className="w-full justify-start">
                <ListTodo className="mr-2 h-4 w-4" />
                Tasks
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant={pathname === "/calendar" ? "secondary" : "ghost"} className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
            </Link>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="px-3 py-2">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-lg font-semibold">Projects</h2>
            <Link href="/projects/new">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">New Project</span>
              </Button>
            </Link>
          </div>

          <div className="space-y-1">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Button
                    variant={pathname === `/projects/${project.id}` ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <div
                      className="mr-2 h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color || "#3b82f6" }}
                    />
                    <span className="truncate">{project.name}</span>
                  </Button>
                </Link>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground">No projects yet</div>
            )}

            <Link href="/projects">
              <Button variant={pathname === "/projects" ? "secondary" : "ghost"} className="w-full justify-start mt-2">
                <FolderKanban className="mr-2 h-4 w-4" />
                All Projects
              </Button>
            </Link>
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 mt-auto space-y-1">
        <Link href="/settings">
          <Button variant={pathname === "/settings" ? "secondary" : "ghost"} className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
          disabled={logoutLoading}
        >
          {logoutLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
