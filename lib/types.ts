import type { TaskPriority, TaskStatus } from "./database.types"

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
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  prioritized: boolean
  due_date?: string
  project_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export type TaskWithProject = Task & {
  project?: Project
}

// Priority and Status constants for consistency
export const TASK_PRIORITIES: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: {
    label: "Low",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  high: {
    label: "High",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
} as const

export const TASK_STATUSES: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: {
    label: "To Do",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  done: {
    label: "Done",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
} as const

// Helper functions
export const getPriorityConfig = (priority: TaskPriority) => TASK_PRIORITIES[priority]
export const getStatusConfig = (status: TaskStatus) => TASK_STATUSES[status]

// Form validation schemas
export const taskPriorityOptions = Object.entries(TASK_PRIORITIES).map(([value, config]) => ({
  value: value as TaskPriority,
  label: config.label,
}))

export const taskStatusOptions = Object.entries(TASK_STATUSES).map(([value, config]) => ({
  value: value as TaskStatus,
  label: config.label,
}))
