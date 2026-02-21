'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import type { Link, Category } from '@/lib/supabase'
import { LinkFormDialog } from './link-form-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'

type LinksTableProps = {
  links: Link[]
  categories: Category[]
}

export function LinksTable({ links, categories }: LinksTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [deletingLink, setDeletingLink] = useState<Link | null>(null)

  const filteredLinks = searchQuery
    ? links.filter((link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : links

  const handleDelete = async (linkId: string) => {
    try {
      const response = await fetch('/api/admin/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: linkId })
      })

      if (response.ok) {
        router.refresh()
        setDeletingLink(null)
      }
    } catch (error) {
      console.error('[v0] Error deleting link:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Daftar Semua Link</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Link Baru
          </Button>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-600">
                <th className="pb-2 sm:pb-3 pr-2 sm:pr-4 whitespace-nowrap">Judul Link</th>
                <th className="hidden sm:table-cell pb-2 sm:pb-3 pr-2 sm:pr-4 whitespace-nowrap">Pemilik</th>
                <th className="hidden md:table-cell pb-2 sm:pb-3 pr-2 sm:pr-4 whitespace-nowrap">Kategori</th>
                <th className="hidden sm:table-cell pb-2 sm:pb-3 pr-2 sm:pr-4 whitespace-nowrap">Klik</th>
                <th className="pb-2 sm:pb-3 pr-2 sm:pr-4 whitespace-nowrap">Status</th>
                <th className="hidden md:table-cell pb-2 sm:pb-3 pr-2 sm:pr-4 whitespace-nowrap">Publik</th>
                <th className="pb-2 sm:pb-3 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLinks.map((link: any) => (
                <tr key={link.id} className="text-sm">
                  <td className="py-2 sm:py-4 pr-2 sm:pr-4 min-w-[140px] sm:min-w-[180px]">
                    <div>
                      <div className="font-medium text-slate-900 text-xs sm:text-sm">{link.title}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[180px]" title={link.url}>
                        {link.url}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell py-2 sm:py-4 pr-2 sm:pr-4 min-w-[100px]">
                    <div className="text-slate-700 truncate text-[10px] sm:text-xs" title={link.user?.display_name || link.user?.email || 'Admin'}>
                      {link.user?.display_name || link.user?.email || 'Admin'}
                    </div>
                  </td>
                  <td className="hidden md:table-cell py-2 sm:py-4 pr-2 sm:pr-4 whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] sm:text-xs">{link.category?.name || 'N/A'}</Badge>
                  </td>
                  <td className="hidden sm:table-cell py-2 sm:py-4 pr-2 sm:pr-4 text-slate-700 whitespace-nowrap text-[10px] sm:text-xs">
                    {link.click_count || 0}
                  </td>
                  <td className="py-2 sm:py-4 pr-2 sm:pr-4 whitespace-nowrap">
                    <Badge variant={link.is_active ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                      {link.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="hidden md:table-cell py-2 sm:py-4 pr-2 sm:pr-4 whitespace-nowrap">
                    <Badge variant={link.is_public ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                      {link.is_public ? 'Ya' : 'Tidak'}
                    </Badge>
                  </td>
                  <td className="py-2 sm:py-4 whitespace-nowrap">
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingLink(link)}
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setDeletingLink(link)}
                        className="h-8 w-8 sm:h-9 sm:w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLinks.length === 0 && (
            <div className="py-12 text-center text-slate-500 min-w-[350px] text-xs sm:text-sm">
              {searchQuery ? 'Tidak ada hasil yang ditemukan' : 'Belum ada link'}
            </div>
          )}
        </div>
      </CardContent>

      <LinkFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
      />

      <LinkFormDialog
        open={!!editingLink}
        onOpenChange={(open) => !open && setEditingLink(null)}
        link={editingLink || undefined}
        categories={categories}
      />

      <DeleteConfirmDialog
        open={!!deletingLink}
        onOpenChange={(open) => !open && setDeletingLink(null)}
        onConfirm={() => deletingLink && handleDelete(deletingLink.id)}
        title={deletingLink?.title || ''}
      />
    </Card>
  )
}
