import { AuthForm } from "@/components/auth/auth-form"
import { createServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { HomeButton } from "@/components/home-button"

export const dynamic = "force-dynamic"

export default async function Home({ searchParams }: { searchParams: { redirect?: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Error checking session:", error)
    // Continue rendering the page even if there's an error
  }

  // Get the redirect path from query params (used when redirected from middleware)
  const redirectPath = searchParams.redirect || "/dashboard"

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h1 className="text-2xl font-bold gradient-text">TaskFlow</h1>
          </div>

          <div className="flex items-center gap-4">
            <HomeButton />
          </div>
        </header>

        <main className="py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  Manage tasks with <span className="gradient-text">ease</span> and{" "}
                  <span className="gradient-text">efficiency</span>
                </h1>
                <p className="mt-4 text-xl text-gray-400">
                  Streamline your workflow, organize projects, and boost productivity with our powerful task management
                  platform.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-500/20 p-1 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Organize Tasks</h3>
                    <p className="text-gray-400">Group tasks by projects and set priorities</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-500/20 p-1 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Track Deadlines</h3>
                    <p className="text-gray-400">Set due dates and never miss a deadline</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-500/20 p-1 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Filter & Sort</h3>
                    <p className="text-gray-400">Find tasks by status, priority, or project</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <AuthForm redirectPath={redirectPath} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
