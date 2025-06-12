"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Bell, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (data) {
          setUser({
            id: user.id,
            email: user.email || "",
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            created_at: data.created_at,
          })
        }
      }
    }

    fetchUser()
  }, [supabase])

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/tasks") return "Tasks"
    if (pathname === "/calendar") return "Calendar"
    if (pathname === "/settings") return "Settings"
    if (pathname.startsWith("/projects/new")) return "New Project"
    if (pathname.startsWith("/projects") && pathname !== "/projects") return "Project Details"
    if (pathname === "/projects") return "All Projects"
    return "TaskFlow"
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const getUserInitials = () => {
    if (!user?.full_name) return "U"
    return user.full_name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="flex h-16 items-center px-4 border-b border-white/10 bg-black/30 backdrop-blur-sm">
      <h1 className="text-xl font-semibold">{getPageTitle()}</h1>

      <div className="ml-auto flex items-center gap-4">
        <form className="hidden md:flex relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="w-64 pl-8 bg-background/50" />
        </form>

        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || "User"} />
                <AvatarFallback className="bg-blue-600">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" className="hidden md:flex">
          <Plus className="mr-1 h-4 w-4" />
          New Task
        </Button>
      </div>
    </header>
  )
}
