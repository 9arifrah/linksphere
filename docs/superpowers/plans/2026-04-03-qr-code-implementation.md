# QR Code Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add QR code generation, display, and download functionality to links in LinkSphere

**Architecture:** Auto-generate QR codes as base64 when links are saved, store in database, display in modal, and enable PNG download

**Tech Stack:** Next.js 15, React 18, react-qr-code, SQLite/Supabase, TypeScript

---

## File Structure

### Files to Create:
1. `lib/qr-code.ts` - QR code generation utility
2. `components/shared/qr-code-modal.tsx` - Reusable QR code modal component
3. `lib/db-sqlite.ts` (modify) - Add qr_code column handling
4. `lib/db-supabase.ts` (modify) - Add qr_code column handling
5. `lib/supabase.ts` (modify) - Add qr_code to Link type

### Files to Modify:
1. `app/api/links/route.ts` - Add QR generation on create
2. `app/api/links/[id]/route.ts` - Add QR regeneration on URL update
3. `components/user/links-table.tsx` - Add QR button (desktop & mobile)
4. `components/link-card.tsx` - Add QR button (public profile, hover-triggered)
5. `package.json` - Add react-qr-code dependency

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install react-qr-code package**

Run:
```bash
npm install react-qr-code
```

Expected output:
```
added 1 package, and audited XXX packages in Xs
```

- [ ] **Step 2: Verify installation**

Run:
```bash
grep "react-qr-code" package.json
```

Expected output:
```json
"react-qr-code": "^X.X.X"
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add react-qr-code package"
```

---

## Task 2: Update Link Type Definition

**Files:**
- Modify: `lib/supabase.ts`

- [ ] **Step 1: Add qr_code field to Link type**

Edit `lib/supabase.ts` at line 40 (Link type definition):

Find this section:
```typescript
export type Link = {
  id: string
  title: string
  url: string
  category_id: string
  is_active: boolean
  is_public: boolean
  click_count: number
  created_at: string
  updated_at: string
  user_id?: string | null
  category?: Category
}
```

Replace with:
```typescript
export type Link = {
  id: string
  title: string
  url: string
  category_id: string
  is_active: boolean
  is_public: boolean
  click_count: number
  created_at: string
  updated_at: string
  user_id?: string | null
  category?: Category
  qr_code?: string | null
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors related to Link type

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: add qr_code field to Link type"
```

---

## Task 3: Create QR Code Generation Utility

**Files:**
- Create: `lib/qr-code.ts`

- [ ] **Step 1: Create QR code utility file**

Create `lib/qr-code.ts`:

```typescript
import { QRCodeSVG } from 'react-qr-code'
import ReactDOMServer from 'react-dom/server'

/**
 * Generate QR code as base64 data URI
 * @param url - The URL to encode in QR code
 * @returns Base64 data URI for QR code image
 */
export async function generateQRCode(url: string): Promise<string> {
  // Create QR code SVG component
  const qrCodeSvg = new QRCodeSVG({
    value: url,
    size: 200,
    bgColor: '#ffffff',
    fgColor: '#000000',
    level: 'M', // Medium error correction (15%)
  })

  // Render to SVG string
  const svgString = ReactDOMServer.renderToStaticMarkup(qrCodeSvg)

  // Convert to base64 data URI
  const base64 = Buffer.from(svgString).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * Convert base64 data URI to downloadable blob
 * @param dataUri - Base64 data URI
 * @param filename - Desired filename for download
 */
export function downloadDataUri(dataUri: string, filename: string): void {
  // Extract the base64 data
  const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) {
    throw new Error('Invalid data URI format')
  }

  const mimeType = matches[1]
  const base64Data = matches[2]

  // Convert to binary
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)

  // Create blob and download
  const blob = new Blob([byteArray], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit lib/qr-code.ts
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/qr-code.ts
git commit -m "feat: add QR code generation utility"
```

---

