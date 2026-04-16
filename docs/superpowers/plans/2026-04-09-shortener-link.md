# Shortener Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan kemampuan URL shortener ke setiap link di LinkSphere dengan pendekatan hybrid (auto-generate + custom editable), redirect route `domain.com/[shortCode]`, dan validasi mengikuti pola `custom_slug`.

**Architecture:**
1. **Backend Layer:** Tambah kolom `short_code` ke tabel `links`, implementasi fungsi generate dan validate short code, create redirect handler route
2. **Frontend Layer:** Tambah input field untuk short code di form dialog, display short link dengan copy button di table
3. **Validation Layer:** Reuse pola validasi `custom_slug` dengan reserved words list tambahan

**Tech Stack:** Next.js 15, TypeScript 5.7, SQLite/Supabase, Zod, shadcn/ui

---

## File Structure

### Files to Create (2 files)
```
app/[code]/page.tsx                    # Redirect handler untuk short links
scripts/migrate-sqlite-shortener.js    # SQLite migration script
```

### Files to Modify (8 files)
```
lib/validation.ts                      # Tambah shortCodeSchema dan RESERVED_SHORT_CODES
lib/db-types.ts                        # Tambah method getLinkByShortCode dan isShortCodeExists
lib/db-sqlite.ts                       # Update schema dan implementasi short code methods
lib/db-supabase.ts                     # Implementasi short code methods untuk Supabase
app/api/links/route.ts                 # Handle short code generation dan validation
app/api/links/[id]/route.ts            # Update untuk handle short code pada edit
components/user/link-form-dialog.tsx   # Tambah input field dan tombol auto-generate
components/user/links-table.tsx        # Display short link dengan copy button
```

---

## Task 1: Update Validation Layer

**Files:**
- Modify: `lib/validation.ts`

**Purpose:** Menambahkan schema validasi dan reserved words untuk short code

- [ ] **Step 1: Tambah RESERVED_SHORT_CODES constant**

Tambahkan constant setelah `RESERVED_SLUGS`:

```typescript
/**
 * Reserved short codes - cannot be used for URL shortening
 * These conflict with system routes
 */
export const RESERVED_SHORT_CODES = [
  ...RESERVED_SLUGS,  // Reuse existing slugs
  'u',  // User pages pattern
  's', 'l', 'go', 'to',  // Common shortener prefixes
  'www', 'mail', 'ftp', 'static', 'assets', 'docs'
]
```

- [ ] **Step 2: Tambah shortCodeSchema**

Tambahkan schema setelah `slugSchema`:

```typescript
/**
 * Short code validation for URL shortener
 */
export const shortCodeSchema = z
  .string()
  .min(3, 'Short code minimal 3 karakter')
  .max(30, 'Short code maksimal 30 karakter')
  .regex(/^[a-z0-9-]+$/, 'Short code hanya boleh mengandung huruf kecil, angka, dan tanda hubung')
  .regex(/^[a-z0-9]/, 'Short code harus diawali huruf atau angka')
  .regex(/[a-z0-9]$/, 'Short code harus diakhiri huruf atau angka')
  .refine((code) => !RESERVED_SHORT_CODES.includes(code), 'Short code ini sudah digunakan oleh sistem')
  .transform((code) => code.toLowerCase()) // Always store as lowercase
```

- [ ] **Step 3: Update linkSchema untuk include short_code**

Update `linkSchema` untuk mendukung short code:

```typescript
export const linkSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200),
  url: urlSchema,
  description: z.string().max(500).optional(),
  category_id: z.string().uuid('ID kategori tidak valid').optional(),
  is_public: z.boolean().default(false),
  is_active: z.boolean().default(true),
  short_code: shortCodeSchema.optional().nullable()  // NEW
})
```

- [ ] **Step 4: Commit validation changes**

```bash
git add lib/validation.ts
git commit -m "feat(validation): add short code schema and reserved words"
```

---

## Task 2: Update Database Type Interface

**Files:**
- Modify: `lib/db-types.ts`

**Purpose:** Menambahkan method baru untuk short code operations di DatabaseClient interface

- [ ] **Step 1: Tambah method untuk short code operations**

Tambahkan method-method ini di dalam `DatabaseClient` interface (setelah `incrementClickCount`):

