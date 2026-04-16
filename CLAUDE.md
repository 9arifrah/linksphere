# CLAUDE.md

File ini memberikan panduan untuk bekerja dengan kode dalam repository ini.

## Project Overview

**LinkSphere** adalah platform manajemen link profesional yang dibangun dengan Next.js 15 (App Router) yang memungkinkan pengguna untuk mengatur, membagikan, dan menampilkan link penting dengan halaman publik yang dapat dikustomisasi.

**Tech Stack:**
- **Framework**: Next.js 15.1.6, React 18.3.1, TypeScript 5.7.3
- **Database**: Dual support - SQLite (better-sqlite3) untuk development, Supabase untuk production
- **UI**: shadcn/ui components (Radix UI + Tailwind CSS), 50+ komponen
- **Auth**: Custom JWT dengan jose (HS256), bcryptjs (10 salt rounds)
- **Forms**: react-hook-form + Zod validation
- **Charts**: recharts
- **QR Code**: qrcode, react-qr-code

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Run URL shortener migration (SQLite)
npm run migrate:shortener

# Run QR code migration (SQLite)
npm run migrate:sqlite
```

**Note:** TypeScript errors diabaikan saat build (`typescript.ignoreBuildErrors: true` di next.config.mjs).

---

## Architecture Overview

### Authentication System

**Implementasi Custom (Bukan Supabase Auth):**
- Cookie-based session management dengan `user_session` dan `admin_session` cookies
- Passwords dihash dengan bcryptjs (10 salt rounds)
- Sessions disimpan sebagai httpOnly cookies dengan 7-day expiry
- Admin authentication terpisah melalui tabel `admin_users`

**JWT Session Pattern:**
```typescript
// lib/auth.ts - Create session
async function createSessionToken(userId: string, isAdmin: boolean = false) {
  return await new SignJWT({ userId, isAdmin, type: isAdmin ? 'admin' : 'user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

// API routes extract session
async function getUserSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('user_session')?.value
  const payload = await verifyJWT(token)
  return payload?.userId || null
}
```

**Key Files:**
- `lib/auth.ts` - JWT session management
- `app/api/auth/login/route.ts` - User login
- `app/api/auth/register/route.ts` - Registration (creates user + user_settings)
- `app/api/auth/logout/route.ts` - Clear session
- `app/api/admin/login/route.ts` - Admin login

---

### Database Layer

**Dual Database Support:**

Aplikasi menggunakan abstraction layer yang memungkinkan switching antara SQLite dan Supabase via environment variable `DB_TYPE`.

```
lib/
├── db.ts              # Entry point - switches via DB_TYPE
├── db-types.ts        # DatabaseClient interface (18+ methods)
├── db-sqlite.ts       # SQLite implementation (better-sqlite3)
└── db-supabase.ts     # Supabase implementation
```

**Environment Variable:**
```bash
DB_TYPE=sqlite  # atau 'supabase' untuk production
```

**DatabaseClient Interface Methods:**

| Method | Purpose |
|--------|---------|
| `getUserByEmail(email)` | Cari user by email |
| `getUserById(id)` | Cari user by ID |
| `getUserBySlug(slug)` | Cari user by custom_slug |
| `createUser(user)` | Buat user baru |
| `getUserSettings(userId)` | Ambil user settings |
| `getLinks(userId?)` | List links (optional filter by user) |
| `getLinkByShortCode(code)` | Cari link by short code |
| `createLink(link)` | Buat link baru |
| `incrementClickCount(id)` | Increment click count |
| `getCategories(userId?)` | List categories |
| `isAdminUser(userId)` | Check apakah user adalah admin |
| `getPlatformStats()` | Ambil platform-wide statistics |

---

### Database Schema

**Tabel `users`:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| email | TEXT | Unique, required |
| password_hash | TEXT | bcrypt hashed |
| custom_slug | TEXT | Unique URL slug (nullable) |
| display_name | TEXT | User's display name |
| created_at | DATETIME | Registration timestamp |

**Tabel `user_settings`:**
| Column | Type | Default |
|--------|------|---------|
| user_id | TEXT (FK) | References users.id |
| theme_color | TEXT | '#2563eb' |
| logo_url | TEXT | null |
| page_title | TEXT | null |
| profile_description | TEXT | null |
| show_categories | INTEGER | 1 (true) |

**Tabel `links`:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| title | TEXT | Link title |
| url | TEXT | Target URL |
| description | TEXT | Optional description |
| category_id | TEXT (FK) | References categories.id |
| is_public | INTEGER | Visibility flag (1/0) |
| is_active | INTEGER | Active flag (1/0) |
| click_count | INTEGER | Click tracking (default 0) |
| qr_code | TEXT | Base64 QR code (nullable) |
| short_code | TEXT | Unique short code (nullable) |
| user_id | TEXT (FK) | References users.id |

**Tabel `categories`:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (UUID) | Primary key |
| name | TEXT | Category name |
| icon | TEXT | Emoji/icon string |
| sort_order | INTEGER | Display order |
| user_id | TEXT (FK) | References users.id (null = global) |

**Tabel `admin_users`:**
| Column | Type | Description |
|--------|------|-------------|
| user_id | TEXT (FK, PK) | References users.id |

---

### Component Architecture

**Organization:**
```
components/
├── ui/                    # 50+ shadcn/ui primitives
│   ├── button.tsx, card.tsx, dialog.tsx, input.tsx
│   ├── chart.tsx, command-palette.tsx, breadcrumb-nav.tsx
│   └── ... (50+ more)
├── auth/                  # Authentication forms
│   ├── login-form.tsx
│   └── register-form.tsx
├── user/                  # User dashboard components
│   ├── dashboard-layout.tsx
│   ├── dashboard-header.tsx
│   ├── dashboard-sidebar.tsx
│   ├── links-table.tsx
│   ├── links-table-skeleton.tsx
│   ├── link-form-dialog.tsx
│   ├── categories-table.tsx
│   ├── category-form-dialog.tsx
│   ├── settings-form.tsx
│   ├── stats-cards.tsx
│   ├── stats-skeleton.tsx
│   ├── auto-refresh-stats.tsx
│   └── public-page-header.tsx
├── admin/                 # Admin dashboard components
│   ├── dashboard-layout.tsx
│   ├── admin-header.tsx
│   ├── admin-sidebar.tsx
│   ├── login-form.tsx
│   ├── users-table.tsx
│   ├── user-form-dialog.tsx
│   ├── links-table.tsx
│   ├── link-form-dialog.tsx
│   ├── admin-categories-client.tsx
│   ├── stats-cards.tsx
│   ├── growth-chart.tsx
│   └── delete-confirm-dialog.tsx
├── shared/                # Shared domain components
│   ├── icon-picker.tsx
│   └── qr-code-modal.tsx
├── link-card.tsx          # Click-tracking link card
├── search-bar.tsx         # Search functionality
├── structured-data-script.tsx
└── theme-provider.tsx
```

**Patterns:**
- Based on shadcn/ui (Radix UI + Tailwind CSS)
- `forwardRef` pattern untuk ref forwarding
- `class-variance-authority` untuk variant management
- Compound component pattern (Card, CardHeader, CardContent, etc.)
- All interactive components use `'use client'` directive
- Styling via `cn()` utility (clsx + tailwind-merge)
- Props down, events up (no global state management)
- Direct fetch calls ke API routes

---

### Routing Structure

**Public Pages:**
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/login` | User login |
| `/register` | User registration |
| `/[slug]` | **MERGED route:** Short code redirect OR Public profile |

**User Dashboard (Protected):**
| Route | Purpose |
|-------|---------|
| `/dashboard` | Main dashboard dengan statistik |
| `/dashboard/links` | Manajemen link |
| `/dashboard/categories` | Manajemen kategori |
| `/dashboard/settings` | Kustomisasi profil |

**Admin Panel (Protected):**
| Route | Purpose |
|-------|---------|
| `/admin/login` | Admin login |
| `/admin/dashboard` | Platform statistics |
| `/admin/users` | User management |
| `/admin/categories` | Global categories |
| `/admin/settings` | Admin settings |
| `/admin/stats` | Analytics |

**Protection Pattern:**
```typescript
async function checkAuth() {
  const session = await getUserSession()
  if (!session) redirect('/login')
  return session.userId
}
```

---

## API Routes

### Authentication

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/login` | User login | `{ email: string, password: string }` | `{ user: User }` + session cookie |
| POST | `/api/auth/register` | User registration | `{ email, password, display_name?, custom_slug? }` | `{ user: User }` + session cookie |
| POST | `/api/auth/logout` | Clear session | - | `{ success: true }` |

### Admin Auth

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/admin/login` | Admin login | `{ email: string, password: string }` | `{ user: User }` + admin_session cookie |
| POST | `/api/admin/logout` | Clear admin session | - | `{ success: true }` |

### User

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/user/settings` | Get user settings | - | `UserSettings` |
| PATCH | `/api/user/settings` | Update settings | `{ theme_color?, logo_url?, page_title?, profile_description?, show_categories? }` | `UserSettings` |
| GET | `/api/user/stats` | Get user statistics | - | `{ totalLinks, totalClicks, publicLinks, activeLinks }` |
| GET | `/api/user/profile` | Get user profile | - | `{ id, email, display_name, custom_slug, created_at }` |
| PATCH | `/api/user/profile` | Update profile | `{ display_name?, custom_slug? }` | `{ user: User }` |

### Links

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/links` | List user's links | Query: `?category_id=xxx&search=xxx` | `Link[]` |
| POST | `/api/links` | Create link | `{ title, url, description?, category_id?, is_public?, is_active?, short_code? }` | `Link` |
| GET | `/api/links/[id]` | Get link by ID | - | `Link` |
| PATCH | `/api/links/[id]` | Update link | `{ title?, url?, description?, category_id?, is_public?, is_active?, short_code? }` | `Link` |
| DELETE | `/api/links/[id]` | Delete link | - | `{ success: true }` |
| POST | `/api/links/generate-short-code` | Generate random short code | `{ length?: number }` | `{ shortCode: string }` |
| GET | `/api/links/check-short-code` | Check short code availability | Query: `?code=xxx&exclude=yyy` | `{ available: boolean }` |

### Categories

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/categories` | List user's categories | - | `Category[]` |
| POST | `/api/categories` | Create category | `{ name, icon?, sort_order? }` | `Category` |
| GET | `/api/categories/[id]` | Get category | - | `Category` |
| PATCH | `/api/categories/[id]` | Update category | `{ name?, icon?, sort_order? }` | `Category` |
| DELETE | `/api/categories/[id]` | Delete category | - | `{ success: true }` |

### Admin

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/admin/users` | List all users | Query: `?search=xxx` | `User[]` dengan admin status |
| POST | `/api/admin/users` | Create user as admin | `{ email, password, display_name?, is_admin?, settings? }` | `User` |
| GET | `/api/admin/users/[id]` | Get user detail | - | `User` dengan stats |
| PATCH | `/api/admin/users/[id]` | Update user as admin | `{ display_name?, custom_slug?, is_admin?, settings? }` | `User` |
| DELETE | `/api/admin/users/[id]` | Delete user | - | `{ success: true }` |
| GET | `/api/admin/links` | List all platform links | - | `Link[]` |
| POST | `/api/admin/links` | Create link as admin | `{ user_id, title, url, ... }` | `Link` |
| GET | `/api/admin/categories` | List all categories | - | `Category[]` (global + user-specific) |
| POST | `/api/admin/categories` | Create global category | `{ name, icon?, sort_order? }` | `Category` (tanpa user_id) |

### Utilities

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/track-click` | Increment link click count | `{ linkId: string }` | `{ success: true }` |

---

## Important Patterns & Conventions

### Path Aliases
- `@/*` maps ke project root
- Gunakan absolute imports: `import { Button } from '@/components/ui/button'`

### Styling
- Gunakan `cn()` utility untuk conditional classes
- Mobile-first responsive design dengan Tailwind breakpoints
- Theme color customization via `user_settings.theme_color`
- Design system di `lib/design-system.ts`

### Public Profile Pages
- Custom URL via `custom_slug` field (e.g., `/johndoe`)
- **TIDAK ADA `/u/` PREFIX** - langsung `/{custom_slug}`
- ISR dengan 60-second revalidation
- Customizable: theme_color, logo_url, page_title, profile_description, show_categories
- Search functionality untuk filtering links

### URL Shortener Routing
Route `/[slug]/page.tsx` menangani **DUA** kasus:

1. **Short Code (Priority 1):**
   ```typescript
   const link = await db.getLinkByShortCode(slug)
   if (link) {
     await db.incrementClickCount(link.id)
     redirect(link.url, 302) // Temporary redirect
   }
   ```

2. **User Profile (Priority 2):**
   ```typescript
   const user = await db.getUserBySlug(slug)
   if (user) {
     // Render public profile page
   }
   // else notFound()
   ```

### Click Tracking
- LinkCard component menggunakan `POST /api/track-click` sebelum membuka URL
- atau redirect dari `/[slug]` langsung increment count

### Error Handling
- Consistent error logging dengan prefix `[v0]`
- Indonesian language untuk user-facing error messages
- Standard HTTP status codes: 400, 401, 403, 404, 409, 500

### Rate Limiting
- In-memory rate limiter (dapat diganti Redis untuk production)
- Login: 5 attempts per minute per IP
- Register: 10 attempts per hour per IP

---

## URL Shortener

Fitur URL shortener memungkinkan setiap link memiliki short code untuk share link individual dengan format `domain.com/[shortCode]`.

**Pendekatan:** Hybrid (Auto-generate + Custom Editable)

### Validasi

Short code mengikuti pola validasi yang sama dengan `custom_slug`:
- **Reserved words:** lihat `RESERVED_SHORT_CODES` di `lib/validation.ts`
- **Case-insensitive:** disimpan sebagai lowercase
- **Minimal:** 3 karakter
- **Maksimal:** 30 karakter
- **Karakter:** Hanya huruf kecil (a-z), angka (0-9), dan tanda hubung (-)
- **Boundary:** Harus diawali dan diakhiri dengan huruf atau angka

### Database

- **Kolom:** `links.short_code` (TEXT, UNIQUE, nullable)
- **Index:** `idx_links_short_code`
- **Auto-generate:** Saat create link (6 karakter random alphanumeric)
- **Constraint:** Tidak bisa menghapus short code setelah dibuat (hanya bisa edit)

### API Endpoints

- `POST /api/links/generate-short-code` - Generate short code random
- `GET /api/links/check-short-code?code=xxx&exclude=yyy` - Cek ketersediaan short code

### Redirect Flow

1. User mengunjungi `/{shortCode}`
2. `app/[slug]/page.tsx` cek apakah slug adalah short code
3. Jika ya: increment click count, redirect ke URL tujuan (HTTP 302)
4. Jika tidak: cek apakah slug adalah custom_slug user
5. Jika ya: render public profile
6. Jika tidak: 404

### Frontend

- **Link Form Dialog:** Input field short code, tombol auto-generate, validasi real-time
- **Links Table:** Display short link dengan tombol copy

---

## Testing & Verification

### Test Authentication Flow
1. Register new user di `/register`
2. Verifikasi `user_settings` dibuat otomatis
3. Login di `/login` (seharusnya set cookie)
4. Akses `/dashboard` (seharusnya berhasil)
5. Logout (cookie seharusnya terhapus)
6. Coba akses `/dashboard` (seharusnya redirect ke login)

### Test Public Profile
1. Create user dengan custom_slug
2. Tambahkan public links
3. Kunjungi `/{custom_slug}` (bukan `/u/{slug}` - sudah tidak ada)
4. Test search functionality
5. Klik link (seharusnya increment click_count)

### Test Admin
1. Pastikan user ada di tabel `admin_users`
2. Login di `/admin/login`
3. Akses `/admin/dashboard` (seharusnya tampil platform stats)
4. Test user/link/category management

### Test URL Shortener
1. Create new link - verifikasi short code auto-generated (6 karakter)
2. Edit short code ke custom value
3. Test validation dengan reserved words (seharusnya gagal)
4. Test validation dengan short code yang sudah ada (seharusnya gagal)
5. Kunjungi `/{shortCode}` - seharusnya redirect ke target URL
6. Verifikasi click_count bertambah setelah redirect
7. Test copy button di short link di links table

---

## Key Files Reference

### Configuration
- `next.config.mjs` - Next.js config (TS errors ignored, security headers)
- `tsconfig.json` - TypeScript config (strict mode, path aliases @/*)
- `tailwind.config.ts` - Tailwind theme configuration
- `.env` - Environment variables

### Core Infrastructure
- `lib/db.ts` - Database abstraction entry point
- `lib/db-types.ts` - DatabaseClient interface
- `lib/db-sqlite.ts` - SQLite implementation (854 lines)
- `lib/db-supabase.ts` - Supabase implementation
- `lib/supabase.ts` - Supabase client + TypeScript types
- `lib/auth.ts` - JWT session management
- `lib/admin-auth.ts` - Admin verification helpers
- `lib/validation.ts` - Zod schemas, reserved words
- `lib/utils.ts` - `cn()` utility
- `lib/seo.ts` - SEO metadata utilities
- `lib/qr-code.ts` - QR code generation
- `lib/rate-limit.ts` - Rate limiting
- `lib/password-strength.ts` - Password strength calculator
- `lib/design-system.ts` - Design tokens
- `lib/animations.ts` - Animation utilities
- `lib/accessibility.ts` - A11y helpers

### Authentication
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/admin/login/route.ts`

### Dashboard Layouts
- `components/user/dashboard-layout.tsx`
- `components/admin/dashboard-layout.tsx`

### Public Profile
- `app/[slug]/page.tsx` - **MERGED route:** Public profile + short code redirect
- `components/user/public-page-header.tsx`
- `components/link-card.tsx`
- `components/search-bar.tsx`

### URL Shortener
- `lib/validation.ts` - Short code validation
- `app/api/links/generate-short-code/route.ts`
- `app/api/links/check-short-code/route.ts`
- `scripts/migrate-sqlite-shortener.js` - SQLite migration
- `supabase/migrations/20260409_add_short_code.sql` - Supabase migration

### QR Code
- `lib/qr-code.ts` - QR code generation utilities
- `scripts/migrate-sqlite-qr-code.js` - SQLite migration
- `supabase/migrations/20260403000001_add_qr_code_column.sql` - Supabase migration

---

## Environment Variables

Buat file `.env` dengan variable berikut:

```bash
# Database Configuration
DB_TYPE=sqlite              # 'sqlite' atau 'supabase'

# Supabase (jika DB_TYPE=supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# JWT Secret (generate random string)
JWT_SECRET=your_random_secret_key_here

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Redis untuk rate limiting production
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

NODE_ENV=development
```

---

## Security Notes

### ✅ Implemented:
- Password hashing dengan bcrypt (10 rounds)
- httpOnly session cookies
- Secure cookies in production (`Secure` flag)
- SameSite 'lax' CSRF protection
- Minimum password length: 8 karakter
- Password complexity validation (uppercase, lowercase, number, special char)
- Ownership verification sebelum resource mutations
- Reserved words validation untuk slugs dan short codes
- Rate limiting pada auth endpoints

### ⚠️ Important:
- **JANGAN** menyimpan plain text passwords
- Selalu verifikasi userId match dengan resource owner sebelum mutations
- Gunakan `bcrypt.compare()` untuk password verification, jangan direct comparison
- JWT secret harus strong dan disimpan dengan aman

---

## Migration Notes

### Password Security Migration (February 2026):
- Aplikasi bermigrasi dari plain text passwords ke bcrypt hashing
- User yang sudah ada memerlukan password reset
- Registrasi baru otomatis menggunakan bcrypt

### Database Migrations:

**SQLite:**
```bash
# QR Code column
npm run migrate:sqlite

# Short code column
npm run migrate:shortener
```

**Supabase:**
Apply migration files di `supabase/migrations/`:
- `20260403000001_add_qr_code_column.sql`
- `20260409_add_short_code.sql`

### Generate Password Hash:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123!', 10).then(h => console.log(h))"
```