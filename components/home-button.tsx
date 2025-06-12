"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function HomeButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push("/dashboard")
  }

  return (
    <Button onClick={handleClick} variant="outline" className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      Home
    </Button>
  )
}