## Task 4: Update SQLite Schema and Database Client

**Files:**
- Modify: `lib/db-sqlite.ts`

- [ ] **Step 1: Add qr_code column to links table schema**

Edit `lib/db-sqlite.ts` at line 62 (links table schema):

Find this section:
```typescript
  // Links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category_id TEXT,
      is_public INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      click_count INTEGER DEFAULT 0,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `)
```

Replace with:
```typescript
  // Links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category_id TEXT,
      is_public INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      click_count INTEGER DEFAULT 0,
      user_id TEXT NOT NULL,
      qr_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `)
```

Note: This is for new database installations. For existing databases, we'll add migration in Task 5.

- [ ] **Step 2: Update createLink to include qr_code**

Edit `lib/db-sqlite.ts` at line 288 (createLink function):

Find this section:
```typescript
  async createLink(link: any) {
    const stmt = db.prepare(`
      INSERT INTO links (id, title, url, description, category_id, is_public, is_active, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      link.id,
      link.title,
      link.url,
      link.description || null,
      link.category_id || null,
      link.is_public ? 1 : 0,
      link.is_active !== undefined ? (link.is_active ? 1 : 0) : 1,
      link.user_id
    )
    return this.getLinkById(link.id)
  },
```

Replace with:
```typescript
  async createLink(link: any) {
    const stmt = db.prepare(`
      INSERT INTO links (id, title, url, description, category_id, is_public, is_active, user_id, qr_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      link.id,
      link.title,
      link.url,
      link.description || null,
      link.category_id || null,
      link.is_public ? 1 : 0,
      link.is_active !== undefined ? (link.is_active ? 1 : 0) : 1,
      link.user_id,
      link.qr_code || null
    )
    return this.getLinkById(link.id)
  },
```

- [ ] **Step 3: Update updateLink to handle qr_code**

Edit `lib/db-sqlite.ts` at line 306 (updateLink function):

Find this section after the is_public check:
```typescript
    if (data.is_public !== undefined) {
      fields.push('is_public = ?')
      values.push(data.is_public ? 1 : 0)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
```

Add qr_code handling before the updated_at line:
```typescript
    if (data.is_public !== undefined) {
      fields.push('is_public = ?')
      values.push(data.is_public ? 1 : 0)
    }
    if (data.qr_code !== undefined) {
      fields.push('qr_code = ?')
      values.push(data.qr_code)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
```

- [ ] **Step 4: Commit**

```bash
git add lib/db-sqlite.ts
git commit -m "feat: add qr_code support to SQLite database client"
```

---

## Task 5: Create Database Migration for Existing Installations

**Files:**
- Create: `scripts/migrations/add-qr-code-column.sql`

- [ ] **Step 1: Create migration script**

Create `scripts/migrations/add-qr-code-column.sql`:

```sql
-- Migration: Add qr_code column to links table
-- Date: 2026-04-03

-- Add qr_code column (SQLite doesn't support IF NOT EXISTS for columns in ALTER TABLE)
-- This will fail if column already exists, which is fine
ALTER TABLE links ADD COLUMN qr_code TEXT;

-- Create index for qr_code queries (optional, for future use)
CREATE INDEX IF NOT EXISTS idx_links_qr_code ON links(qr_code) WHERE qr_code IS NOT NULL;
```

- [ ] **Step 2: Run migration on local database**

Run:
```bash
sqlite3 data/linksphere.db < scripts/migrations/add-qr-code-column.sql
```

Expected: No error (if column doesn't exist) or "Error: duplicate column name: qr_code" (if already exists - this is OK)

- [ ] **Step 3: Verify migration**

Run:
```bash
sqlite3 data/linksphere.db "PRAGMA table_info(links);"
```

Expected output includes: `qr_code|TEXT|0||0`

- [ ] **Step 4: Create migration README**

Create `scripts/migrations/README.md`:

```markdown
# Database Migrations

This directory contains SQL migration scripts for LinkSphere database.

## Running Migrations

### SQLite
```bash
sqlite3 data/linksphere.db < scripts/migrations/[migration-file].sql
```

### Supabase
Run the SQL commands in the Supabase SQL Editor or via CLI.

## Migrations

- `add-qr-code-column.sql` (2026-04-03): Adds qr_code column to links table for storing QR code data URIs
```

- [ ] **Step 5: Commit**

```bash
git add scripts/migrations/
git commit -m "feat: add database migration for qr_code column"
```

---

## Task 6: Update Supabase Database Client (if using Supabase)

**Files:**
- Modify: `lib/db-supabase.ts`

- [ ] **Step 1: Check if db-supabase.ts exists**

Run:
```bash
ls -la lib/db-supabase.ts
```

If file doesn't exist, skip this task and proceed to Task 7.

- [ ] **Step 2: Read db-supabase.ts to understand structure**

Run:
```bash
head -100 lib/db-supabase.ts
```

- [ ] **Step 3: Update createLink to include qr_code**

Find the createLink function and add qr_code parameter similar to Task 4, Step 2.

The exact location will depend on the current implementation. Look for the INSERT statement and add qr_code to the column list and values.

- [ ] **Step 4: Update updateLink to handle qr_code**

Similar to Task 4, Step 3, add qr_code handling in the updateLink function.

- [ ] **Step 5: Create Supabase migration**

Create `supabase/migrations/20260403000000_add_qr_code_column.sql`:

```sql
-- Add qr_code column to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Create index for future queries
CREATE INDEX IF NOT EXISTS idx_links_qr_code ON links(qr_code) WHERE qr_code IS NOT NULL;
```

- [ ] **Step 6: Commit**

```bash
git add lib/db-supabase.ts supabase/migrations/
git commit -m "feat: add qr_code support to Supabase database client"
```

---

## Task 7: Update POST /api/links Route

**Files:**
- Modify: `app/api/links/route.ts`

- [ ] **Step 1: Add imports for QR code generation**

Edit `app/api/links/route.ts` at line 1:

Find:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { linkSchema } from '@/lib/validation'
import { db } from '@/lib/db'
```

Add after line 4:
```typescript
import { generateQRCode } from '@/lib/qr-code'
```

- [ ] **Step 2: Generate QR code before creating link**

Edit `app/api/links/route.ts` at line 31 (POST handler):

Find this section before the db.createLink call:
```typescript
    const newLink = await db.createLink({
      id: crypto.randomUUID(),
      title: body.title,
      url: body.url,
      description: body.description,
      category_id,
      is_public: is_public ?? true,
      user_id: userId
    })
```

Replace with:
```typescript
    // Generate QR code for the link
    let qrCode: string | null = null
    try {
      qrCode = await generateQRCode(body.url)
    } catch (error) {
      console.error('[v0] QR code generation failed:', error)
      // Continue without QR code if generation fails
    }

    const newLink = await db.createLink({
      id: crypto.randomUUID(),
      title: body.title,
      url: body.url,
      description: body.description,
      category_id,
      is_public: is_public ?? true,
      user_id: userId,
      qr_code: qrCode
    })
```

- [ ] **Step 3: Test the API endpoint**

Run:
```bash
npm run dev
```

In another terminal, test:
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"title":"Test QR","url":"https://example.com","user_id":"test-user-id"}' \
  --cookie "user_session=valid-session-token"
```

Expected response includes `qr_code` field with base64 data URI.

- [ ] **Step 4: Commit**

```bash
git add app/api/links/route.ts
git commit -m "feat: generate QR code on link creation"
```

---

## Task 8: Update PATCH /api/links/[id] Route

**Files:**
- Modify: `app/api/links/[id]/route.ts`

- [ ] **Step 1: Read the current implementation**

Run:
```bash
cat app/api/links/[id]/route.ts
```

- [ ] **Step 2: Add QR code import**

Add at the top with other imports:
```typescript
import { generateQRCode } from '@/lib/qr-code'
```

- [ ] **Step 3: Add QR code regeneration when URL changes**

Find the section where the link is being updated. Look for where `url` is being handled and add QR regeneration.

The exact implementation will depend on the current code structure. Look for:
- Where existing link data is fetched
- Where update data is being prepared
- Add logic to regenerate QR code if URL changes

Example implementation (adjust based on actual code):
```typescript
// After fetching existing link
const existingLink = await db.getLinkById(id)

// Check if URL is changing
if (body.url && body.url !== existingLink.url) {
  try {
    updateData.qr_code = await generateQRCode(body.url)
  } catch (error) {
    console.error('[v0] QR code regeneration failed:', error)
    updateData.qr_code = null
  }
}
```

- [ ] **Step 4: Test the API endpoint**

Run:
```bash
curl -X PATCH http://localhost:3000/api/links/[link-id] \
  -H "Content-Type: application/json" \
  -d '{"url":"https://newurl.com"}' \
  --cookie "user_session=valid-session-token"
```

Expected: QR code is updated when URL changes.

- [ ] **Step 5: Commit**

```bash
git add app/api/links/[id]/route.ts
git commit -m "feat: regenerate QR code when link URL changes"
```

---

## Task 9: Create QR Code Modal Component

**Files:**
- Create: `components/shared/qr-code-modal.tsx`

- [ ] **Step 1: Create shared directory if not exists**

Run:
```bash
mkdir -p components/shared
```

- [ ] **Step 2: Create QR code modal component**

Create `components/shared/qr-code-modal.tsx`:

```typescript
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
  }
}

export function QRCodeModal({ open, onOpenChange, link }: QRCodeModalProps) {
  const handleDownload = () => {
    if (!link.qr_code) return

    // Sanitize filename
    const sanitizedName = link.title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 50)

    downloadDataUri(link.qr_code, `qr-${sanitizedName}.png`)
  }

  // Fallback for legacy links without QR code
  if (!link.qr_code) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code - {link.title}</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-slate-500">
            <p>QR code tidak tersedia untuk link ini.</p>
            <p className="text-sm mt-2">Silakan edit dan simpan link untuk generate QR code.</p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
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
          {/* QR Code Image */}
          <div className="p-4 bg-white rounded-lg border border-slate-200">
            <img
              src={link.qr_code}
              alt={`QR Code for ${link.title}`}
              className="w-48 h-48"
            />
          </div>

          {/* URL Display */}
          <p className="text-sm text-slate-500 truncate max-w-full text-center" title={link.url}>
            {link.url}
          </p>
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

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit components/shared/qr-code-modal.tsx
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/shared/qr-code-modal.tsx
git commit -m "feat: add QR code modal component"
```

---

## Task 10: Update Links Table Component (Dashboard)

**Files:**
- Modify: `components/user/links-table.tsx`

- [ ] **Step 1: Add QR code import and state**

Edit `components/user/links-table.tsx` at line 1:

Find:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Pencil, Trash2, ExternalLink } from 'lucide-react'
import type { Link, Category } from '@/lib/supabase'
import { LinkFormDialog } from './link-form-dialog'
import { DeleteConfirmDialog } from '../admin/delete-confirm-dialog'
```

Replace with:
```typescript
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
```

- [ ] **Step 2: Add QR modal state**

After the existing state declarations (around line 26), add:

Find:
```typescript
  const [deletingLink, setDeletingLink] = useState<Link | null>(null)
  const [previousAddDialogState, setPreviousAddDialogState] = useState(false)
  const [previousEditDialogState, setPreviousEditDialogState] = useState(false)
```

Add after:
```typescript
  const [qrLink, setQrLink] = useState<Link | null>(null)
```

- [ ] **Step 3: Add QR button to desktop table actions**

Edit `components/user/links-table.tsx` at line 256 (desktop table actions cell):

Find:
```typescript
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
                    </div>
                  </td>
```

Replace with:
```typescript
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
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setQrLink(link)}
                        className="h-9 w-9"
                        title="Tampilkan QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
```

- [ ] **Step 4: Add QR button to mobile card actions**

Edit `components/user/links-table.tsx` at line 167 (mobile card actions):

Find:
```typescript
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleOpenLink(link)}
                  className="h-8 w-8"
                  title="Buka link di tab baru"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
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
```

Replace with:
```typescript
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleOpenLink(link)}
                  className="h-8 w-8"
                  title="Buka link di tab baru"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
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
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQrLink(link)}
                  className="h-8 w-8"
                  title="Tampilkan QR Code"
                >
                  <QrCode className="h-3.5 w-3.5" />
                </Button>
              </div>
