'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { IconPicker } from '@/components/admin/icon-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  description?: string
  sort_order: number
  created_at: string
}

interface AdminCategoriesClientProps {
  initialCategories: Category[]
}

export function AdminCategoriesClient({ initialCategories }: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    icon: '📁',
    description: '',
    sort_order: 0,
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories')
        const data = await response.json()
        if (data.success) {
          setCategories(data.categories)
        }
      } catch (error) {
        console.error('[v0] Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingId(category.id)
      setFormData({
        name: category.name,
        icon: category.icon,
        description: category.description || '',
        sort_order: category.sort_order,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        icon: '📁',
        description: '',
        sort_order: 0,
      })
    }
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId ? { ...formData, id: editingId } : formData
        ),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh categories
        const getResponse = await fetch('/api/admin/categories')
        const getData = await getResponse.json()
        if (getData.success) {
          setCategories(getData.categories)
        }
        setOpen(false)
      } else {
        alert(data.error || 'Gagal menyimpan kategori')
      }
    } catch (error) {
      console.error('[v0] Error saving category:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (data.success) {
        setCategories(categories.filter(c => c.id !== id))
        setDeleteConfirm(null)
      } else {
        alert(data.error || 'Gagal menghapus kategori')
      }
    } catch (error) {
      console.error('[v0] Error deleting category:', error)
      alert('Terjadi kesalahan saat menghapus')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Kategori</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-300">
              Kelola kategori untuk mengorganisir link
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Kategori</span>
                <span className="inline sm:hidden">Tambah</span>
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? 'Ubah informasi kategori'
                    : 'Buat kategori baru untuk mengorganisir link'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Icon
                  </label>
                  <IconPicker
                    value={formData.icon}
                    onChange={(icon) =>
                      setFormData({ ...formData, icon })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Nama Kategori
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Contoh: Media Sosial"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Deskripsi (Opsional)
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Jelaskan kategori ini..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Urutan
                  </label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingId ? 'Perbarui' : 'Buat'} Kategori
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Confirm Delete Dialog */}
        {deleteConfirm && (
          <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus Kategori?</DialogTitle>
                <DialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada link
                  yang menggunakan kategori ini.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={submitting}
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Hapus
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Categories Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 backdrop-blur p-12 text-center">
            <p className="text-slate-400 mb-4">Belum ada kategori</p>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Buat Kategori Pertama
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-700/50">
                  <TableHead className="whitespace-nowrap py-2 sm:py-3 pr-2 sm:pr-4">Icon</TableHead>
                  <TableHead className="whitespace-nowrap py-2 sm:py-3 pr-2 sm:pr-4">Nama Kategori</TableHead>
                  <TableHead className="hidden md:table-cell whitespace-nowrap py-2 sm:py-3 pr-2 sm:pr-4">Deskripsi</TableHead>
                  <TableHead className="hidden sm:table-cell text-right whitespace-nowrap py-2 sm:py-3 pr-2 sm:pr-4">Urutan</TableHead>
                  <TableHead className="text-right whitespace-nowrap py-2 sm:py-3">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-slate-700/50">
                    <TableCell className="text-xl sm:text-2xl whitespace-nowrap py-2 sm:py-4 pr-2 sm:pr-4">{category.icon}</TableCell>
                    <TableCell className="font-medium text-white whitespace-nowrap text-xs sm:text-sm py-2 sm:py-4 pr-2 sm:pr-4">
                      {category.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-400 max-w-xs truncate text-[10px] sm:text-xs py-2 sm:py-4 pr-2 sm:pr-4">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-slate-400 whitespace-nowrap text-[10px] sm:text-xs py-2 sm:py-4 pr-2 sm:pr-4">
                      {category.sort_order}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap py-2 sm:py-4 pr-2 sm:pr-4">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(category)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(category.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/30 h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}