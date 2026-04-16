'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Link, Category } from '@/lib/supabase'

type LinkFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  link?: Link
  categories: Category[]
  userId: string
}

export function LinkFormDialog({ open, onOpenChange, link, categories, userId }: LinkFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [shortCodeError, setShortCodeError] = useState('')
  const [generatingShortCode, setGeneratingShortCode] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category_id: '',
    is_active: true,
    is_public: true,
    short_code: ''
  })

  useEffect(() => {
    if (open) {
      setShortCodeError('')
    }
  }, [open])

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title,
        url: link.url,
        category_id: link.category_id,
        is_active: link.is_active,
        is_public: link.is_public,
        short_code: link.short_code || ''
      })
    } else {
      setFormData({
        title: '',
        url: '',
        category_id: categories[0]?.id || '',
        is_active: true,
        is_public: true,
        short_code: ''
      })
    }
  }, [link, categories])

  const handleGenerateShortCode = async () => {
    setGeneratingShortCode(true)
    setShortCodeError('')

    try {
      const response = await fetch('/api/links/generate-short-code', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, short_code: data.short_code })
      } else {
        const error = await response.json()
        setShortCodeError(error.error || 'Gagal generate short code')
      }
    } catch (error) {
      console.error('[v0] Error generating short code:', error)
      setShortCodeError('Gagal generate short code')
    } finally {
      setGeneratingShortCode(false)
    }
  }

  const handleShortCodeChange = async (value: string) => {
    setFormData({ ...formData, short_code: value })
    setShortCodeError('')

    if (!value) return

    // Basic client-side validation
    if (!/^[a-z0-9-]+$/.test(value)) {
      setShortCodeError('Hanya huruf kecil, angka, dan -')
      return
    }

    if (value.length < 3) {
      setShortCodeError('Minimal 3 karakter')
      return
    }

    // Check reserved words
    const { RESERVED_SHORT_CODES } = await import('@/lib/validation')
    if (RESERVED_SHORT_CODES.includes(value)) {
      setShortCodeError('Short code ini sudah digunakan oleh sistem')
      return
    }

    // Check duplicate (debounced)
    const timeoutId = setTimeout(async () => {
      try {
        const excludeLinkId = link?.id
        const response = await fetch(`/api/links/check-short-code?code=${value}&exclude=${excludeLinkId || ''}`)

        if (!response.ok) {
          const error = await response.json()
          setShortCodeError(error.error || 'Short code sudah digunakan')
        }
      } catch (error) {
        console.error('[v0] Error checking short code:', error)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = link ? `/api/links/${link.id}` : '/api/links'
      const method = link ? 'PATCH' : 'POST'

      // Build body data, excluding empty short_code and empty category_id
      const bodyData: Record<string, any> = link
        ? { ...formData, id: link.id }
        : { ...formData, user_id: userId }

      // Remove short_code if empty (don't send "" to backend)
      if (!bodyData.short_code) {
        delete bodyData.short_code
      }
      // Remove category_id if empty (don't send "" to backend)
      if (!bodyData.category_id) {
        delete bodyData.category_id
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
      } else {
        const data = await response.json()
        console.error('[v0] Error saving link:', data.error)
        alert(data.error || 'Terjadi kesalahan saat menyimpan')
      }
    } catch (error) {
      console.error('[v0] Error saving link:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{link ? 'Edit Link' : 'Tambah Link Baru'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Link</Label>
            <Input
              id="title"
              placeholder="Contoh: Grup WhatsApp Peserta"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL Tujuan</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="short_code">Short Code (Opsional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateShortCode}
                disabled={generatingShortCode}
                className="h-7 text-xs"
              >
                {generatingShortCode ? '...' : '🔄 Auto-generate'}
              </Button>
            </div>
            <Input
              id="short_code"
              placeholder="Biarkan kosong untuk auto-generate"
              value={formData.short_code}
              onChange={(e) => handleShortCodeChange(e.target.value)}
            />
            {formData.short_code && (
              <p className="text-xs text-slate-500">
                Short link: <span className="font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/{formData.short_code}</span>
              </p>
            )}
            {shortCodeError && (
              <p className="text-xs text-red-500">{shortCodeError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Pilih Kategori</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base">Status</Label>
              <div className="text-sm text-slate-500">
                {formData.is_active ? 'Link akan ditampilkan' : 'Link disembunyikan'}
              </div>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_public" className="text-base">Visibilitas</Label>
              <div className="text-sm text-slate-500">
                {formData.is_public ? 'Link publik di halaman Anda' : 'Link privat, hanya Anda yang bisa lihat'}
              </div>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Menyimpan...' : 'Simpan Link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}