```typescript
// Links (existing methods...)
getLinks(userId?: string): Promise<any[]>
getLinkById(id: string): Promise<any | null>
createLink(link: any): Promise<any>
updateLink(id: string, data: any, userId: string): Promise<any>
deleteLink(id: string, userId: string): Promise<void>
incrementClickCount(id: string): Promise<void>

// NEW - Short code methods
getLinkByShortCode(shortCode: string): Promise<any | null>
isShortCodeExists(shortCode: string, excludeLinkId?: string): Promise<boolean>
generateShortCode(length?: number): Promise<string>
```

- [ ] **Step 2: Commit interface changes**

```bash
git add lib/db-types.ts
git commit -m "feat(db-types): add short code methods to DatabaseClient interface"
```

---

## Task 3: Update SQLite Implementation

**Files:**
- Modify: `lib/db-sqlite.ts`

**Purpose:** Implementasi short code methods untuk SQLite dan update schema

- [ ] **Step 1: Update schema initialization**

Update `initializeSchema()` function untuk tambah kolom `short_code`:

```typescript
function initializeSchema() {
  // ... existing tables ...

  // Links table - UPDATE this section
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
      qr_code TEXT,
      short_code TEXT UNIQUE,        -- NEW COLUMN
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `)

  // Update indexes section - ADD this index
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code) WHERE short_code IS NOT NULL;
  `)
}
```

- [ ] **Step 2: Implement getLinkByShortCode method**

Tambahkan method ini setelah `getLinkById`:

```typescript
async getLinkByShortCode(shortCode: string) {
  const stmt = db.prepare(`
    SELECT l.*, c.name as category_name, c.icon as category_icon
    FROM links l
    LEFT JOIN categories c ON l.category_id = c.id
    WHERE l.short_code = ?
  `)
  const row = stmt.get(shortCode.toLowerCase())
  return rowToObject(row)
}
```

- [ ] **Step 3: Implement isShortCodeExists method**

Tambahkan method ini setelah `getLinkByShortCode`:

```typescript
async isShortCodeExists(shortCode: string, excludeLinkId?: string): Promise<boolean> {
  let query = 'SELECT 1 FROM links WHERE short_code = ?'
  const params: any[] = [shortCode.toLowerCase()]

  if (excludeLinkId) {
    query += ' AND id != ?'
    params.push(excludeLinkId)
  }

  const stmt = db.prepare(query)
  const row = stmt.get(...params)
  return !!row
}
```

- [ ] **Step 4: Implement generateShortCode method**

Tambahkan method ini setelah `isShortCodeExists`:

```typescript
async generateShortCode(length: number = 6): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Cek apakah code sudah ada
    const exists = await this.isShortCodeExists(code)
    if (!exists) {
      return code
    }

    attempts++
  }

  // Jika setelah maxAttempts masih gagal, coba length yang lebih panjang
  if (length < 10) {
    return this.generateShortCode(length + 1)
  }

  throw new Error('Gagal generate short code yang unik')
}
```

- [ ] **Step 5: Update createLink method**

Update `createLink` method untuk support `short_code`:

