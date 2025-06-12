"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { AppLayout } from "@/components/layout/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/settings/user-profile"
import { SecuritySettings } from "@/components/settings/security-settings"
import { Loader2 } from "lucide-react"
import type { User } from "@/lib/types"

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/")
          return
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (error) throw error

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
        })
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router, supabase])

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : user ? (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <UserProfile user={user} />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Failed to load user data. Please try again later.</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
