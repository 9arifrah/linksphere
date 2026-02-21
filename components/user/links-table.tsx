'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Link, Category } from '@/lib/supabase'
import { LinkFormDialog } from './link-form-dialog'
import { DeleteConfirmDialog } from '../admin/delete-confirm-dialog'

type LinksTableProps = {
  links: Link[]
  categories: Category[]
  userId: string
}

export function LinksTable({ links, categories, userId }: LinksTableProps) {
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
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
        setDeletingLink(null)
      }
    } catch (error) {
      console.error('[v0] Error deleting link:', error)
    }
  }

  const handleTogglePublic = async (linkId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !currentStatus })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('[v0] Error toggling public status:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Link Saya</CardTitle>
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
        {/* Mobile View (Cards) */}
        <div className="space-y-4 sm:hidden">
          {filteredLinks.map((link) => (
            <div key={link.id} className="rounded-lg border border-slate-200 p-4 bg-white hover:bg-slate-50 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900 truncate">{link.title}</div>
                  <div className="text-xs text-slate-500 break-all mt-0.5">{link.url}</div>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px] h-5">
                  {link.category?.name || 'N/A'}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-700">{link.click_count || 0}</span> klik
                  </div>
                  <div className="w-px h-3 bg-slate-200" />
                  <Badge variant={link.is_active ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5">
                    {link.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  <Badge
                    variant={link.is_public ? 'default' : 'secondary'}
                    className={link.is_public ? 'bg-green-600 h-5 px-1.5 text-[10px]' : 'h-5 px-1.5 text-[10px]'}
                  >
                    {link.is_public ? 'Publik' : 'Privat'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTogglePublic(link.id, link.is_public || false)}
                  className="flex-1 h-8 text-xs"
                >
                  {link.is_public ? <EyeOff className="mr-2 h-3.5 w-3.5" /> : <Eye className="mr-2 h-3.5 w-3.5" />}
                  {link.is_public ? 'Sembunyikan' : 'Tampilkan'}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setEditingLink(link)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setDeletingLink(link)}
                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden sm:block overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-600">
                <th className="pb-3 pr-4 whitespace-nowrap">Judul Link</th>
                <th className="hidden lg:table-cell pb-3 pr-4 whitespace-nowrap">Kategori</th>
                <th className="pb-3 pr-4 whitespace-nowrap">Klik</th>
                <th className="hidden lg:table-cell pb-3 pr-4 whitespace-nowrap">Status</th>
                <th className="pb-3 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLinks.map((link, index) => (
                <tr
                  key={link.id}
                  className="text-sm group transition-all duration-200 hover:bg-slate-50/50 hover:shadow-sm"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <td className="py-4 pr-4 min-w-[150px]">
                    <div>
                      <div className="font-medium text-slate-900 text-sm group-hover:text-brand-600 transition-colors">{link.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px]" title={link.url}>
                        {link.url}
                      </div>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell py-4 pr-4 whitespace-nowrap">
                    <Badge variant="outline" className="text-xs border-slate-200">{link.category?.name || 'N/A'}</Badge>
                  </td>
                  <td className="py-4 pr-4 text-slate-700 whitespace-nowrap text-xs font-medium">
                    {link.click_count || 0}
                  </td>
                  <td className="hidden lg:table-cell py-4 pr-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Badge
                        variant={link.is_active ? 'default' : 'secondary'}
                        className={`text-xs ${link.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {link.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                      <Badge
                        variant={link.is_public ? 'default' : 'secondary'}
                        className={`text-xs ${link.is_public ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {link.is_public ? 'Publik' : 'Privat'}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleTogglePublic(link.id, link.is_public || false)}
                        className="h-9 w-9 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 transition-all"
                        title={link.is_public ? 'Set Privat' : 'Set Publik'}
                      >
                        {link.is_public ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingLink(link)}
                        className="h-9 w-9"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setDeletingLink(link)}
                        className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLinks.length === 0 && (
            <div className="py-12 text-center text-slate-500 min-w-[300px] text-sm">
              {searchQuery ? 'Tidak ada hasil yang ditemukan' : 'Belum ada link'}
            </div>
          )}
        </div>
      </CardContent>

      <LinkFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
        userId={userId}
      />

      <LinkFormDialog
        open={!!editingLink}
        onOpenChange={(open) => !open && setEditingLink(null)}
        link={editingLink || undefined}
        categories={categories}
        userId={userId}
      />

      <DeleteConfirmDialog
        open={!!deletingLink}
        onOpenChange={(open: boolean) => !open && setDeletingLink(null)}
        onConfirm={() => deletingLink && handleDelete(deletingLink.id)}
        title={deletingLink?.title || ''}
      />
    </Card>
  )
}