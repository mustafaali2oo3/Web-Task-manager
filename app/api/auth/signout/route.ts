import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "https://v0-task-management-website-793eyczl1-mustafaali2oo3s-projects.vercel.app"))
}
