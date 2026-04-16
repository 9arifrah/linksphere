'use client'

import { useState } from 'react'
import { QrCode, Link2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface BackfillResult {
  success: boolean
  totalLinks: number
  shortCodesGenerated: number
  qrCodesGenerated: number
  errors: number
  error?: string
}

export function BackfillActions() {
  const [loading, setLoading] = useState<'short_code' | 'qr_code' | 'all' | null>(null)
  const [result, setResult] = useState<BackfillResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleBackfill(type: 'short_code' | 'qr_code' | 'all') {
    setLoading(type)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/admin/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan')
        return
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur p-4 sm:p-6 shadow-slack-md">
      <div className="mb-4 sm:mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-amber-600">
          <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Migrasi Data</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Isi short code & QR code untuk link yang belum memiliki
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Short Code Backfill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md border border-slate-700/50 bg-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-900/30">
              <Link2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Generate Short Code</p>
              <p className="text-xs text-slate-400">
                Buat short code unik (6 karakter) untuk semua link yang belum memiliki
              </p>
            </div>
          </div>
          <button
            onClick={() => handleBackfill('short_code')}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading === 'short_code' && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading === 'short_code' ? 'Memproses...' : 'Generate'}
          </button>
        </div>

        {/* QR Code Backfill */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md border border-slate-700/50 bg-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-900/30">
              <QrCode className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Generate QR Code</p>
              <p className="text-xs text-slate-400">
                Buat QR code untuk semua link yang belum memiliki (lebih lambat)
              </p>
            </div>
          </div>
          <button
            onClick={() => handleBackfill('qr_code')}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading === 'qr_code' && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading === 'qr_code' ? 'Memproses...' : 'Generate'}
          </button>
        </div>

        {/* Generate All */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md border border-amber-700/50 bg-amber-900/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-900/30">
              <QrCode className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Generate Semua</p>
              <p className="text-xs text-slate-400">
                Buat short code + QR code untuk semua link yang belum memiliki
              </p>
            </div>
          </div>
          <button
            onClick={() => handleBackfill('all')}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading === 'all' && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading === 'all' ? 'Memproses...' : 'Generate Semua'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-md border border-green-700/50 bg-green-900/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <p className="text-sm font-medium text-green-400">Berhasil!</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-slate-800/50 p-3">
                <p className="text-slate-400 text-xs">Total Link</p>
                <p className="text-white font-semibold text-lg">{result.totalLinks}</p>
              </div>
              <div className="rounded-md bg-slate-800/50 p-3">
                <p className="text-slate-400 text-xs">Short Code Dibuat</p>
                <p className="text-blue-400 font-semibold text-lg">{result.shortCodesGenerated}</p>
              </div>
              <div className="rounded-md bg-slate-800/50 p-3">
                <p className="text-slate-400 text-xs">QR Code Dibuat</p>
                <p className="text-green-400 font-semibold text-lg">{result.qrCodesGenerated}</p>
              </div>
              <div className="rounded-md bg-slate-800/50 p-3">
                <p className="text-slate-400 text-xs">Error</p>
                <p className={`font-semibold text-lg ${result.errors > 0 ? 'text-red-400' : 'text-white'}`}>
                  {result.errors}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-md border border-red-700/50 bg-red-900/20 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}