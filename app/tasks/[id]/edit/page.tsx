import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect, notFound } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { TaskForm } from "@/components/tasks/task-form"

export const dynamic = "force-dynamic"

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: task } = await supabase.from("tasks").select("*").eq("id", params.id).single()

  if (!task) {
    notFound()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Task</h1>
        <TaskForm task={task} />
      </div>
    </AppLayout>
  )
}