```typescript
async createLink(link: any) {
  const stmt = db.prepare(`
    INSERT INTO links (id, title, url, description, category_id, is_public, is_active, qr_code, short_code, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    link.id,
    link.title,
    link.url,
    link.description || null,
    link.category_id || null,
    link.is_public ? 1 : 0,
    link.is_active !== undefined ? (link.is_active ? 1 : 0) : 1,
    link.qr_code || null,
    link.short_code || null,
    link.user_id
  )
  return this.getLinkById(link.id)
}
```

- [ ] **Step 6: Update updateLink method**

Update `updateLink` method untuk support `short_code` dan validasi tidak bisa hapus:

```typescript
async updateLink(id: string, data: any, userId: string) {
  // Jika mencoba menghapus short_code yang sudah ada
  if (data.short_code === null || data.short_code === '') {
    const existing = await this.getLinkById(id)
    if (existing && existing.short_code) {
      throw new Error('Tidak bisa menghapus short code yang sudah ada')
    }
  }

  const fields: string[] = []
  const values: any[] = []

  if (data.title !== undefined) {
    fields.push('title = ?')
    values.push(data.title)
  }
  if (data.url !== undefined) {
    fields.push('url = ?')
    values.push(data.url)
  }
  if (data.description !== undefined) {
    fields.push('description = ?')
    values.push(data.description)
  }
  if (data.category_id !== undefined) {
    fields.push('category_id = ?')
    values.push(data.category_id)
  }
  if (data.is_active !== undefined) {
    fields.push('is_active = ?')
    values.push(data.is_active ? 1 : 0)
  }
  if (data.is_public !== undefined) {
    fields.push('is_public = ?')
    values.push(data.is_public ? 1 : 0)
  }
  if (data.qr_code !== undefined) {
    fields.push('qr_code = ?')
    values.push(data.qr_code)
  }
  if (data.short_code !== undefined) {
    fields.push('short_code = ?')
    values.push(data.short_code || null)
  }

  fields.push('updated_at = CURRENT_TIMESTAMP')

  if (fields.length > 0) {
    values.push(id, userId)
    const stmt = db.prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
    stmt.run(...values)
  }

  return this.getLinkById(id)
}
```

- [ ] **Step 7: Commit SQLite implementation**

```bash
git add lib/db-sqlite.ts
git commit -m "feat(db-sqlite): add short code support with schema update"
```

---

## Task 4: Update Supabase Implementation

**Files:**
- Modify: `lib/db-supabase.ts`

**Purpose:** Implementasi short code methods untuk Supabase (sama persis dengan SQLite)

- [ ] **Step 1: Baca lib/db-supabase.ts untuk memahami pattern**

Baca file untuk melihat pola implementasi Supabase

```bash
cat lib/db-supabase.ts
```

- [ ] **Step 2: Implement getLinkByShortCode method**

Tambahkan method ini setelah `getLinkById`:

```typescript
async getLinkByShortCode(shortCode: string): Promise<any | null> {
  const { data, error } = await this.supabase
    .from('links')
    .select(`
      *,
      category:categories(id, name, icon)
    `)
    .eq('short_code', shortCode.toLowerCase())
    .single()

  if (error || !data) {
    return null
  }

  return {
    ...data,
    is_public: Boolean(data.is_public),
    is_active: Boolean(data.is_active)
  }
}
```

- [ ] **Step 3: Implement isShortCodeExists method**

Tambahkan method ini setelah `getLinkByShortCode`:

```typescript
async isShortCodeExists(shortCode: string, excludeLinkId?: string): Promise<boolean> {
  let query = this.supabase
    .from('links')
    .select('id', { count: 'exact', head: true })
    .eq('short_code', shortCode.toLowerCase())

  if (excludeLinkId) {
    query = query.neq('id', excludeLinkId)
  }

  const { count, error } = await query

  return !error && (count || 0) > 0
}
```

- [ ] **Step 4: Implement generateShortCode method**

Tambahkan method ini (sama persis dengan SQLite):

```typescript
async generateShortCode(length: number = 6): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const exists = await this.isShortCodeExists(code)
    if (!exists) {
      return code
    }

    attempts++
  }

  if (length < 10) {
    return this.generateShortCode(length + 1)
  }

  throw new Error('Gagal generate short code yang unik')
}
```

- [ ] **Step 5: Update createLink method**

Update `createLink` untuk support `short_code`:

```typescript
async createLink(link: any): Promise<any> {
  const { data, error } = await this.supabase
    .from('links')
    .insert({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      category_id: link.category_id,
      is_public: link.is_public,
      is_active: link.is_active ?? true,
      qr_code: link.qr_code,
      short_code: link.short_code,  // NEW
      user_id: link.user_id
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
```

- [ ] **Step 6: Update updateLink method**

Update `updateLink` untuk support `short_code`:

```typescript
async updateLink(id: string, data: any, userId: string): Promise<any> {
  // Validasi tidak bisa hapus short code
  if (data.short_code === null || data.short_code === '') {
    const existing = await this.getLinkById(id)
    if (existing && existing.short_code) {
      throw new Error('Tidak bisa menghapus short code yang sudah ada')
    }
  }

  const updateData: any = {}
  const allowedFields = ['title', 'url', 'description', 'category_id', 'is_public', 'is_active', 'qr_code', 'short_code']

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field]
    }
  }

  updateData.updated_at = new Date().toISOString()

  const { data: result, error } = await this.supabase
    .from('links')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return result
}
```

- [ ] **Step 7: Commit Supabase implementation**

```bash
git add lib/db-supabase.ts
git commit -m "feat(db-supabase): add short code support"
```

---

## Task 5: Update Link API Route

**Files:**
- Modify: `app/api/links/route.ts`

**Purpose:** Handle short code generation dan validation saat create/update link

- [ ] **Step 1: Baca current implementation**

```bash
cat app/api/links/route.ts
```

- [ ] **Step 2: Update POST handler untuk auto-generate short code**

Update bagian create new link untuk auto-generate short code:

```typescript
// POST create new link
export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId
    const body = await request.json()
    const { category_id, is_active, is_public, user_id, short_code } = body

    // Validate input with Zod
    try {
      linkSchema.parse(body)
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: formatZodError(error) },
          { status: 400 }
        )
      }
    }

    // Verify user_id matches session
    if (user_id && user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Generate QR code
    let qrCode: string | null = null
    try {
      qrCode = await generateQRCode(body.url)
    } catch (error) {
      console.error('[v0] QR code generation failed for link:', error)
    }

    // Generate short code (auto) if not provided
    let finalShortCode = short_code
    if (!finalShortCode) {
      try {
        finalShortCode = await db.generateShortCode()
      } catch (error) {
        console.error('[v0] Short code generation failed:', error)
        // Continue without short code if generation fails
      }
    } else {
      // Validate custom short code is not duplicate
      const exists = await db.isShortCodeExists(finalShortCode)
      if (exists) {
        return NextResponse.json(
          { error: 'Short code sudah digunakan' },
          { status: 409 }
        )
      }
    }

    const newLink = await db.createLink({
      id: crypto.randomUUID(),
      title: body.title,
      url: body.url,
      description: body.description,
      category_id,
      is_public: is_public ?? true,
      qr_code: qrCode,
      short_code: finalShortCode,  // NEW
      user_id: userId
    })

    if (!newLink) {
      return NextResponse.json(
        { error: 'Gagal membuat link baru' },
        { status: 500 }
      )
    }

    return NextResponse.json({ link: newLink }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in links POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit API changes**

```bash
git add app/api/links/route.ts
git commit -m "feat(api-links): add auto-generate short code on create"
```

---

## Task 6: Update Link ID API Route

**Files:**
- Modify: `app/api/links/[id]/route.ts`

**Purpose:** Handle short code validation saat update link

- [ ] **Step 1: Baca current implementation**

```bash
cat app/api/links/[id]/route.ts
```

- [ ] **Step 2: Update PATCH handler untuk validate short code**

Tambahkan validasi short code:

```typescript
// PATCH update link
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = session.userId
    const body = await request.json()

    // Validate input with Zod
    try {
      linkSchema.parse(body)
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: formatZodError(error) },
          { status: 400 }
        )
      }
    }

    // Verify ownership
    const existingLink = await db.getLinkById(id)
    if (!existingLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    if (existingLink.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate short code uniqueness if provided
    if (body.short_code) {
      const exists = await db.isShortCodeExists(body.short_code, id)
      if (exists) {
        return NextResponse.json(
          { error: 'Short code sudah digunakan' },
          { status: 409 }
        )
      }
    }

    // Update link
    const updatedLink = await db.updateLink(id, body, userId)

    return NextResponse.json({ link: updatedLink })
  } catch (error) {
    console.error('[v0] Error in links PATCH:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit API changes**

```bash
git add app/api/links/[id]/route.ts
git commit -m "feat(api-links-id): add short code validation on update"
```

---

## Task 7: Create Redirect Handler

**Files:**
- Create: `app/[code]/page.tsx`

**Purpose:** Handle redirect dari short code ke URL asli dengan HTTP 302

- [ ] **Step 1: Create redirect handler page**

Buat file baru untuk handle short code redirect:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'

interface PageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params
  return {
    title: `Redirecting...`,
    robots: {
      index: false,
      follow: false
    }
  }
}

export default async function ShortCodeRedirectPage({ params }: PageProps) {
  const { code } = await params

  // Validasi basic - cek apakah code mengandung karakter invalid
  if (!/^[a-zA-Z0-9-]+$/.test(code)) {
    notFound()
  }

  // Cari link berdasarkan short code (case-insensitive)
  const link = await db.getLinkByShortCode(code)

  if (!link) {
    notFound()
  }

  // Increment click count
  try {
    await db.incrementClickCount(link.id)
  } catch (error) {
    console.error('[v0] Error incrementing click count:', error)
    // Continue redirect even if tracking fails
  }

  // Redirect dengan HTTP 302 (Temporary)
  redirect(link.url)
}
```

- [ ] **Step 2: Test redirect handler secara manual**

```bash
# Start dev server
npm run dev

# Test di browser lain:
# - Buka http://localhost:3000/test (404 - tidak ada short code)
# - Pastikan tidak bentrok dengan route lain
```

Expected:
- Halaman 404 untuk short code yang tidak ada
- Redirect untuk short code yang valid

- [ ] **Step 3: Commit redirect handler**

```bash
git add app/[code]/page.tsx
git commit -m "feat(redirect): add short code redirect handler with 302 status"
```

---

## Task 8: Update Link Form Dialog (Frontend)

**Files:**
- Modify: `components/user/link-form-dialog.tsx`

**Purpose:** Tambah input field untuk short code dan tombol auto-generate

- [ ] **Step 1: Update formData state**

Update state untuk include `short_code`:

```typescript
const [formData, setFormData] = useState({
  title: '',
  url: '',
  category_id: '',
  is_active: true,
  is_public: true,
  short_code: ''  // NEW
})
```

- [ ] **Step 2: Update useEffect untuk initialize short_code**

Update useEffect untuk handle `short_code`:

```typescript
useEffect(() => {
  if (link) {
    setFormData({
      title: link.title,
      url: link.url,
      category_id: link.category_id,
      is_active: link.is_active,
      is_public: link.is_public,
      short_code: link.short_code || ''  // NEW
    })
  } else {
    setFormData({
      title: '',
      url: '',
      category_id: categories[0]?.id || '',
      is_active: true,
      is_public: true,
      short_code: ''  // NEW
    })
  }
}, [link, categories])
```

- [ ] **Step 3: Add state untuk validation**

Tambahkan state untuk error dan auto-generate loading:

```typescript
const [loading, setLoading] = useState(false)
const [shortCodeError, setShortCodeError] = useState('')  // NEW
const [generatingShortCode, setGeneratingShortCode] = useState(false)  // NEW
```

- [ ] **Step 4: Tambah fungsi generateShortCode**

Tambahkan fungsi untuk auto-generate short code:

```typescript
const handleGenerateShortCode = async () => {
  setGeneratingShortCode(true)
  setShortCodeError('')

  try {
    const response = await fetch('/api/links/generate-short-code', {
      method: 'POST'
    })

    if (response.ok) {
      const data = await response.json()
      setFormData({ ...formData, short_code: data.short_code })
    } else {
      const error = await response.json()
      setShortCodeError(error.error || 'Gagal generate short code')
    }
  } catch (error) {
    console.error('[v0] Error generating short code:', error)
    setShortCodeError('Gagal generate short code')
  } finally {
    setGeneratingShortCode(false)
  }
}
```

- [ ] **Step 5: Tambah fungsi validateShortCode**

Tambahkan fungsi untuk real-time validation:

```typescript
const handleShortCodeChange = async (value: string) => {
  setFormData({ ...formData, short_code: value })
  setShortCodeError('')

  if (!value) return

  // Basic client-side validation
  if (!/^[a-z0-9-]+$/.test(value)) {
    setShortCodeError('Hanya huruf kecil, angka, dan -')
    return
  }

  if (value.length < 3) {
    setShortCodeError('Minimal 3 karakter')
    return
  }

  // Check reserved words
  const { RESERVED_SHORT_CODES } = await import('@/lib/validation')
  if (RESERVED_SHORT_CODES.includes(value)) {
    setShortCodeError('Short code ini sudah digunakan oleh sistem')
    return
  }

  // Check duplicate (debounced)
  const timeoutId = setTimeout(async () => {
    try {
      const excludeLinkId = link?.id
      const response = await fetch(`/api/links/check-short-code?code=${value}&exclude=${excludeLinkId || ''}`)

      if (!response.ok) {
        const error = await response.json()
        setShortCodeError(error.error || 'Short code sudah digunakan')
      }
    } catch (error) {
      console.error('[v0] Error checking short code:', error)
    }
  }, 500)

  return () => clearTimeout(timeoutId)
}
```

- [ ] **Step 6: Tambah input field di form**

Tambahkan input field setelah URL field:

```typescript
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

{/* NEW - Short Code Input */}
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label htmlFor="short_code">Short Code (Opsional)</Label>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerateShortCode}
      disabled={generatingShortCode}
      className="h-7 text-xs"
    >
      {generatingShortCode ? '...' : '🔄 Auto-generate'}
    </Button>
  </div>
  <Input
    id="short_code"
    placeholder="Biarkan kosong untuk auto-generate"
    value={formData.short_code}
    onChange={(e) => handleShortCodeChange(e.target.value)}
  />
  {formData.short_code && (
    <p className="text-xs text-slate-500">
      Short link: <span className="font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/{formData.short_code}</span>
    </p>
  )}
  {shortCodeError && (
    <p className="text-xs text-red-500">{shortCodeError}</p>
  )}
</div>

<div className="space-y-2">
  <Label htmlFor="category">Pilih Kategori</Label>
  {/* ... existing category select ... */}
</div>
```

- [ ] **Step 7: Update handleSubmit untuk include short_code**

Update bodyData untuk include short_code:

```typescript
const bodyData = link
  ? { ...formData, id: link.id }
  : { ...formData, user_id: userId }

// Tambahkan short_code ke bodyData
if (formData.short_code) {
  bodyData.short_code = formData.short_code
}
```

- [ ] **Step 8: Clear error saat dialog buka**

Tambahkan di useEffect untuk clear error:

```typescript
useEffect(() => {
  if (open) {
    setShortCodeError('')  // NEW
  }
}, [open])
```

- [ ] **Step 9: Commit dialog changes**

```bash
git add components/user/link-form-dialog.tsx
git commit -m "feat(link-form): add short code input with auto-generate"
```

---

## Task 9: Add Short Code Helper API Routes

**Files:**
- Create: `app/api/links/generate-short-code/route.ts`
- Create: `app/api/links/check-short-code/route.ts`

**Purpose:** API endpoints untuk generate dan check short code

- [ ] **Step 1: Create generate-short-code API**

Buat endpoint untuk generate short code:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shortCode = await db.generateShortCode()

    return NextResponse.json({ short_code: shortCode })
  } catch (error) {
    console.error('[v0] Error generating short code:', error)
    return NextResponse.json(
      { error: 'Gagal generate short code' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Create check-short-code API**

Buat endpoint untuk check short code availability:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { shortCodeSchema, RESERVED_SHORT_CODES } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const excludeId = searchParams.get('exclude')

    if (!code) {
      return NextResponse.json(
        { error: 'Short code wajib diisi' },
        { status: 400 }
      )
    }

    // Validate format
    try {
      shortCodeSchema.parse(code)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Format short code tidak valid' },
        { status: 400 }
      )
    }

    // Check reserved words
    if (RESERVED_SHORT_CODES.includes(code)) {
      return NextResponse.json(
        { error: 'Short code ini sudah digunakan oleh sistem' },
        { status: 409 }
      )
    }

    // Check duplicate
    const exists = await db.isShortCodeExists(code, excludeId || undefined)
    if (exists) {
      return NextResponse.json(
        { error: 'Short code sudah digunakan' },
        { status: 409 }
      )
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    console.error('[v0] Error checking short code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit helper APIs**

```bash
git add app/api/links/generate-short-code/route.ts app/api/links/check-short-code/route.ts
git commit -m "feat(api): add short code helper endpoints"
```

---

## Task 10: Update Links Table (Display Short Link)

**Files:**
- Modify: `components/user/links-table.tsx`

**Purpose:** Display short link dan tombol copy

- [ ] **Step 1: Buka file links-table.tsx**

```bash
cat components/user/links-table.tsx
```

- [ ] **Step 2: Tambah fungsi copyToClipboard**

Tambahkan fungsi untuk copy short link:

```typescript
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // Show toast notification
    alert('Short link berhasil disalin!')
  } catch (error) {
    console.error('[v0] Error copying to clipboard:', error)
  }
}
```

- [ ] **Step 3: Update table cell untuk display short link**

Tambahkan kolom short link di table:

```typescript
// Di dalam table body map, tambahkan cell untuk short link
{link.short_code && (
  <div className="flex items-center gap-2 text-xs">
    <span className="font-mono text-slate-600">
      {typeof window !== 'undefined' ? window.location.origin : ''}/{link.short_code}
    </span>
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/${link.short_code}`)}
    >
      📋
    </Button>
  </div>
)}
```

- [ ] **Step 4: Update table header**

Tambahkan header untuk short link:

```typescript
<TableHead>Short Link</TableHead>
```

- [ ] **Step 5: Commit table changes**

```bash
git add components/user/links-table.tsx
git commit -m "feat(links-table): add short link display with copy button"
```

---

## Task 11: Create SQLite Migration Script

**Files:**
- Create: `scripts/migrate-sqlite-shortener.js`

**Purpose:** Migration script untuk existing SQLite databases

- [ ] **Step 1: Create migration script**

```javascript
const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dbDir, 'linksphere.db')

