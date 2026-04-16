/**
 * Animation utility functions for consistent staggered animations
 */

export const staggerDelay = (index: number, baseDelay = 100) => ({
  style: { animationDelay: `${index * baseDelay}ms` }
})

export const createStaggeredChildren = (count: number, baseDelay = 100) =>
  Array.from({ length: count }, (_, i) => ({
    className: 'animate-stagger-fade',
    style: { animationDelay: `${i * baseDelay}ms` }
  }))

/**
 * Preset stagger delays for common use cases
 */
export const staggerPresets = {
  fast: { baseDelay: 50 },  // 50ms between items
  normal: { baseDelay: 100 }, // 100ms between items
  slow: { baseDelay: 150 },  // 150ms between items
  slower: { baseDelay: 200 } // 200ms between items
}

/**
 * Get stagger delay for a specific index
 */
export function getStaggerDelay(
  index: number,
  preset: keyof typeof staggerPresets = 'normal'
) {
  const { baseDelay } = staggerPresets[preset]
  return `${index * baseDelay}ms`
}
