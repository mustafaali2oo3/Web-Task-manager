"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export function HomeButton() {
  const router = useRouter()

  const handleClick = () => {
    // Explicitly redirect to the dashboard page
    router.push("dashboard/page1.tsx")
    console.log("Redirecting to dashboard page")
  }

  return (
    <Button onClick={handleClick} variant="outline" className="flex items-center gap-2">
      <Home className="h-4 w-4" />
      Dashboard
    </Button>
  )
}
