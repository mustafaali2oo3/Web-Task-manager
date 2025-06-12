export type User = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export type Project = {
  id: string
  name: string
  description?: string
  color?: string
  user_id: string
  created_at: string
}

export type Task = {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  due_date?: string
  project_id?: string
  user_id: string
  created_at: string
}

export type TaskWithProject = Task & {
  project?: Project
}
