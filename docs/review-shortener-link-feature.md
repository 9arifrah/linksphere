# Review: Fitur Shortener Link - LinkSphere

**Tanggal:** 2026-04-09  
**Status:** Desain - Belum Diimplementasikan  
**Pendekatan:** Hybrid (Auto-generate + Custom Editable)

---

## 📋 Ringkasan Fitur

Penambahan kemampuan **URL shortener** ke setiap link yang ada di LinkSphere, memungkinkan user memiliki URL pendek untuk share link individual.

### Format URL
```
domain.com/[shortCode]  ← Tanpa prefix
```

Contoh:
- `domain.com/google` (custom)
- `domain.com/abc123` (auto-generated)
- `domain.com/my-portfolio` (custom)

---

## 🎯 Pendekatan Hybrid

### 1. Auto-Generate (Default)
- Short code 6 karakter random (a-z, 0-9)
- Dibuat otomatis saat create link
- Tombol "Auto-generate" untuk refresh

### 2. Custom Editable
- User bisa mengubah ke custom short code
- Validasi real-time untuk ketersediaan
- Format mengikuti pola `custom_slug` yang sudah ada

---

## ✅ Analisis Pendekatan

### Kelebihan

| Aspek | Penjelasan |
|-------|-----------|
| **User Experience** | User tidak dipaksa pilih - default auto-generate, tapi tetap bisa custom jika mau |
| **Simplicity** | Tidak perlu menu/fitur terpisah - terintegrasi langsung ke link management |
| **Consistency** | Validasi mengikuti pola `custom_slug` yang sudah teruji |
| **Short URL** | Tanpa prefix (`/s/`) membuat URL lebih pendek dan clean |
| **Click Tracking** | Bisa reuse sistem click tracking yang sudah ada |

### Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| **Routing Conflict** | Reserved words list + validasi ketat |
| **Short Code Duplikat** | Database unique constraint + check sebelum insert |
| **Reserved Words Bertambah** | Centralized list di `lib/validation.ts` |
| **Performance** | Index pada kolom `short_code` |

---

## 🔍 Potensi Masalah

### 1. Route Conflict dengan Route yang Sudah Ada

**Masalah:** Short code bentrok dengan route seperti `/dashboard`, `/login`

**Solusi:**
```typescript
// Reserved words yang harus di-avoid
RESERVED_SHORT_CODES = [
  ...RESERVED_SLUGS,  // Reuse dari custom_slug
  'u',                // Untuk user pages (/u/[slug])
  // Future routes
  's', 'l', 'go', 'to', 'link', 'links'
]
```

### 2. Prioritas Routing

**Masalah:** Bagaimana membedakan short code dari route yang ada?

**Solusi:**
```
Priority:
1. Cek short_code di database
2. Kalau ada → redirect
3. Kalau tidak ada → fallback ke Next.js routing
```

**Implementasi:** Route `/[code]/page.tsx` yang cek database dulu

### 3. Case Sensitivity

**Pertanyaan:** Apakah `Google` dan `google` short code yang sama?

**Keputusan:** Case-insensitive (semua lowercase)
```typescript
// Simpan sebagai lowercase di DB
const shortCode = customInput.toLowerCase()
```

### 4. Edit Short Code

**Pertanyaan:** Apakah user bisa edit short code setelah link dibuat?

**Keputusan:** Ya, editable dengan validasi duplikasi

---

## 📐 Database Schema Changes

### Tabel `links`
```sql
-- Tambah kolom short_code
ALTER TABLE links ADD COLUMN short_code TEXT UNIQUE;

-- Index untuk performance
CREATE INDEX idx_links_short_code 
ON links(short_code) WHERE short_code IS NOT NULL;

-- Untuk SQLite - perlu migration script
-- Untuk Supabase - perlu migration SQL
```

### Constraint
- `short_code` harus UNIQUE di seluruh tabel (bukan per user)
- Bisa NULL untuk link yang tidak punya short code

---

## 🎨 UI/UX Changes

### 1. Link Form Dialog
```
┌────────────────────────────────────────────────────┐
│  Add/Edit Link                                     │
├────────────────────────────────────────────────────┤
│  Title:        [Google                          ] │
│  URL:          [https://google.com              ] │
│  Category:     [Search Engines ▼]                │
│                                                    │
│  Short Code:   [abc123        ]  [🔄 Auto-gen]  │ ← NEW
│                domain.com/abc123                  │
│                ❌ Short code sudah digunakan      │ ← Validation error
│                                                    │
│  ☐ Public  ☑ Active                               │
│                                                    │
│           [Cancel]  [Save Link]                   │
└────────────────────────────────────────────────────┘
```

### 2. Links Table
```
┌────────────────────────────────────────────────────┐
│  🌐 Google                          [Copy Short]   │ ← NEW
│  domain.com/google                    [Copy QR]   │
│  Clicks: 42  |  Edit  |  Delete                   │
└────────────────────────────────────────────────────┘
```

---

## 🔐 Validasi

### Short Code Rules
```typescript
shortCodeSchema = z.string()
  .min(3, 'Minimal 3 karakter')
  .max(30, 'Maksimal 30 karakter')
  .regex(/^[a-z0-9-]+$/, 'Hanya huruf kecil, angka, dan -')
  .regex(/^[a-z0-9]/, 'Harus diawali huruf/angka')
  .regex(/[a-z0-9]$/, 'Harus diakhiri huruf/angka')
  .refine(code => !RESERVED_SHORT_CODES.includes(code))
  .refine(async (code) => {
    // Cek duplikasi di database
    const exists = await db.isShortCodeExists(code)
    return !exists
  }, 'Short code sudah digunakan')
```

