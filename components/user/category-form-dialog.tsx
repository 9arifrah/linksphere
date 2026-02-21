'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Category } from '@/lib/supabase'

type CategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  userId: string
}

export function CategoryFormDialog({ open, onOpenChange, category, userId }: CategoryFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    sort_order: 0
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        sort_order: category.sort_order
      })
    } else {
      setFormData({
        name: '',
        icon: '📁',
        sort_order: 0
      })
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = category ? `/api/categories/${category.id}` : '/api/categories'
      const method = category ? 'PATCH' : 'POST'
      
      const bodyData = category 
        ? { ...formData, id: category.id }
        : { ...formData, user_id: userId }

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
        alert(data.error || 'Gagal menyimpan kategori')
      }
    } catch (error) {
      console.error('[v0] Error saving category:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const icons = ['📁', '🔗', '📱', '💻', '🎯', '📚', '🎵', '🎬', '🎮', '📊', '💼', '🛒', '💡', '🏠', '✈️']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Kategori' : 'Tambah Kategori Baru'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kategori</Label>
            <Input
              id="name"
              placeholder="Contoh: Sosial Media"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`h-12 w-12 rounded-lg border-2 text-2xl transition-all hover:border-blue-300 ${
                    formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Custom emoji..."
                value={formData.icon.length > 2 ? '' : formData.icon}
                onChange={(e) => {
                  const value = e.target.value
                  // Take last character if multiple
                  const emoji = value.slice(-1)
                  setFormData({ ...formData, icon: emoji })
                }}
                className="w-24"
                maxLength={2}
              />
              <p className="text-sm text-slate-500 flex items-center">
                Pilih icon di atas atau ketik emoji
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Urutan</Label>
            <Input
              id="sort_order"
              type="number"
              min="0"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-slate-500">Angka lebih kecil = muncul di atas</p>
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
              {loading ? 'Menyimpan...' : 'Simpan Kategori'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}