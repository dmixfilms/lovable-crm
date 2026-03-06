"use client"

import { useState, useEffect } from "react"
import { getLovablePrompt, saveLovablePrompt, getDefaultLovablePrompt } from "@/lib/lovablePrompt"
import { useSettings, useUpdateSettings, type AppSettingsUpdate } from "@/hooks/useSettings"
import Toast from "@/components/ui/Toast"

interface InstagramStatus {
  authenticated: boolean
  status: string
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const [saved, setSaved] = useState(false)
  const [lovablePrompt, setLovablePrompt] = useState("")
  const [formData, setFormData] = useState<AppSettingsUpdate>({})
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [instagramStatus, setInstagramStatus] = useState<InstagramStatus | null>(null)
  const [instagramLoading, setInstagramLoading] = useState(false)
  const [checkingInstagram, setCheckingInstagram] = useState(true)

  useEffect(() => {
    // Load prompt from localStorage on mount
    const prompt = getLovablePrompt()
    setLovablePrompt(prompt)

    // Check Instagram status
    checkInstagramStatus()
  }, [])

  const checkInstagramStatus = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      const response = await fetch("/api/proxy/leads/instagram/status", {
        method: "GET",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      })
      const data = await response.json()
      setInstagramStatus(data)
    } catch (error) {
      console.error("Failed to check Instagram status:", error)
      setInstagramStatus({ authenticated: false, status: "unknown" })
    } finally {
      setCheckingInstagram(false)
    }
  }

  const handleConnectInstagram = async () => {
    setInstagramLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      const response = await fetch("/api/proxy/leads/instagram/init-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      })
      const result = await response.json()

      if (result.success) {
        setToast({
          message: "✅ Instagram conectado com sucesso!",
          type: "success",
        })
        // Refresh status
        await checkInstagramStatus()
      } else {
        setToast({
          message: `❌ Erro: ${result.message || "Não foi possível conectar"}`,
          type: "error",
        })
      }
    } catch (error) {
      setToast({
        message: "❌ Erro ao conectar Instagram",
        type: "error",
      })
      console.error("Error connecting Instagram:", error)
    } finally {
      setInstagramLoading(false)
    }
  }

  useEffect(() => {
    // Load settings into form
    if (settings) {
      setFormData({
        daily_import_enabled: settings.daily_import_enabled,
        daily_import_first_hour: settings.daily_import_first_hour,
        daily_import_first_minute: settings.daily_import_first_minute,
        daily_import_second_enabled: settings.daily_import_second_enabled,
        daily_import_second_hour: settings.daily_import_second_hour,
        daily_import_second_minute: settings.daily_import_second_minute,
        daily_import_limit: settings.daily_import_limit,
        search_radius_meters: settings.search_radius_meters,
        import_keywords: settings.import_keywords,
        import_suburbs: settings.import_suburbs,
        lovable_preview_cost_aud: settings.lovable_preview_cost_aud,
        target_profit_margin: settings.target_profit_margin,
        preview_expiry_days: settings.preview_expiry_days,
        timezone: settings.timezone,
      })
    }
  }, [settings])

  const handleSave = () => {
    // Save prompt to localStorage (fresh save, clears old cache)
    saveLovablePrompt(lovablePrompt)
    console.log("💾 Prompt saved:", lovablePrompt.substring(0, 100) + "...")

    // Save settings to backend
    updateSettings.mutate(formData, {
      onSuccess: () => {
        setSaved(true)
        setToast({
          message: "✓ Settings saved! Prompt atualizado para o Lovable",
          type: "success",
        })
        setTimeout(() => setSaved(false), 5000)
      },
      onError: () => {
        setToast({ message: "✗ Failed to save settings", type: "error" })
      },
    })
  }

  const handleResetPrompt = () => {
    const defaultPrompt = getDefaultLovablePrompt()
    setLovablePrompt(defaultPrompt)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    )
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">📥 Import Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.daily_import_enabled ?? true}
                  onChange={(e) => handleInputChange("daily_import_enabled", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700">Enable Daily Import</span>
              </label>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Import Time (Sydney Time)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.daily_import_first_hour ?? 7}
                      onChange={(e) => handleInputChange("daily_import_first_hour", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Hour"
                    />
                    <p className="text-xs text-slate-500 mt-1 text-center">Hour</p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.daily_import_first_minute ?? 0}
                      onChange={(e) => handleInputChange("daily_import_first_minute", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Minute"
                    />
                    <p className="text-xs text-slate-500 mt-1 text-center">Minute</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.daily_import_second_enabled ?? false}
                    onChange={(e) => handleInputChange("daily_import_second_enabled", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">Enable Second Daily Import</span>
                </label>
              </div>

              {formData.daily_import_second_enabled && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Second Import Time (Sydney Time)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={formData.daily_import_second_hour ?? 19}
                        onChange={(e) => handleInputChange("daily_import_second_hour", parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Hour"
                      />
                      <p className="text-xs text-slate-500 mt-1 text-center">Hour</p>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={formData.daily_import_second_minute ?? 0}
                        onChange={(e) => handleInputChange("daily_import_second_minute", parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Minute"
                      />
                      <p className="text-xs text-slate-500 mt-1 text-center">Minute</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Daily Import Limit
              </label>
              <input
                type="number"
                value={formData.daily_import_limit ?? 30}
                onChange={(e) => handleInputChange("daily_import_limit", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Maximum number of leads to import per day
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Radius (meters)
              </label>
              <input
                type="number"
                value={formData.search_radius_meters ?? 5000}
                onChange={(e) => handleInputChange("search_radius_meters", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Import Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={formData.import_keywords ?? ""}
                onChange={(e) => handleInputChange("import_keywords", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
              />
              <p className="text-xs text-slate-500 mt-1">
                Examples: restaurant, cafe, gym, hair salon, beauty, dentist
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Import Suburbs (comma-separated)
              </label>
              <input
                type="text"
                value={formData.import_suburbs ?? ""}
                onChange={(e) => handleInputChange("import_suburbs", e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
              />
              <p className="text-xs text-slate-500 mt-1">
                Examples: Surry Hills, Newtown, Bondi, Parramatta, Chatswood
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">💰 Financial Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Average Lovable Preview Cost (A$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.lovable_preview_cost_aud ?? 50}
                onChange={(e) => handleInputChange("lovable_preview_cost_aud", parseFloat(e.target.value))}
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
                value={formData.target_profit_margin ?? 60}
                onChange={(e) => handleInputChange("target_profit_margin", parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">📱 Instagram Integration</h2>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Status da Conexão</p>
                  <p className="text-sm text-slate-600">
                    {checkingInstagram ? (
                      "Verificando..."
                    ) : instagramStatus?.authenticated ? (
                      <span className="text-green-600 font-medium">✅ Conectado ao Instagram</span>
                    ) : (
                      <span className="text-slate-600">Não conectado</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleConnectInstagram}
                  disabled={instagramLoading || (instagramStatus?.authenticated ?? false)}
                  title={instagramStatus?.authenticated ? "Já conectado" : "Clique para conectar sua conta Instagram"}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    instagramStatus?.authenticated
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-pink-600 text-white hover:bg-pink-700 disabled:bg-gray-400"
                  }`}
                >
                  {instagramLoading ? "🔄 Conectando..." : instagramStatus?.authenticated ? "✓ Conectado" : "🔐 Conectar Instagram"}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Conecte sua conta do Instagram para buscar automaticamente perfis de negócios ao procurar por leads.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">⏰ Preview Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preview Expiry Days
              </label>
              <input
                type="number"
                value={formData.preview_expiry_days ?? 7}
                onChange={(e) => handleInputChange("preview_expiry_days", parseInt(e.target.value))}
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
                💡 <span className="font-semibold">Pro tip:</span> Use {`{{business_name}}, {{owner_name}}, {{suburb}}, {{phone}}, {{website_url}}, {{email}}, {{industry}}, {{address}}, {{instagram}}`} as variables. They'll be auto-filled when you create a preview.
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
            disabled={updateSettings.isPending}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
