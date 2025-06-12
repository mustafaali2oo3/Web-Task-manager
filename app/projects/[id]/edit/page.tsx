import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect, notFound } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { ProjectForm } from "@/components/projects/project-form"

export const dynamic = "force-dynamic"

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: project } = await supabase.from("projects").select("*").eq("id", params.id).single()

  if (!project) {
    notFound()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <ProjectForm project={project} />
      </div>
    </AppLayout>
  )
}
