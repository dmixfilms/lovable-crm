"use client"

export default function ImportError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Import Leads</h1>
        <p className="text-slate-600 mt-2">Import leads from Google Places API</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Import Page</h2>
        <p className="text-red-800 mb-4">
          {error?.message || "Failed to load import configuration. Please try again."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
