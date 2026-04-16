/**
 * Component style patterns for consistent UI across the application
 */

/**
 * Card variants with consistent styling
 */
export const cardVariants = {
  default: 'border-slate-200/60 bg-white shadow-slack-md',
  elevated: 'border-slate-200/60 bg-white shadow-slack-lg hover:shadow-slack-xl transition-all duration-300',
  interactive: 'border-slate-200/60 bg-white shadow-slack-md hover:shadow-slack-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer',
  glass: 'border-white/20 bg-white/10 backdrop-blur-sm shadow-xl',
} as const

export type CardVariant = keyof typeof cardVariants

/**
 * Button variants with gradient styling
 */
export const buttonVariants = {
  primary: 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300',
  secondary: 'border-2 border-slate-800 text-slate-700 hover:bg-white hover:text-brand-600 transition-all duration-300',
  accent: 'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 hover:-translate-y-0.5 transition-all duration-300',
  destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200',
} as const

export type ButtonVariant = keyof typeof buttonVariants

/**
 * Input variants
 */
export const inputVariants = {
  default: 'border-slate-200 focus:border-brand-400 focus:ring-brand-400/20 transition-all',
  withIcon: 'pl-10 border-slate-200 focus:border-brand-400 focus:ring-brand-400/20 transition-all',
} as const

export type InputVariant = keyof typeof inputVariants

/**
 * Helper function to get card classes
 */
export function getCardClasses(variant: CardVariant = 'default', additionalClasses = '') {
  return `${cardVariants[variant]} ${additionalClasses}`.trim()
}

/**
 * Helper function to get button classes
 */
export function getButtonClasses(variant: ButtonVariant = 'primary', additionalClasses = '') {
  return `${buttonVariants[variant]} ${additionalClasses}`.trim()
}
