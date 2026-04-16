'use client'

import React from "react"

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
}

export function LinkFormDialog({ open, onOpenChange, link, categories }: LinkFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category_id: '',
    is_active: true
  })

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title,
        url: link.url,
        category_id: link.category_id,
        is_active: link.is_active
      })
    } else {
      setFormData({
        title: '',
        url: '',
        category_id: categories[0]?.id || '',
        is_active: true
      })
    }
  }, [link, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/links', {
        method: link ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link ? { ...formData, id: link.id } : formData)
      })

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      console.error('[v0] Error saving link:', error)
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

          <div className="flex items-center justify-between rounded-lg border border-slate-600/50 p-4">
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