```

- [ ] **Step 5: Add QR modal at the end of component**

Edit `components/user/links-table.tsx` at the end, before the closing `</Card>`:

Find the end of the component (before `</Card>`):
```typescript
      <DeleteConfirmDialog
        open={!!deletingLink}
        onOpenChange={(open: boolean) => !open && setDeletingLink(null)}
        onConfirm={() => deletingLink && handleDelete(deletingLink.id)}
        title={deletingLink?.title || ''}
      />
    </Card>
  )
}
```

Add before `</Card>`:
```typescript
      <DeleteConfirmDialog
        open={!!deletingLink}
        onOpenChange={(open: boolean) => !open && setDeletingLink(null)}
        onConfirm={() => deletingLink && handleDelete(deletingLink.id)}
        title={deletingLink?.title || ''}
      />

      <QRCodeModal
        open={!!qrLink}
        onOpenChange={(open) => !open && setQrLink(null)}
        link={qrLink || { title: '', url: '', qr_code: null }}
      />
    </Card>
  )
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit components/user/links-table.tsx
```

Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add components/user/links-table.tsx
git commit -m "feat: add QR code button to links table (dashboard)"
```

---

## Task 11: Update Link Card Component (Public Profile)

**Files:**
- Modify: `components/link-card.tsx`

- [ ] **Step 1: Add QR code imports and state**

