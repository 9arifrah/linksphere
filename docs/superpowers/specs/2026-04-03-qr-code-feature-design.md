# QR Code Feature Design Document

**Project:** LinkSphere
**Feature:** QR Code for Links
**Date:** 2026-04-03
**Status:** Approved

---

## Overview

Add QR code functionality to every link in LinkSphere, allowing users to display and download QR codes for their links. QR codes are automatically generated when a link is created or modified.

---

## Requirements

### Functional Requirements

1. **QR Code Generation**
   - Automatically generate QR code when link is saved
   - QR code contains the direct URL of the link
   - Store QR code as base64 data in database

2. **Display QR Codes**
   - Dashboard: QR button in links table (desktop & mobile)
   - Public Profile: QR button on link cards (hover-triggered)
   - Modal display with QR code image

3. **Download QR Codes**
   - Users can download QR code as PNG image
   - Filename format: `qr-{link-title}.png`

4. **Update Behavior**
   - Regenerate QR code when link URL changes
   - Preserve existing QR code if URL unchanged

### Non-Functional Requirements

1. **Performance**
   - Link creation with QR generation must complete within 500ms
   - QR modal must open instantly (no loading state)

2. **Storage**
   - QR code stored as base64 in database
   - Estimated size: 2-5KB per link
   - Scalable to 10,000+ links

3. **Compatibility**
   - Works on desktop, tablet, and mobile
   - QR codes scannable by all major smartphone cameras

---

## Architecture

### Database Schema

```sql
ALTER TABLE links ADD COLUMN qr_code TEXT;
```

### Component Structure

```
components/
├── shared/
│   └── qr-code-modal.tsx        (NEW: Reusable modal)
├── user/
│   └── links-table.tsx          (MODIFY: Add QR button)
└── link-card.tsx                (MODIFY: Add QR button)
```

### Data Flow

```
User saves link
    ↓
API receives request
    ↓
Generate QR code (base64)
    ↓
Save link + QR code to database
    ↓
Return success to client
```

```
User clicks QR button
    ↓
Fetch link data (with QR code)
    ↓
Display modal with QR code
    ↓
User can download or close
```

---

## UI/UX Design

### Dashboard - Desktop View

```
┌──────────────────────────────────────────────────────────────────────┐
│ Judul Link           │ Kategori │ Klik │ Status    │ Aksi           │
├──────────────────────────────────────────────────────────────────────┤
│ Portofolio Saya      │ Design   │ 125  │ Aktif Pub │ 🔗 📝 🗑️ 📱    │
│ https://dipsi.dev    │          │      │           │                │
└──────────────────────────────────────────────────────────────────────┘
                                   ↑
                            QR Code Button (new)
```

### Dashboard - Mobile View (Card)

```
┌─────────────────────────────────────┐
│ Portofolio Saya              [Design]│
│ https://dipsi.dev                   │
├─────────────────────────────────────┤
│ 125 klik │ Aktif │ Publik           │
├─────────────────────────────────────┤
│ [🔗 Buka] [✏️ Edit] [🗑️ Hapus]     │
│ [📱 QR]                             │
└─────────────────────────────────────┘
```

### Public Profile - Link Card

```
┌─────────────────────────────────────┐
│ Portofolio Saya            🔗 📱   │ ← QR button (hover)
│ https://dipsi.dev                  │
└─────────────────────────────────────┘
```

### QR Code Modal

```
┌─────────────────────────────────────┐
│        QR CODE - Link Name         │
├─────────────────────────────────────┤
│                                     │
│         ┌─────────────┐            │
│         │   [IMAGE]   │            │
│         │             │            │
│         │   200x200   │            │
│         │             │            │
│         └─────────────┘            │
│                                     │
│     https://dipsi.dev              │
│                                     │
├─────────────────────────────────────┤
│      [  Download QR Code  ]  [ ✕ ] │
└─────────────────────────────────────┘
```

**Modal Specifications:**
- Size: sm:max-w-md
- Center modal with backdrop
- QR code: 200x200px
- URL: Truncated with max-w-full
- Buttons: Download (primary), Close (secondary)

---

## Implementation Details

### Dependencies

```bash
npm install react-qr-code
```

