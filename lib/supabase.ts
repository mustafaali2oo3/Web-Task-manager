import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Use environment variables if available, otherwise use the provided values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://heucqienzarcotiwvuyn.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhldWNxaWVuemFyY290aXd2dXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTQ5NDMsImV4cCI6MjA2NTMzMDk0M30.kkyrLsFAgrlV9S_gQghfesVTWSWORFlGZ8Ekc6ECjN4"

// Create a singleton instance for the client-side
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

// Frontend client
export const createSupabaseClient = () => {
  if (typeof window !== "undefined" && clientInstance) {
    return clientInstance
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  if (typeof window !== "undefined") {
    clientInstance = client
  }

  return client
}

// Server-side client (API routes, getServerSideProps, etc.)
export const createServerSupabaseClient = () => {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE || supabaseAnonKey
  return createClient<Database>(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
