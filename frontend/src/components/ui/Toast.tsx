"use client"
import { useEffect } from "react"

interface ToastProps {
  message: string
  type: "success" | "error"
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
  const icon = type === "success" ? "✓" : "✕"

  return (
    <div className={`fixed bottom-6 right-6 border rounded-lg p-4 shadow-lg flex items-center gap-3 ${bgColor}`}>
      <span className="text-lg font-bold">{icon}</span>
      <p>{message}</p>
    </div>
  )
}
