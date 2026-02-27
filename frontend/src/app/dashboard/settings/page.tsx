"use client"

import { useState, useEffect } from "react"
import { getLovablePrompt, saveLovablePrompt, getDefaultLovablePrompt } from "@/lib/lovablePrompt"

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [lovablePrompt, setLovablePrompt] = useState("")

  useEffect(() => {
    // Load prompt from localStorage on mount
    const prompt = getLovablePrompt()
    setLovablePrompt(prompt)
  }, [])

  const handleSave = () => {
    // Save prompt to localStorage
    saveLovablePrompt(lovablePrompt)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleResetPrompt = () => {
    const defaultPrompt = getDefaultLovablePrompt()
    setLovablePrompt(defaultPrompt)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Configure your CRM preferences</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">✓ Settings saved successfully</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="Lovable CRM"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time Zone
              </label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Australia/Sydney</option>
                <option>Australia/Melbourne</option>
                <option>Australia/Brisbane</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">API Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Google Places API Key
              </label>
              <input
                type="password"
                placeholder="Enter your API key"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Used for importing leads from Google Places
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Daily Import Limit
              </label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Maximum number of leads to import per day
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Financial Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Average Lovable Preview Cost (A$)
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue="50"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Profit Margin (%)
              </label>
              <input
                type="number"
                step="0.1"
                defaultValue="60"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Preview Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preview Expiry Days
              </label>
              <input
                type="number"
                defaultValue="7"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                How many days before a preview expires
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">🚀 Lovable Prompt</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Prompt Sent to Lovable
                </label>
                <button
                  onClick={handleResetPrompt}
                  className="text-xs text-slate-500 hover:text-slate-700 border-b border-dotted hover:border-solid"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                value={lovablePrompt}
                onChange={(e) => setLovablePrompt(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs h-64 resize-vertical"
                placeholder="Enter your Lovable prompt..."
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 <span className="font-semibold">Pro tip:</span> Use {`{{business_name}}, {{owner_name}}, {{suburb}}, {{phone}}, {{website_url}}`} as variables. They'll be auto-filled when you create a preview.
              </p>
              <p className="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded">
                This prompt is sent to Lovable when you click "Criar com Lovable" button. Improve it over time to get better results!
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Save Settings
          </button>
          <button className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Cancel
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">System Information</h2>
        <div className="text-sm text-blue-800 space-y-1">
          <p>Backend: FastAPI on http://localhost:8000</p>
          <p>Frontend: Next.js on http://localhost:3000</p>
          <p>Database: SQLite</p>
        </div>
      </div>
    </div>
  )
}