console.log('[Migration] Starting short code migration...')

try {
  const db = new Database(dbPath)

  // Check if short_code column already exists
  const pragma = db.pragma('table_info(links)')
  const hasShortCodeColumn = pragma.some(col => col.name === 'short_code')

  if (hasShortCodeColumn) {
    console.log('[Migration] short_code column already exists. Skipping.')
    db.close()
    process.exit(0)
  }

  console.log('[Migration] Adding short_code column to links table...')

  // Add short_code column
  db.exec('ALTER TABLE links ADD COLUMN short_code TEXT UNIQUE')

  console.log('[Migration] Creating index on short_code...')

  // Create index
  db.exec('CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code) WHERE short_code IS NOT NULL')

  console.log('[Migration] ✅ Migration completed successfully!')

  db.close()
} catch (error) {
  console.error('[Migration] ❌ Error:', error.message)
  process.exit(1)
}
```

- [ ] **Step 2: Update package.json untuk tambah migration command**

Tambahkan script di package.json:

```json
{
  "scripts": {
    "migrate:shortener": "node scripts/migrate-sqlite-shortener.js"
  }
}
```

- [ ] **Step 3: Test migration script**

```bash
# Jalankan migration
npm run migrate:shortener

# Expected output:
# [Migration] Starting short code migration...
# [Migration] Adding short_code column to links table...
# [Migration] Creating index on short_code...
# [Migration] ✅ Migration completed successfully!
```

- [ ] **Step 4: Commit migration script**

```bash
git add scripts/migrate-sqlite-shortener.js package.json
git commit -m "feat(migration): add SQLite short code migration script"
```

---

## Task 12: Create Supabase Migration File

**Files:**
- Create: `supabase/migrations/20260409_add_short_code.sql`

**Purpose:** Migration script untuk Supabase

- [ ] **Step 1: Check apakah folder supabase/migrations ada**

```bash
ls -la supabase/migrations/ || echo "Folder does not exist"
```

- [ ] **Step 2: Create migration file**

```sql
-- Migration: Add short_code column to links table
-- Created: 2026-04-09

