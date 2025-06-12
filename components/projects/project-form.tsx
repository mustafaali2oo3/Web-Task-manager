"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast-provider"

interface Project {
  id: string
  name: string
  description?: string
  color?: string
  user_id: string
  created_at: string
}

interface ProjectFormProps {
  project?: Project
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6366f1", // indigo
  "#f97316", // orange
]

export function ProjectForm({ project }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || "")
  const [description, setDescription] = useState(project?.description || "")
  const [color, setColor] = useState(project?.color || COLORS[0])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createSupabaseClient()

  const isEditing = !!project

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const projectData = {
        name,
        description: description || null,
        color,
      }

      if (isEditing) {
        const { error } = await supabase.from("projects").update(projectData).eq("id", project.id)

        if (error) throw error

        toast({
          title: "Project updated",
          description: "Your project has been updated successfully",
        })

        router.push(`/projects/${project.id}`)
      } else {
        const { data, error } = await supabase.from("projects").insert([projectData]).select()

        if (error) throw error

        toast({
          title: "Project created",
          description: "Your new project has been created successfully",
        })

        if (data && data[0]) {
          router.push(`/projects/${data[0].id}`)
        } else {
          router.push("/projects")
        }
      }

      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save project",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto glass-card">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Project" : "Create New Project"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description (optional)"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-all ${
                    color === colorOption ? "ring-2 ring-offset-2 ring-blue-500" : ""
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                  aria-label={`Select color ${colorOption}`}
                />
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
