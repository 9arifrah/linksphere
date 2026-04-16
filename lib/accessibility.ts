/**
 * Accessibility utilities for WCAG AA compliance
 */

/**
 * ARIA label generators for common UI patterns
 */
export const ariaLabels = {
  // Navigation
  skipToContent: 'Langsung ke konten utama',
  mainNav: 'Navigasi utama',
  secondaryNav: 'Navigasi sekunder',
  mobileMenu: 'Menu mobile',
  toggleMenu: 'Buka/tutup menu',
  home: 'Beranda',

  // Actions
  close: 'Tutup',
  open: 'Buka',
  save: 'Simpan',
  cancel: 'Batal',
  edit: 'Edit',
  delete: 'Hapus',
  copy: 'Salin',
  share: 'Bagikan',
  search: 'Cari',
  filter: 'Filter',
  sort: 'Urutkan',
  refresh: 'Refresh',
  loading: 'Memuat',
  more: 'Lebih banyak',
  less: 'Lebih sedikit',

  // Form controls
  showPassword: 'Tampilkan password',
  hidePassword: 'Sembunyikan password',
  clearInput: 'Hapus input',
  selectOption: 'Pilih opsi',

  // Status
  success: 'Berhasil',
  error: 'Error',
  warning: 'Peringatan',
  info: 'Informasi',
  required: 'Wajib diisi',
  optional: 'Opsional',

  // Content
  linkOpensNewTab: 'Membuka tab baru',
  linkOpensExternal: 'Link eksternal',
  download: 'Unduh',
  image: 'Gambar',

  // Dashboard
  dashboard: 'Dashboard',
  links: 'Kelola Link',
  categories: 'Kategori',
  settings: 'Pengaturan',
  stats: 'Statistik',
  users: 'Pengguna',

  // Data
  totalLinks: 'Total link',
  publicLinks: 'Link publik',
  totalClicks: 'Total klik',
  totalCategories: 'Total kategori',
  trendUp: 'Trending naik',
  trendDown: 'Trending turun',
} as const

/**
 * Generate ARIA attributes for icon-only buttons
 */
export function getIconAriaProps(label: string, isPressed?: boolean) {
  return {
    role: 'button' as const,
    'aria-label': label,
    'aria-pressed': isPressed,
    tabIndex: 0,
  }
}

/**
 * Generate ARIA attributes for loading states
 */
export function getLoadingAriaProps(isLoading: boolean, label?: string) {
  return {
    'aria-busy': isLoading,
    'aria-live': 'polite' as const,
    'aria-label': isLoading ? label || 'Memuat...' : undefined,
  }
}

/**
 * Generate ARIA attributes for expandable content
 */
export function getExpandableAriaProps(isExpanded: boolean, label: string) {
  return {
    'aria-expanded': isExpanded,
    'aria-label': label,
  }
}

/**
 * Generate ARIA attributes for form inputs
 */
export function getInputAriaProps(
  id: string,
  isRequired: boolean,
  errorMessage?: string,
  description?: string
) {
  const props: Record<string, any> = {
    id,
    'aria-required': isRequired,
  }

  if (errorMessage) {
    props['aria-invalid'] = true
    props['aria-errormessage'] = `${id}-error`
  }

  if (description) {
    props['aria-describedby'] = `${id}-description`
  }

  return props
}

/**
 * Generate ARIA attributes for tab interfaces
 */
export function getTabAriaProps(
  panelId: string,
  isSelected: boolean,
  label: string
) {
  return {
    role: 'tab' as const,
    'aria-selected': isSelected,
    'aria-controls': panelId,
    'aria-label': label,
    tabIndex: isSelected ? 0 : -1,
  }
}

/**
 * Generate ARIA attributes for tab panels
 */
export function getTabPanelAriaProps(tabId: string) {
  return {
    role: 'tabpanel' as const,
    'aria-labelledby': tabId,
    tabIndex: 0,
  }
}

/**
 * Generate ARIA attributes for listbox/select dropdowns
 */
export function getListboxAriaProps(
  isOpen: boolean,
  label: string,
  activeDescendant?: string
) {
  return {
    role: 'listbox' as const,
    'aria-expanded': isOpen,
    'aria-label': label,
    'aria-activedescendant': activeDescendant,
  }
}

/**
 * Generate ARIA attributes for dialog modals
 */
export function getDialogAriaProps(
  label: string,
  describedBy?: string
) {
  return {
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-label': label,
    'aria-describedby': describedBy,
  }
}

/**
 * Generate ARIA attributes for toast notifications
 */
export function getToastAriaProps(role: 'status' | 'alert' | 'dialog', title: string) {
  return {
    role,
    'aria-live': role === 'alert' ? 'assertive' : 'polite',
    'aria-atomic': true,
    'aria-label': title,
  }
}

/**
 * Check if color contrast meets WCAG AA standards
 * @param foreground Hex color of foreground text
 * @param background Hex color of background
 * @param fontSize Font size in pixels (optional, defaults to 16)
 * @param isBold Whether text is bold (optional, defaults to false)
 * @returns Object with contrast ratio and pass/fail for AA and AAA
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  fontSize: number = 16,
  isBold: boolean = false
) {
  // Remove # if present
  const fg = foreground.replace('#', '')
  const bg = background.replace('#', '')

  // Convert to RGB
  const fgRgb = hexToRgb(fg)
  const bgRgb = hexToRgb(bg)

  // Calculate relative luminance
  const fgLum = relativeLuminance(fgRgb)
  const bgLum = relativeLuminance(bgRgb)

  // Calculate contrast ratio
  const lighter = Math.max(fgLum, bgLum)
  const darker = Math.min(fgLum, bgLum)
  const contrastRatio = (lighter + 0.05) / (darker + 0.05)

  // WCAG AA requirements
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold)
  const aaNormal = contrastRatio >= 4.5
  const aaLarge = contrastRatio >= 3
  const aaaNormal = contrastRatio >= 7
  const aaaLarge = contrastRatio >= 4.5

  return {
    ratio: contrastRatio.toFixed(2),
    aa: isLargeText ? aaLarge : aaNormal,
    aaa: isLargeText ? aaaLarge : aaaNormal,
  }
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

/**
 * Calculate relative luminance per WCAG 2.0
 */
function relativeLuminance(rgb: { r: number; g: number; b: number }) {
  const toLinear = (c: number) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  }

  const R = toLinear(rgb.r)
  const G = toLinear(rgb.g)
  const B = toLinear(rgb.b)

  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/**
 * Generate unique ID for ARIA attributes
 */
let idCounter = 0
export function generateAriaId(prefix = 'aria') {
  return `${prefix}-${idCounter++}`
}

/**
 * Announce dynamic content changes to screen readers
 * @param message Message to announce
 * @param priority 'polite' for general info, 'assertive' for urgent
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  container.addEventListener('keydown', handleTabKey)

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Common keyboard shortcuts for accessibility
 */
export const keyboardShortcuts = {
  escape: 'Escape',
  enter: 'Enter',
  space: ' ',
  tab: 'Tab',
  arrowUp: 'ArrowUp',
  arrowDown: 'ArrowDown',
  arrowLeft: 'ArrowLeft',
  arrowRight: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageUp: 'PageUp',
  pageDown: 'PageDown',
} as const