-- Add short_code column (nullable, unique)
ALTER TABLE links ADD COLUMN IF NOT EXISTS short_code TEXT UNIQUE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_links_short_code
ON links(short_code)
WHERE short_code IS NOT NULL;

-- Add comment
COMMENT ON COLUMN links.short_code IS 'Short code for URL shortener. Nullable, unique globally.';
```

- [ ] **Step 3: Commit Supabase migration**

```bash
git add supabase/migrations/20260409_add_short_code.sql
git commit -m "feat(migration): add Supabase short code migration"
```

---

## Task 13: Update Documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md` (if exists)

**Purpose:** Dokumentasikan fitur shortener link

- [ ] **Step 1: Update CLAUDE.md**

Tambahkan dokumentasi fitur shortener di CLAUDE.md:

```markdown
## URL Shortener

Fitur URL shortener memungkinkan setiap link memiliki short code untuk share link individual dengan format `domain.com/[shortCode]`.

**Pendekatan:** Hybrid (Auto-generate + Custom Editable)

**Validasi:**
- Short code mengikuti pola validasi yang sama dengan `custom_slug`
- Reserved words: lihat `RESERVED_SHORT_CODES` di `lib/validation.ts`
- Case-insensitive (disimpan sebagai lowercase)

**Database:**
- Kolom: `links.short_code` (TEXT, UNIQUE, nullable)
- Index: `idx_links_short_code`

**API Endpoints:**
- `POST /api/links/generate-short-code` - Generate short code random
- `GET /api/links/check-short-code?code=xxx` - Cek ketersediaan short code

**Redirect:**
- Route: `/[code]/page.tsx`
- HTTP Status: 302 (Temporary Redirect)
- Auto-increment click count

**Migration:**
- SQLite: `npm run migrate:shortener`
- Supabase: Apply `supabase/migrations/20260409_add_short_code.sql`
```