Edit `components/link-card.tsx` at line 1:

Find:
```typescript
'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Link } from '@/lib/supabase'
import { ariaLabels } from '@/lib/accessibility'
import { cn } from '@/lib/utils'
```

Replace with:
```typescript
'use client'

import { useState } from 'react'
import { ExternalLink, QrCode } from 'lucide-react'
import type { Link } from '@/lib/supabase'
import { ariaLabels } from '@/lib/accessibility'
import { cn } from '@/lib/utils'
import { QRCodeModal } from '@/components/shared/qr-code-modal'
```

- [ ] **Step 2: Add QR modal state**

After the existing state declaration (line 15), add:

Find:
```typescript
export function LinkCard({ link, themeColor = '#2563eb' }: LinkCardProps) {
  const [isClicked, setIsClicked] = useState(false)
```

Add after:
```typescript
  const [showQR, setShowQR] = useState(false)
```

- [ ] **Step 3: Add QR button to the card**

Edit `components/link-card.tsx` at line 86 (content section with external link icon):

Find:
```typescript
      {/* Content */}
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-slate-900 transition-all duration-300 truncate group-hover:scale-[1.02]"
            style={{
              color: isClicked ? themeColor : undefined,
            }}
            title={link.title}
            id={`link-title-${link.id}`}
          >
            {link.title}
          </h3>
          <p
            className="mt-1 text-sm text-slate-500 truncate transition-all duration-300 group-hover:translate-x-1"
            title={link.url}
            id={`link-url-${link.id}`}
          >
            {link.url}
          </p>
        </div>
        <ExternalLink
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-all duration-300",
            "text-slate-400 group-hover:scale-125 group-hover:rotate-12"
          )}
          style={{
            color: isClicked ? themeColor : undefined,
          }}
          aria-hidden="true"
        />
      </div>
```

