'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/lib/supabase'
import { CategoryFormDialog } from './category-form-dialog'
import { DeleteConfirmDialog } from '../admin/delete-confirm-dialog'

type CategoriesTableProps = {
  categories: Category[]
  userId: string
}

export function CategoriesTable({ categories, userId }: CategoriesTableProps) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
        setDeletingCategory(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal menghapus kategori')
      }
    } catch (error) {
      console.error('[v0] Error deleting category:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daftar Kategori</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="group flex items-center justify-between rounded-xl border border-slate-200/60 bg-white p-4 shadow-slack-sm transition-all duration-300 hover:shadow-slack-md hover:-translate-y-0.5 hover:border-brand-200/60"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 text-2xl transition-transform duration-300 group-hover:scale-110">
                  {category.icon}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{category.name}</div>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="border-slate-200 text-xs">
                      {category.links?.length || 0} link
                    </Badge>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-400">Urutan {category.sort_order}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setEditingCategory(category)}
                  className="h-9 w-9 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 transition-all"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setDeletingCategory(category)}
                  className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/30 p-12 text-center animate-scale-in">
              <div className="flex flex-col items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                  <Plus className="h-8 w-8 text-slate-400" />
                </div>
                <p className="font-medium text-slate-700">Belum ada kategori</p>
                <p className="mt-2 text-sm text-slate-500">
                  Klik "Tambah Kategori" untuk membuat kategori baru
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CategoryFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        userId={userId}
      />

      <CategoryFormDialog
        open={!!editingCategory}
        onOpenChange={(open: boolean) => !open && setEditingCategory(null)}
        category={editingCategory || undefined}
        userId={userId}
      />

      <DeleteConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open: boolean) => !open && setDeletingCategory(null)}
        onConfirm={() => deletingCategory && handleDelete(deletingCategory.id)}
        title={`Kategori: ${deletingCategory?.name || ''}`}
      />
    </Card>
  )
}