### Reserved Words
```typescript
// lib/validation.ts
export const RESERVED_SHORT_CODES = [
  // App routes
  'login', 'register', 'dashboard', 'admin', 'api',
  'auth', 'user', 'users', 'settings', 'categories', 'links',
  'track-click', 'public', 'profile', 'help', 'about',
  
  // Existing patterns
  'u',  // User pages (/u/[slug])
  's', 'l', 'go', 'to',  // Common shortener prefixes
  
  // Future-proof
  'www', 'mail', 'ftp', 'static', 'assets', 'docs'
]
```

---

## 📁 Files to Modify

### Backend (6 files)
1. **lib/validation.ts**
   - Tambah `shortCodeSchema`
   - Tambah `RESERVED_SHORT_CODES`

2. **lib/db-types.ts**
   - Update interface untuk `short_code`

3. **lib/db-sqlite.ts**
   - Update schema initialization
   - Tambah `isShortCodeExists()`
   - Update CRUD operations

4. **lib/db-supabase.ts**
   - Update untuk Supabase

5. **app/api/links/route.ts**
   - Handle short code generation
   - Validate short code

6. **app/[code]/page.tsx** (NEW)
   - Redirect handler untuk short links

### Frontend (2 files)
7. **components/user/link-form-dialog.tsx**
   - Tambah input short code
   - Tombol auto-generate
   - Validation feedback

8. **components/user/links-table.tsx**
   - Display short link
   - Copy button

### Migration Scripts (2 files)
9. **scripts/migrate-sqlite-shortener.js** (NEW)
   - Migration script untuk SQLite

10. **supabase/migrations/YYYYMMDD_add_short_code.sql** (NEW)
    - Migration script untuk Supabase

---

## ✅ Checklist Implementasi

### Phase 1: Database & Backend
- [ ] Update `lib/validation.ts` dengan schema dan reserved words
- [ ] Update `lib/db-types.ts` interface
- [ ] Implementasi di `lib/db-sqlite.ts`:
  - [ ] Schema update
  - [ ] `isShortCodeExists()` function
  - [ ] `generateShortCode()` function
  - [ ] Update CRUD operations
- [ ] Implementasi di `lib/db-supabase.ts`
- [ ] Update `app/api/links/route.ts`
- [ ] Create `app/[code]/page.tsx` redirect handler

### Phase 2: Frontend
- [ ] Update `components/user/link-form-dialog.tsx`:
  - [ ] Short code input field
  - [ ] Auto-generate button
  - [ ] Real-time validation
- [ ] Update `components/user/links-table.tsx`:
  - [ ] Display short link
  - [ ] Copy button with toast notification

### Phase 3: Migration
- [ ] Create SQLite migration script
- [ ] Create Supabase migration file
- [ ] Test migration on development

### Phase 4: Testing
- [ ] Test auto-generate short code
- [ ] Test custom short code
- [ ] Test reserved words validation
- [ ] Test duplicate detection
- [ ] Test short link redirect
- [ ] Test edit short code
- [ ] Test copy button

---

## 🚀 Rekomendasi

### 1. Implementasi Phased
Mulai dari backend dulu, pastikan database dan API work sebelum touch frontend.

### 2. Feature Flag
Pertimbangkan feature flag untuk enable/disable fitur ini:
```typescript
const FEATURE_SHORTENER_ENABLED = process.env.FEATURE_SHORTENER_ENABLED !== 'false'
```

### 3. Analytics
Track short code usage untuk insight:
- Berapa banyak yang auto vs custom?
- Short code paling populer?
- Error rate validation?

### 4. Documentation
Update README dan CLAUDE.md dengan dokumentasi fitur baru.

---

## 📝 Catatan Penting

1. **Backward Compatible** - Link yang sudah ada tidak akan terpengaruh, short code bersifat optional
2. **Performance** - Index pada `short_code` critical untuk query performance
3. **Security** - Pastikan short code tidak bisa dipakai untuk phishing (validasi URL asli tetap apply)
4. **SEO** - Short links redirect dengan HTTP 301 atau 302?

---

## ✅ Keputusan Desain

Pertanyaan terbuka telah dijawab:

| Pertanyaan | Keputusan | Alasan |
|------------|-----------|--------|
| **HTTP Status Code** | **302 (Temporary)** | Short code adalah alias, bukan pengganti permanen. Lebih aman untuk SEO dan fleksibilitas. |
| **Remove Short Code** | **Tidak bisa** | Short code sekali dibuat tidak bisa dihapus (set ke NULL). Hanya bisa di-edit ke code lain. |
| **Bulk Generate** | **Tidak perlu** | Short code hanya auto-generate untuk link BARU. Link lama tetap tanpa short code kecuali di-edit satu-satu. |
| **Export/Import** | **Termasuk** | Short code di-export dan di-import bersama link untuk backup lengkap. |

---

## 🎯 Implementasi Notes

Berdasarkan keputusan di atas:

### 1. HTTP Redirect (302)
```typescript
// app/[code]/page.tsx
return NextResponse.redirect(link.url, 302)
```

### 2. Short Code Nullable
```sql
-- Field bisa NULL untuk link tanpa short code
short_code TEXT UNIQUE NULL
```
```typescript
// Tapi tidak bisa di-update ke NULL setelah punya nilai
if (link.short_code && data.short_code === null) {
  throw new Error('Tidak bisa menghapus short code')
}
```

### 3. Auto-Generate Only for New Links
```typescript
// Hanya generate short code untuk link baru
const newLink = await db.createLink({
  ...
  short_code: await generateShortCode() // Only on create
})
```

### 4. Export/Import Include Short Code
```typescript
// Export format
{
  title: "Google",
  url: "https://google.com",
  short_code: "google",  // ← Included
  ...
}
```

---

**Next Step:** Lanjut ke **writing-plans** skill untuk buat implementation plan detail.
