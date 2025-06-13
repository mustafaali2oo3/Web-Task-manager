"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export function HomeButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push("/page2")
    console.log("Redirecting to /dashboard")
  }

  return (
    <Button onClick={handleClick} variant="outline" className="flex items-center gap-2">
      <Home className="h-4 w-4" />
      Home
    </Button>
  )
}
