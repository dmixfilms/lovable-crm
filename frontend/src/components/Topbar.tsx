"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  role: string
}

export default function Topbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) return

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data)
        }
      } catch (err) {
        console.error("Failed to fetch user:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900">Lovable CRM</h1>
      </div>

      <div className="flex items-center gap-4">
        {!loading && user && (
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user.email}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        )}
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
          {user?.email?.charAt(0).toUpperCase() || "?"}
        </div>
      </div>
    </header>
  )
}
