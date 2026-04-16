# LinkSphere

Platform manajemen tautan profesional yang memungkinkan pengguna mengatur, membagikan, dan menampilkan tautan penting dengan halaman publik yang dapat dikustomisasi.

## 🚀 Fitur Utama

### Untuk Pengguna:
- 🔐 **Autentikasi Aman** - Sistem login/registrasi dengan password hashing (bcrypt)
- 📊 **Dashboard Personal** - Statistik penggunaan tautan dan kategori
- 🔗 **Manajemen Tautan** - Tambah, edit, hapus tautan dengan pelacakan klik
- 🔗 **URL Shortener** - Setiap link memiliki short code untuk share individual (domain.com/[code])
- 📁 **Organisasi Kategori** - Kelompokkan tautan berdasarkan kategori dengan ikon kustom
- 🎨 **Kustomisasi Profil** - Atur warna tema, logo, judul halaman
- 🌐 **Halaman Publik** - Bagikan tautan melalui URL kustom (`/u/[slug]`)
- 🔍 **Pencarian** - Temukan tautan dengan cepat di halaman publik

### Untuk Admin:
- 📈 **Dashboard Admin** - Statistik platform secara keseluruhan
- 👥 **Manajemen Pengguna** - Kelola akun pengguna
- 🔗 **Manajemen Tautan Global** - Monitor semua tautan di platform
- 📁 **Kategori Global** - Kelola kategori di seluruh platform
- 📊 **Analitik** - Grafik pertumbuhan dan statistik detail

## 🛠️ Tech Stack

- **Frontend:** Next.js 15.1.6, React 18.3.1
- **Backend:** SQLite (Development) / Supabase (Production)
- **UI:** shadcn/ui (Radix UI + Tailwind CSS)
- **Autentikasi:** Custom JWT dengan bcryptjs
- **Bahasa:** TypeScript 5.7.3

> **💡 Mode Development Lokal:** Project ini sekarang support SQLite untuk development lokal tanpa perlu setup Supabase. Lihat [SETUP_LOCAL_DEV.md](SETUP_LOCAL_DEV.md) untuk panduan lengkap.

## 📦 Instalasi

### Quick Start (Development Lokal dengan SQLite)

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Setup environment variables untuk SQLite
cp .env.example .env.local
# Edit .env.local dan pastikan DB_TYPE=sqlite

# Jalankan development server
npm run dev
```

Database SQLite akan otomatis dibuat di `data/linksphere.db`. Tidak perlu setup Supabase untuk development!

### Production (dengan Supabase)

```bash
# Setup environment variables untuk Supabase
cp .env.example .env.local
# Edit .env.local:
# - Set DB_TYPE=supabase
# - Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY

# Install dependencies
npm install

# Build untuk production
npm run build

# Start production server
npm start
```

📖 **Panduan Lengkap:** Lihat [SETUP_LOCAL_DEV.md](SETUP_LOCAL_DEV.md) untuk panduan setup development lokal dengan SQLite.

## 🔧 Environment Variables

### Untuk Development Lokal (SQLite):

```env
# Database Type
DB_TYPE=sqlite

# Supabase (tidak diperlukan untuk SQLite)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# JWT Secret (tetap diperlukan)
JWT_SECRET=development-secret-change-in-production-minimum-32-chars

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### Untuk Production (Supabase):

```env
# Database Type
DB_TYPE=supabase

# Supabase (WAJIB diisi untuk production)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Secret
JWT_SECRET=your-strong-production-secret-minimum-32-characters

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

## 🗄️ Database

Project ini mendukung dua jenis database:

### Development: SQLite
- File-based database, otomatis dibuat di `data/linksphere.db`
- Tidak perlu setup database server
- Data persisten antar restart
- Mudah di-reset (hapus file database)

### Production: Supabase
- Cloud PostgreSQL database
- Scalable dan reliable
- Mudah migrasi dari SQLite

### Struktur Tabel (sama untuk SQLite dan Supabase):

- **users** - Data pengguna
- **user_settings** - Pengaturan profil
- **links** - Tautan dengan pelacakan klik
- **categories** - Kategori tautan
- **admin_users** - Autorisasi admin

### Skema Database

#### users
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
email VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
custom_slug VARCHAR(50) UNIQUE
display_name VARCHAR(100)
created_at TIMESTAMP DEFAULT NOW()
```

#### user_settings
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES users(id) ON DELETE CASCADE
theme_color VARCHAR(7) DEFAULT '#3b82f6'
logo_url TEXT
page_title VARCHAR(100)
show_categories BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT NOW()
```

#### links
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES users(id) ON DELETE CASCADE
title VARCHAR(200) NOT NULL
url TEXT NOT NULL
description TEXT
category_id UUID REFERENCES categories(id) ON DELETE SET NULL
is_public BOOLEAN DEFAULT false
click_count INTEGER DEFAULT 0
short_code TEXT UNIQUE
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

#### categories
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
name VARCHAR(100) NOT NULL
icon VARCHAR(50)
sort_order INTEGER DEFAULT 0
user_id UUID REFERENCES users(id) ON DELETE CASCADE
created_at TIMESTAMP DEFAULT NOW()
```