**Library Choice:** `react-qr-code`
- Modern, TypeScript-friendly
- Smaller bundle size than alternatives
- SVG-based (scales well)

### Database Migration

**File:** `supabase/migrations/20260403_add_qr_code_column.sql`

```sql
-- Add qr_code column to links table
ALTER TABLE links
ADD COLUMN qr_code TEXT;

-- Index for future queries
CREATE INDEX idx_links_qr_code
ON links(qr_code)
WHERE qr_code IS NOT NULL;
```

### API Changes

**POST /api/links** (Create Link)

```typescript
import { QRCodeSVG } from 'react-qr-code'
import ReactDOMServer from 'react-dom/server'

const generateQRCode = async (url: string): Promise<string> => {
  const qrCodeSvg = new QRCodeSVG({
    value: url,
    size: 200,
    bgColor: '#ffffff',
    fgColor: '#000000',
    level: 'M',
  })

  const svgString = ReactDOMServer.renderToStaticMarkup(qrCodeSvg)
  const base64 = Buffer.from(svgString).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

// In POST handler
const qrCode = await generateQRCode(url)
await db.createLink({ ...linkData, qr_code: qrCode })
```

**PATCH /api/links/[id]** (Update Link)

```typescript
if (url !== existingLink.url) {
  updateData.qr_code = await generateQRCode(url)
}
```

### Components

**File:** `components/shared/qr-code-modal.tsx` (NEW)

```typescript
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import Image from 'next/image'

type QRCodeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: {
    title: string
    url: string
    qr_code: string
  }
}

export function QRCodeModal({ open, onOpenChange, link }: QRCodeModalProps) {
  const handleDownload = () => {
    const linkElement = document.createElement('a')
    linkElement.href = link.qr_code
    linkElement.download = `qr-${link.title}.png`
    linkElement.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {link.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <img src={link.qr_code} alt="QR Code" className="w-48 h-48" />
          <p className="text-sm text-slate-500 truncate max-w-full">{link.url}</p>
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
```

**File:** `components/user/links-table.tsx` (MODIFY)

Add state and QR button in desktop table actions and mobile card view.

**File:** `components/link-card.tsx` (MODIFY)

Add QR button that shows on hover, next to external link icon.

---

## Error Handling

### QR Generation Failures

```typescript
try {
  const qrCode = await generateQRCode(url)
} catch (error) {
  console.error('[v0] QR generation failed:', error)
  // Continue without QR code
  const qrCode = null
}
```

### Missing QR Code (Legacy Links)

For links created before this feature:
- Modal shows fallback message
- Or generate QR code on-the-fly (lazy loading)

---

## Testing Strategy

### Manual Testing Checklist

| Scenario | Expected Result |
|----------|----------------|
| Dashboard - QR button visible | Button appears in actions |
| Dashboard - Click QR button | Modal opens with QR code |
| Dashboard - Download QR | File downloads as PNG |
| Dashboard - Close modal | Modal closes |
| Mobile - QR button visible | Button in card actions |
| Public Profile - QR hidden | Only shows on hover |
| Public Profile - Hover | QR button fades in |
| Public Profile - Click QR | Modal opens |
| Long URL | QR code generates |
| Special chars in URL | QR code scannable |
| Old link without QR | Fallback or generate |

### Browser Testing

- Chrome/Edge, Firefox, Safari
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 390x844)

### QR Scan Testing

Scan generated QR codes with:
- iPhone Camera
- Android Camera
- Third-party QR scanner apps

---

## Success Criteria

1. ✅ QR code generates automatically on link save
2. ✅ QR button accessible in dashboard and public profile
3. ✅ Modal displays QR code correctly
4. ✅ Download functionality works
5. ✅ QR codes are scannable by smartphone cameras
6. ✅ No performance degradation on link creation (<500ms)

---

## Future Enhancements (Out of Scope)

- QR code customization (colors, logo)
- QR code scan tracking/analytics
- Bulk QR code download
- QR code templates/styles
- QR code expiry and regeneration

---

## References

- Library: https://github.com/zpao/qrcode.react (alternative)
- Library: https://github.com/rosskamasaka/react-qr-code (selected)
