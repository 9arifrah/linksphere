'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Pencil, Trash2, ExternalLink, QrCode } from 'lucide-react'
import type { Link, Category } from '@/lib/supabase'
import { LinkFormDialog } from './link-form-dialog'
import { DeleteConfirmDialog } from '../admin/delete-confirm-dialog'
import { QRCodeModal } from '@/components/shared/qr-code-modal'
import { Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type LinksTableProps = {
  links: Link[]
  categories: Category[]
  userId: string
}

export function LinksTable({ links: initialLinks, categories, userId }: LinksTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [links, setLinks] = useState(initialLinks)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [deletingLink, setDeletingLink] = useState<Link | null>(null)
  const [qrLink, setQrLink] = useState<Link | null>(null)
  const [previousAddDialogState, setPreviousAddDialogState] = useState(false)
  const [previousEditDialogState, setPreviousEditDialogState] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks])

  // Refresh links from server
  const refreshLinks = async () => {
    try {
      const response = await fetch('/api/links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data.links || [])
      }
    } catch (error) {
      console.error('[v0] Error refreshing links:', error)
    }
  }

  // Refresh links when add dialog closes
  useEffect(() => {
    if (previousAddDialogState && !isAddDialogOpen) {
      // Dialog was open and now closed - refresh data
      refreshLinks()
    }
    setPreviousAddDialogState(isAddDialogOpen)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddDialogOpen])

  // Refresh links when edit dialog closes
  useEffect(() => {
    if (previousEditDialogState && !editingLink) {
      // Dialog was open and now closed - refresh data
      refreshLinks()
    }
    setPreviousEditDialogState(!!editingLink)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingLink])

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
        // Remove from local state immediately (optimistic update)
        setLinks(links.filter(link => link.id !== linkId))
        router.refresh()
        setDeletingLink(null)
      }
    } catch (error) {
      console.error('[v0] Error deleting link:', error)
    }
  }

  const handleOpenLink = async (link: Link) => {
    // Track click
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id })
      })
    } catch (error) {
      console.error('[v0] Error tracking click:', error)
    }

    // Open link in new tab
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Berhasil',
        description: 'Short link berhasil disalin!',
      })
    } catch (error) {
      console.error('[v0] Error copying to clipboard:', error)
      toast({
        title: 'Gagal',
        description: 'Gagal menyalin short link',
        variant: 'destructive',
      })
    }
  }

  const getShortLink = (shortCode: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${shortCode}`
    }
    return `/${shortCode}`
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
        <div className="flex w-full flex-col gap-3 sm:hidden">
          {filteredLinks.map((link) => (
            <Card key={link.id} className="w-full">
              <CardContent className="flex flex-col gap-2 p-4">
                {/* Title and Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => handleOpenLink(link)}
                      className="font-semibold text-slate-900 text-sm text-left w-full"
                    >
                      {link.title}
                    </button>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {link.category?.name || 'N/A'}
                  </Badge>
                </div>

                {/* URL with line-clamp-2 max 2 lines */}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault()
                    handleOpenLink(link)
                  }}
                  className="line-clamp-2 break-all text-sm text-blue-600 hover:underline"
                  title={link.url}
                >
                  {link.url}
                </a>

                {/* Short Link Display */}
                {link.short_code && (
                  <div className="flex items-center gap-2 text-xs bg-slate-50 rounded px-2 py-1">
                    <span className="font-mono text-slate-600 truncate">
                      {getShortLink(link.short_code)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => copyToClipboard(getShortLink(link.short_code || ""))}
                      title="Salin short link"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Stats and Badges with flex-wrap */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 border-r border-slate-300 pr-2">
                    <span className="font-medium text-slate-700">{link.click_count || 0}</span> klik
                  </span>
                  <Badge
                    variant={link.is_active ? 'default' : 'secondary'}
                    className={link.is_active ? 'text-xs' : 'text-xs'}
                  >
                    {link.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  <Badge
                    variant={link.is_public ? 'default' : 'secondary'}
                    className={link.is_public ? 'text-xs bg-green-600 hover:bg-green-700' : 'text-xs'}
                  >
                    {link.is_public ? 'Publik' : 'Privat'}
                  </Badge>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenLink(link)}
                    className="h-8 text-xs"
                    title="Buka link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingLink(link)}
                    className="h-8 text-xs"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletingLink(link)}
                    className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    title="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {link.qr_code && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQrLink(link)}
                      className="h-8 text-xs"
                      title="QR Code"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden sm:block overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-600">
                <th className="pb-3 pr-4 whitespace-nowrap">Judul Link</th>
                <th className="hidden md:table-cell pb-3 pr-4 whitespace-nowrap">Short Link</th>
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
                      <button
                        onClick={() => handleOpenLink(link)}
                        className="font-medium text-slate-900 text-sm group-hover:text-brand-600 hover:text-blue-600 transition-colors text-left"
                      >
                        {link.title}
                      </button>
                      <div className="text-xs text-slate-500 truncate max-w-[180px]" title={link.url}>
                        {link.url}
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell py-4 pr-4 whitespace-nowrap">
                    {link.short_code ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-slate-600">
                          {getShortLink(link.short_code)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(getShortLink(link.short_code || ""))}
                          title="Salin short link"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
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
                        onClick={() => handleOpenLink(link)}
                        className="h-9 w-9 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 transition-all"
                        title="Buka link di tab baru"
                      >
                        <ExternalLink className="h-4 w-4" />
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
                      {link.qr_code && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setQrLink(link)}
                          className="h-9 w-9"
                          title="Lihat QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      )}
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

      <QRCodeModal
        open={!!qrLink}
        onOpenChange={(open) => !open && setQrLink(null)}
        link={qrLink ? { title: qrLink.title, url: qrLink.url, qr_code: qrLink.qr_code || null, short_code: qrLink.short_code || null } : { title: '', url: '', qr_code: null }}
      />
    </Card>
  )
}