#### admin_users
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE
created_at TIMESTAMP DEFAULT NOW()
UNIQUE(user_id)
```

## 🔗 URL Shortener

Fitur URL shortener memungkinkan setiap link memiliki short code untuk share link individual.

**Fitur:**
- ✅ Auto-generate short code (6 karakter random) saat create link
- ✅ Custom short code yang bisa di-edit
- ✅ Validasi real-time untuk ketersediaan short code
- ✅ Redirect otomatis ke URL target
- ✅ Auto-increment click count sebelum redirect
- ✅ Copy button untuk mudah share short link

**Validasi Short Code:**
- Case-insensitive (disimpan sebagai lowercase)
- Minimal 3 karakter, maksimal 30 karakter
- Hanya huruf kecil, angka, dan tanda hubung (-)
- Harus diawali dan diakhiri dengan huruf atau angka
- Tidak boleh menggunakan reserved words (admin, api, login, dll.)

**API Endpoints:**
- `POST /api/links/generate-short-code` - Generate short code random
- `GET /api/links/check-short-code?code=xxx&exclude=yyy` - Cek ketersediaan short code

**Cara Menggunakan:**
1. Create new link - short code otomatis di-generate
2. Edit short code sesuai keinginan (opsional)
3. Copy short link dan bagikan
4. Short link format: `domain.com/[shortCode]`

**Migration:**
```bash
# SQLite
npm run migrate:shortener

# Supabase
# Apply supabase/migrations/20260409_add_short_code.sql
```

## 📝 Perintah Development

```bash
npm run dev      # Start development server
npm run build    # Build untuk production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌐 Halaman Utama

### Halaman Publik:
- `/` - Landing page
- `/login` - Login pengguna
- `/register` - Registrasi pengguna baru
- `/u/[slug]` - Halaman profil publik (ISR dengan 60s revalidation)

### Dashboard Pengguna (Protected):
- `/dashboard` - Dashboard pengguna dengan statistik
- `/dashboard/links` - Manajemen tautan
- `/dashboard/categories` - Manajemen kategori
- `/dashboard/settings` - Pengaturan profil

### Panel Admin (Protected):
- `/admin/login` - Login admin
- `/admin/dashboard` - Dashboard admin dengan statistik platform
- `/admin/users` - Manajemen pengguna
- `/admin/links` - Manajemen tautan global
- `/admin/categories` - Manajemen kategori global
- `/admin/stats` - Analitik dan grafik
- `/admin/settings` - Pengaturan admin

## 🔐 Keamanan

### Yang Sudah Diimplementasikan:
- ✅ Password hashing dengan bcryptjs (10 salt rounds)
- ✅ httpOnly session cookies
- ✅ Secure cookies di production
- ✅ SameSite 'lax' CSRF protection
- ✅ Minimum password length: 8 karakter
- ✅ Verifikasi kepemilikan resource sebelum mutasi

### Catatan Penting:
- Jangan simpan password dalam plain text
- Selalu verifikasi userId cocok dengan pemilik resource sebelum mutasi
- Gunakan bcrypt.compare() untuk verifikasi password, jangan pernah bandingkan langsung

## 🏗️ Arsitektur

### Autentikasi
**Implementasi Kustom (Bukan Supabase Auth):**
- Cookie-based session management menggunakan `user_session` dan `admin_session` cookies
- Password di-hash dengan bcryptjs (10 salt rounds)
- Sessions disimpan sebagai httpOnly cookies dengan expiry 7 hari
- Autentikasi admin terpisah via tabel `admin_users`

### API Routes
**Autentikasi Check:**
```typescript
const userId = await getUserSession()
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Ownership verification
if (resource.user_id !== userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**API Routes Utama:**
- `POST /api/links` - Create link
- `PATCH /api/links/[id]` - Update link (ownership verified)
- `DELETE /api/links/[id]` - Delete link (ownership verified)
- `POST /api/track-click` - Increment click count (uses RPC function)
- `PATCH /api/user/settings` - Update profile settings

### Komponen
**Organisasi:**
```
components/
├── ui/              # 50+ shadcn/ui primitives (Button, Card, Dialog, dll.)
├── auth/            # Authentication forms (login-form, register-form)
├── admin/           # Admin dashboard (12 components)
├── user/            # User dashboard (10 components)
├── link-card.tsx    # Shared domain component
└── search-bar.tsx   # Shared domain component
```

## 🧪 Testing

### Test Authentication Flow:
1. Register new user di `/register`
2. Verifikasi `user_settings` dibuat otomatis
3. Login di `/login` (harus set cookie)
4. Akses `/dashboard` (harus berhasil)
5. Logout (cookie harus clear)
6. Coba akses `/dashboard` (harus redirect ke login)

### Test Public Profile:
1. Create user dengan custom_slug
2. Add public links
3. Visit `/u/[slug]` (harus show links grouped by category)
4. Test search functionality
5. Click link (harus increment click_count)

### Test Admin:
1. Pastikan user exists di tabel `admin_users`
2. Login di `/admin/login`
3. Akses `/admin/dashboard` (harus show platform stats)
4. Test user/link/category management

### Test URL Shortener:
1. Login dan buat new link (short code otomatis di-generate)
2. Edit link dan ubah ke custom short code
3. Coba gunakan reserved words (harus error: "Short code ini sudah digunakan oleh sistem")
4. Coba gunakan short code yang sudah ada (harus error: "Short code sudah digunakan")
5. Akses short link via browser (harus redirect ke URL target)
6. Verifikasi click count bertambah setelah redirect
7. Test 404 untuk short code tidak valid

## 📄 Lisensi

MIT License

## 🤝 Kontribusi

Contributions, issues, and feature requests are welcome!

## 👤 Author

**Your Name** - [GitHub Profile](https://github.com/yourusername)