- [ ] **Step 2: Commit documentation updates**

```bash
git add CLAUDE.md
git commit -m "docs: add shortener link feature documentation"
```

---

## Task 14: Testing & Verification

**Purpose:** Comprehensive testing untuk semua fitur

- [ ] **Step 1: Test auto-generate short code**

1. Buka dashboard user
2. Klik "Tambah Link Baru"
3. Isi title dan URL, biarkan short code kosong
4. Klik "Simpan Link"

Expected:
- Link berhasil dibuat dengan short code auto-generated (6 karakter)
- Short code muncul di links table

- [ ] **Step 2: Test custom short code**

1. Klik "Tambah Link Baru"
2. Isi short code dengan custom value (misal: `test-link`)
3. Klik "Simpan Link"

Expected:
- Link berhasil dibuat dengan custom short code
- Short code bisa diakses via `domain.com/test-link`

- [ ] **Step 3: Test reserved words validation**

1. Klik "Tambah Link Baru"
2. Isi short code dengan `dashboard`

Expected:
- Error message: "Short code ini sudah digunakan oleh sistem"

- [ ] **Step 4: Test duplicate detection**

1. Buat link dengan short code `my-first-link`
2. Buat link lain dengan short code yang sama

Expected:
- Error message: "Short code sudah digunakan"