Replace with:
```typescript
      {/* Content */}
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-slate-900 transition-all duration-300 truncate group-hover:scale-[1.02]"
            style={{
              color: isClicked ? themeColor : undefined,
            }}
            title={link.title}
            id={`link-title-${link.id}`}
          >
            {link.title}
          </h3>
          <p
            className="mt-1 text-sm text-slate-500 truncate transition-all duration-300 group-hover:translate-x-1"
            title={link.url}
            id={`link-url-${link.id}`}
          >
            {link.url}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowQR(true)
            }}
            className={cn(
              "h-5 w-5 flex-shrink-0 transition-all duration-300",
              "text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100",
              "hover:scale-110"
            )}
            title="Tampilkan QR Code"
            aria-label={`Tampilkan QR Code untuk ${link.title}`}
          >
            <QrCode className="h-full w-full" />
          </button>
          <ExternalLink
            className={cn(
              "h-5 w-5 flex-shrink-0 transition-all duration-300",
              "text-slate-400 group-hover:scale-125 group-hover:rotate-12"
            )}
            style={{
              color: isClicked ? themeColor : undefined,
            }}
            aria-hidden="true"
          />
        </div>
      </div>
```

- [ ] **Step 4: Add QR modal at the end of component**

Edit `components/link-card.tsx` at the end, before the closing `)`:

