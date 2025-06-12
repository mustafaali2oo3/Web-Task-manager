import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { TaskForm } from "@/components/tasks/task-form"

export const dynamic = "force-dynamic"

export default async function NewTaskPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create New Task</h1>
        <TaskForm />
      </div>
    </AppLayout>
  )
}
