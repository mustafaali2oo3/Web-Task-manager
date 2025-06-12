import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { ProjectForm } from "@/components/projects/project-form"

export const dynamic = "force-dynamic"

export default async function NewProjectPage() {
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
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <ProjectForm />
      </div>
    </AppLayout>
  )
}
