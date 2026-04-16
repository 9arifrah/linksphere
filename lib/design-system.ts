// Design tokens inspired by Slack's visual language
// Reference: https://slack.com

export const designTokens = {
  colors: {
    primary: '#4A154B',      // Slack purple - deep, bold
    secondary: '#611F69',    // Lighter purple
    accent: '#ECB22E',       // Gold/yellow for CTAs
    success: '#1D9A6B',      // Green
    warning: '#E01E5A',      // Pink/red
    danger: '#DF2E2E',       // Red

    background: '#FFFFFF',
    backgroundSecondary: '#F8F8F8',
    backgroundTertiary: '#F4F4F4',

    text: {
      primary: '#1D1C1D',    // Almost black
      secondary: '#616061',  // Dark gray
      tertiary: '#918F8F',   // Medium gray
      muted: '#CFCBCB',      // Light gray
    },

    border: {
      light: '#E8E8E8',
      default: '#CFCBCB',
      dark: '#1D1C1D',
    },

    gradients: {
      purple: 'linear-gradient(135deg, #4A154B 0%, #611F69 100%)',
      purpleSubtle: 'linear-gradient(135deg, rgba(74, 21, 75, 0.05) 0%, rgba(97, 31, 105, 0.05) 100%)',
      gold: 'linear-gradient(135deg, #ECB22E 0%, #D4A017 100%)',
      success: 'linear-gradient(135deg, #1D9A6B 0%, #158F61 100%)',
    }
  },

  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 8px 24px rgba(0,0,0,0.08)',
    xl: '0 12px 32px rgba(0,0,0,0.12)',
    colored: {
      purple: '0 8px 24px rgba(74, 21, 75, 0.15)',
      gold: '0 8px 24px rgba(236, 178, 46, 0.2)',
      success: '0 8px 24px rgba(29, 154, 107, 0.15)',
    }
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },

  borderRadius: {
    sm: '4px',   // Buttons, inputs
    md: '8px',   // Cards, small elements
    lg: '12px',  // Large cards
    xl: '16px',  // Hero elements
    full: '9999px', // Pill-shaped
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',

    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
    },

    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    }
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  }
}

// Helper function to get color with opacity
export function withOpacity(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Helper function to create shadow utility
export function createShadow(color: string, opacity: number, blur: number = 8, offsetY: number = 4): string {
  return `0 ${offsetY}px ${blur}px ${color.replace(')', `, ${opacity})`).replace('rgb', 'rgba')}`
}
