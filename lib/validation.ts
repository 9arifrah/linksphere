import { z } from 'zod'

/**
 * Reserved slugs - cannot be used by users
 * These conflict with system routes
 */
export const RESERVED_SLUGS = [
  'dashboard', 'login', 'register', 'admin', 'api',
  'auth', 'user', 'users', 'settings', 'categories', 'links',
  'track-click', 'public', 'profile'
]

/**
 * Reserved short codes - cannot be used for URL shortener
 * These conflict with system routes
 */
export const RESERVED_SHORT_CODES = [
  ...RESERVED_SLUGS,  // Reuse existing slugs
  'u',  // User pages pattern
  's', 'l', 'go', 'to',  // Common shortener prefixes
  'www', 'mail', 'ftp', 'static', 'assets', 'docs'
]

/**
 * Strong password requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf kapital')
  .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung minimal 1 karakter khusus (@#$%^&*)')

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email('Format email tidak valid')
  .min(5, 'Email terlalu pendek')
  .max(254, 'Email terlalu panjang')

/**
 * URL validation (prevents javascript:, data:, etc.)
 */
export const urlSchema = z
  .string()
  .url('URL tidak valid')
  .refine(
    (url) => {
      try {
        const parsed = new URL(url)
        return ['http:', 'https:'].includes(parsed.protocol)
      } catch {
        return false
      }
    },
    'URL harus menggunakan HTTP atau HTTPS'
  )

/**
 * Custom slug validation
 */
export const slugSchema = z
  .string()
  .min(3, 'Slug minimal 3 karakter')
  .max(50, 'Slug maksimal 50 karakter')
  .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung')
  .regex(/^[a-z0-9]/, 'Slug harus diawali huruf atau angka')
  .regex(/[a-z0-9]$/, 'Slug harus diakhiri huruf atau angka')
  .refine((slug) => !RESERVED_SLUGS.includes(slug), 'Slug ini sudah digunakan oleh sistem')

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

/**
 * Registration form schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  customSlug: slugSchema.optional()
})

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password wajib diisi')
})

/**
 * Link creation/update schema
 */
export const linkSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200),
  url: urlSchema,
  description: z.string().max(500).optional(),
  category_id: z.preprocess((val) => (val === '' ? undefined : val), z.string().uuid('ID kategori tidak valid').optional()),
  is_public: z.boolean().default(false),
  is_active: z.boolean().default(true),
  short_code: z.preprocess((val) => (val === '' ? undefined : val), shortCodeSchema.optional().nullable())
})

/**
 * Category schema
 */
export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(100),
  icon: z.string().max(50).optional()
})

/**
 * User settings schema
 */
export const userSettingsSchema = z.object({
  theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Warna theme tidak valid').default('#2563eb'),
  logo_url: z.union([urlSchema, z.literal('')]).optional().nullable(),
  page_title: z.string().max(100).optional(),
  profile_description: z.string().max(500).optional(),
  show_categories: z.boolean().default(true)
})

/**
 * Password strength calculator (for UI feedback)
 * Returns 0-4 score
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  return Math.min(score, 4)
}

/**
 * Format Zod error to extract clean error message
 * This prevents stringified JSON errors from being shown to users
 */
export function formatZodError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.errors[0]?.message || 'Validasi gagal'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Terjadi kesalahan'
}