Find the end of the component (before final closing `)` and `}`):
```typescript
      />
    </button>
  )
}
```

Add before `</button>`:
```typescript
      />

      <QRCodeModal
        open={showQR}
        onOpenChange={setShowQR}
        link={{
          title: link.title,
          url: link.url,
          qr_code: (link as any).qr_code || null
        }}
      />
    </button>
  )
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit components/link-card.tsx
```

Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add components/link-card.tsx
git commit -m "feat: add QR code button to link cards (public profile)"
```

---

## Task 12: Manual Testing

**Files:**
- None (manual testing)

- [ ] **Step 1: Start development server**

Run:
```bash
npm run dev
```

- [ ] **Step 2: Test link creation with QR code**

1. Navigate to http://localhost:3000/dashboard/links
2. Click "Tambah Link Baru"
3. Fill form:
   - Title: "Test QR Code"
   - URL: "https://example.com/test-qr"
   - Category: (optional)
   - Is Public: Yes
4. Click "Simpan"

Expected: Link is created successfully. Check browser dev tools Network tab to see QR code in response.

- [ ] **Step 3: Test QR button in dashboard (desktop)**

1. In the links table, find the QR button (📱 icon)
2. Click the QR button

Expected:
- Modal opens with QR code
- QR code displays correctly (200x200)
- URL is displayed below QR code
- "Download QR Code" button works
- "Tutup" button closes modal

- [ ] **Step 4: Test QR button in dashboard (mobile)**

1. Resize browser to mobile width (< 768px)
2. Find the QR button in the card view
3. Click the QR button

Expected: Same modal opens correctly on mobile view

- [ ] **Step 5: Test QR download**

1. Open QR modal
2. Click "Download QR Code" button

Expected:
- File downloads as `qr-test-qr-code.png`
- File can be opened and displays QR code correctly

- [ ] **Step 6: Test QR code on public profile**

1. Set the test link as public
2. Navigate to public profile (http://localhost:3000/[your-slug])
3. Hover over the link card

Expected: QR button fades in on hover

4. Click the QR button

Expected: Same modal opens with QR code

- [ ] **Step 7: Test QR code scan**

1. Download a QR code
2. Scan with smartphone camera (iPhone or Android)

Expected: Camera recognizes QR code and opens the URL

- [ ] **Step 8: Test URL update regenerates QR code**

1. Edit the test link
2. Change URL to different value
3. Save

Expected: QR code is regenerated with new URL

- [ ] **Step 9: Test legacy link without QR code**

1. In database, find or create a link without qr_code field
2. Try to open QR modal for that link

Expected: Modal shows fallback message "QR code tidak tersedia"

- [ ] **Step 10: Test long URL**

1. Create a link with very long URL (200+ characters)
2. Check QR code generation

Expected: QR code generates successfully and is scannable

- [ ] **Step 11: Test special characters in URL**

1. Create a link with special characters: `https://example.com?param=value&foo=bar#section`
2. Check QR code generation