- [ ] **Step 5: Test edit short code**

1. Edit link yang sudah punya short code
2. Ubah short code ke value lain
3. Simpan

Expected:
- Short code berhasil di-update
- Link lama tidak bisa diakses, link baru bisa

- [ ] **Step 6: Test tidak bisa hapus short code**

1. Edit link yang punya short code
2. Coba hapus/clear short code field
3. Simpan

Expected:
- Error message: "Tidak bisa menghapus short code yang sudah ada"

- [ ] **Step 7: Test redirect**

1. Buat link dengan short code `google-test`
2. Buka browser ke `domain.com/google-test`

Expected:
- Redirect ke URL tujuan
- Click count bertambah

- [ ] **Step 8: Test 404 untuk invalid short code**

1. Buka browser ke `domain.com/invalid-code-xyz`

Expected:
- Halaman 404

- [ ] **Step 9: Test copy button**

1. Buka links table
2. Klik tombol copy pada short link

Expected:
- Short link ter-copy ke clipboard
- Toast notification muncul

- [ ] **Step 10: Test migration**

```bash
# Untuk existing database
npm run migrate:shortener

# Verify column exists
sqlite3 data/linksphere.db ".schema links"
```

Expected:
- Kolom `short_code` ada di schema
- Index `idx_links_short_code` ada

