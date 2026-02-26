"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    console.log("🔐 Dashboard: Token found?", !!token)

    if (!token) {
      console.log("❌ No token, redirecting to login")
      router.push("/login")
      return
    }

    // Just accept the token and let data fetching handle validation
    console.log("✅ Dashboard: Token exists, proceeding to dashboard")
    setIsAuthenticated(true)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <Sidebar />
      <main
        className="pt-20 transition-all duration-300"
        style={{ marginLeft: "256px" }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
