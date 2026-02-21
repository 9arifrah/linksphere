import { z } from 'zod'

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
  category_id: z.string().uuid('ID kategori tidak valid').optional(),
  is_public: z.boolean().default(false)
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
  logo_url: urlSchema.optional().nullable(),
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
