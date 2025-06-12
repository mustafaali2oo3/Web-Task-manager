"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { createPortal } from "react-dom"

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastContextValue = {
  toast: (props: Omit<ToastProps, "id">) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 md:max-w-[420px]">
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                title={toast.title}
                description={toast.description}
                variant={toast.variant}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

interface ToastComponentProps extends Omit<ToastProps, "id"> {
  onClose: () => void
}

function Toast({ title, description, variant = "default", onClose }: ToastComponentProps) {
  return (
    <div
      className={`pointer-events-auto relative w-full rounded-lg border p-4 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-5 ${
        variant === "destructive" ? "border-red-700 bg-red-900/80 text-white" : "border-gray-700 bg-black/80 text-white"
      }`}
    >
      <div className="flex w-full justify-between">
        <div className="flex w-full flex-col gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:text-white" aria-label="Close toast">
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
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}