- [ ] **Step 11: Performance test**

1. Buat 100+ link dengan short code
2. Test redirect speed

Expected:
- Redirect response time < 100ms
- Database query menggunakan index

---

## Self-Review Checklist

- [ ] **Spec Coverage:** Semua requirement dari review document tercakup
  - Auto-generate short code ✓
  - Custom editable short code ✓
  - Validasi reserved words ✓
  - Duplikasi check ✓
  - Tidak bisa hapus short code ✓
  - Redirect 302 ✓
  - Export/import support (via API) ✓

- [ ] **Placeholder Scan:** Tidak ada TBD, TODO, atau placeholder

- [ ] **Type Consistency:** Nama method konsisten (`getLinkByShortCode`, `isShortCodeExists`, `generateShortCode`)

- [ ] **Database Coverage:** SQLite dan Supabase sama-sama diimplementasikan

---

**Total Tasks:** 14 tasks
**Estimated Time:** 3-4 jam
**Complexity:** Medium

## Prerequisites

Sebelum memulai implementasi:
- Node.js dan npm terinstall
- Database (SQLite atau Supabase) sudah setup
- Development environment siap

## Post-Implementation

Setelah selesai:
- Update MEMORY.md dengan status fitur
- Test di production environment
- Monitor performance short code redirect
- Update changelog

---

**End of Implementation Plan**
