'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Save, Eye, EyeOff } from 'lucide-react'

type SettingsFormProps = {
  user: any
  settings: any
  userId: string
}

export function SettingsForm({ user, settings, userId }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    displayName: user?.display_name || '',
    customSlug: user?.custom_slug || '',
    profileDescription: settings?.profile_description || '',
    pageTitle: settings?.page_title || '',
    logoUrl: settings?.logo_url || '',
    themeColor: settings?.theme_color || '#2563eb',
    showCategories: settings?.show_categories ?? true
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.display_name || '',
        customSlug: user.custom_slug || ''
      }))
    }
    if (settings) {
      setFormData(prev => ({
        ...prev,
        profileDescription: settings.profile_description || '',
        pageTitle: settings.page_title || '',
        logoUrl: settings.logo_url || '',
        themeColor: settings.theme_color || '#2563eb',
        showCategories: settings.show_categories ?? true
      }))
    }
  }, [user, settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Update user profile
      if (formData.displayName || formData.customSlug) {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: formData.displayName,
            custom_slug: formData.customSlug || null
          })
        })
      }

      // Update settings
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_description: formData.profileDescription,
          page_title: formData.pageTitle,
          logo_url: formData.logoUrl,
          theme_color: formData.themeColor,
          show_categories: formData.showCategories
        })
      })

      if (response.ok) {
        setMessage('Pengaturan berhasil disimpan!')
        setTimeout(() => setMessage(''), 3000)
        router.refresh()
      } else {
        const data = await response.json()
        setMessage(data.error || 'Gagal menyimpan pengaturan')
      }
    } catch (error) {
      console.error('[v0] Error saving settings:', error)
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const publicUrl = formData.customSlug 
    ? `${window.location.origin}/u/${formData.customSlug}`
    : `${window.location.origin}/u/[belum diatur]`

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Profil Saya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nama Tampilan</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Nama Anda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customSlug">URL Kustom</Label>
              <Input
                id="customSlug"
                value={formData.customSlug}
                onChange={(e) => setFormData({ ...formData, customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="nama-anda"
              />
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Halaman publik Anda:</span>
                <a 
                  href={publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {publicUrl}
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Halaman Publik</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileDescription">Deskripsi Profil</Label>
              <Textarea
                id="profileDescription"
                value={formData.profileDescription}
                onChange={(e) => setFormData({ ...formData, profileDescription: e.target.value })}
                placeholder="Ceritakan sedikit tentang diri Anda..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageTitle">Judul Halaman</Label>
              <Input
                id="pageTitle"
                value={formData.pageTitle}
                onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                placeholder="Nama Link Saya"
              />
              <p className="text-xs text-slate-500">Judul yang akan ditampilkan di halaman publik Anda</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL Logo</Label>
              <Input
                id="logoUrl"
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-slate-500">URL gambar logo untuk halaman publik Anda</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="themeColor">Warna Tema</Label>
              <div className="flex gap-3">
                <Input
                  id="themeColor"
                  type="color"
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="showCategories" className="text-base">Tampilkan Kategori</Label>
                <div className="text-sm text-slate-500">
                  {formData.showCategories ? 'Kategori akan ditampilkan' : 'Kategori disembunyikan'}
                </div>
              </div>
              <Switch
                id="showCategories"
                checked={formData.showCategories}
                onCheckedChange={(checked) => setFormData({ ...formData, showCategories: checked })}
              />
            </div>

            {message && (
              <div className={`rounded-lg p-4 text-sm ${
                message.includes('berhasil') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}