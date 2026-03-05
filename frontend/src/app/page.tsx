"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

      if (token) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error during redirect:", error)
      // Fallback to login if there's an error
      router.push("/login")
    }

    // Timeout to prevent infinite redirect
    const timeout = setTimeout(() => {
      setIsRedirecting(false)
      // If still on home page after 3 seconds, force go to login
      if (window.location.pathname === "/") {
        window.location.href = "/login"
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [router])

  if (!isRedirecting && window.location.pathname === "/") {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <p className="text-gray-600">Redirecting to login...</p>
        <a href="/login" className="text-blue-600 hover:underline">
          Click here if not redirected
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  )
}
