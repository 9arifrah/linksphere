'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { downloadDataUri } from '@/lib/qr-code'

type QRCodeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: {
    title: string
    url: string
    qr_code: string | null
    short_code?: string | null
  }
}

export function QRCodeModal({ open, onOpenChange, link }: QRCodeModalProps) {
  const handleDownload = () => {
    if (!link.qr_code) return

    try {
      // Sanitize filename from title
      const sanitizedTitle = link.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      downloadDataUri(link.qr_code, `qr-${sanitizedTitle}.png`)
    } catch (error) {
      console.error('[QR Code Modal] Download failed:', error)
    }
  }

  if (!link.qr_code) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - {link.title}</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-slate-500">
            QR code tidak tersedia untuk link ini.
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {link.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <img
              src={link.qr_code}
              alt={`QR Code untuk ${link.title}`}
              className="h-48 w-48"
            />
          </div>
          {link.short_code ? (
            <p className="text-sm text-brand-600 font-mono max-w-full text-center">
              {typeof window !== 'undefined' ? window.location.origin : ''}/{link.short_code}
            </p>
          ) : (
            <p className="text-sm text-slate-500 max-w-full break-all text-center">
              {link.url}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