Expected: QR code generates successfully and scans correctly

---

## Task 13: Final Verification

**Files:**
- None (verification)

- [ ] **Step 1: Check for TypeScript errors**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: Run ESLint**

Run:
```bash
npm run lint
```

Expected: No critical errors (warnings are acceptable)

- [ ] **Step 3: Check all files are committed**

Run:
```bash
git status
```

Expected: No uncommitted changes (or only intentional changes)

- [ ] **Step 4: Verify database migration**

Run:
```bash
sqlite3 data/linksphere.db "SELECT sql FROM sqlite_master WHERE type='table' AND name='links';"
```

Expected output includes `qr_code TEXT` column

- [ ] **Step 5: Check Link type includes qr_code**

Run:
```bash
grep -A 15 "export type Link" lib/supabase.ts
```

Expected output includes `qr_code?: string | null`

- [ ] **Step 6: Final commit summary**

Run:
```bash
git log --oneline -15
```

Expected: All feature commits are present:
- deps: add react-qr-code package
- feat: add qr_code field to Link type
- feat: add QR code generation utility
- feat: add qr_code support to SQLite database client
- feat: add database migration for qr_code column
- feat: generate QR code on link creation
- feat: regenerate QR code when link URL changes
- feat: add QR code modal component
- feat: add QR code button to links table
- feat: add QR code button to link cards

---

## Task 14: Update Documentation

**Files:**
- Modify: `SESSION_SUMMARY_2026-04-03.md` (or create new session summary)

- [ ] **Step 1: Update session summary with completed feature**

Add to the session summary file:

```markdown
## ✅ Completed Today

### QR Code Feature (2026-04-03)

Implemented QR code generation, display, and download functionality for links:
- Auto-generate QR codes when links are created/updated
- Store QR codes as base64 in database
- Display QR codes in modal (dashboard + public profile)
- Download QR codes as PNG images

Files modified:
- lib/supabase.ts - Added qr_code to Link type
- lib/qr-code.ts - QR code generation utility
- lib/db-sqlite.ts - Database support for qr_code
- app/api/links/route.ts - Generate QR on create
- app/api/links/[id]/route.ts - Regenerate QR on URL update
- components/shared/qr-code-modal.tsx - QR modal component
- components/user/links-table.tsx - QR button in dashboard
- components/link-card.tsx - QR button in public profile
```

- [ ] **Step 2: Commit documentation updates**

```bash
git add SESSION_SUMMARY_2026-04-03.md
git commit -m "docs: update session summary with QR code feature"
```

---

## Success Criteria Verification

After completing all tasks, verify:

- [ ] QR code generates automatically on link save (< 500ms)
- [ ] QR button visible in dashboard (desktop & mobile)
- [ ] QR button visible in public profile (on hover)
- [ ] QR modal opens instantly with QR code
- [ ] Download button downloads QR code as PNG
- [ ] QR codes are scannable by smartphone cameras
- [ ] URL update regenerates QR code
- [ ] Legacy links show fallback message
- [ ] Long URLs work correctly
- [ ] Special characters in URLs work correctly
- [ ] No TypeScript errors
- [ ] No critical ESLint errors

---

## Notes

- For Supabase deployments, run the migration in Supabase SQL Editor
- QR codes are stored as base64 SVG data URIs (~2-5KB per link)
- Error handling: QR generation failures don't block link creation
- Legacy links without qr_code show friendly fallback message
