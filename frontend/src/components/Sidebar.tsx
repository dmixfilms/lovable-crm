"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    router.push("/login")
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/leads", label: "Leads", icon: "👥" },
    { href: "/dashboard/leads/import", label: "Import", icon: "⬇️" },
    { href: "/dashboard/financials", label: "Financials", icon: "💰" },
    { href: "/dashboard/templates", label: "Templates", icon: "📧" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ]

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
      style={{ paddingTop: "60px" }}
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? "bg-purple-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          {isOpen ? "←" : "→"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          {isOpen ? "Logout" : "🚪"}
        </button>
      </div>
    </aside>
  )
}
