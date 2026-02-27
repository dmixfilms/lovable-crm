"use client"

export default function Topbar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900">Lovable CRM</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
          👤
        </div>
      </div>
    </header>
  )
}
