/**
 * SEO utilities for metadata generation
 */

import type { Metadata } from 'next'

/**
 * Base site configuration
 */
export const siteConfig = {
  name: 'LinkSphere',
  title: 'LinkSphere - Platform Link Management Profesional',
  description: 'Platform link management profesional yang memungkinkan Anda mengatur, berbagi, dan menampilkan link penting dengan cara yang elegan dan personal.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://linksphere.example.com',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/linksphere',
    github: 'https://github.com/linksphere',
  },
} as const

/**
 * Generate default metadata for pages
 */
export function generateDefaultMetadata(overrides?: Partial<Metadata>): Metadata {
  return {
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
      'link management',
      'link organizer',
      'link sharing',
      'bio link',
      'linktree alternative',
      'url shortener',
      'professional links',
      'personal branding',
      'social links',
    ],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      alternateLocale: ['en_US'],
      url: siteConfig.url,
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.title,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: '@linksphere',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    ...overrides,
  }
}

/**
 * Generate metadata for dashboard pages
 */
export function generateDashboardMetadata(title: string, description?: string): Metadata {
  return generateDefaultMetadata({
    title,
    description: description || `Kelola ${title.toLowerCase()} di ${siteConfig.name}`,
    robots: {
      index: false,
      follow: false,
    },
  })
}

/**
 * Generate Open Graph metadata for public profile
 */
export interface PublicProfileMetadata {
  title: string
  description: string
  logo?: string
  slug: string
  linkCount: number
}

export function generatePublicProfileMetadata(profile: PublicProfileMetadata): Metadata {
  const url = `${siteConfig.url}/u/${profile.slug}`
  const ogImage = profile.logo || siteConfig.ogImage

  return {
    title: profile.title,
    description: profile.description,
    openGraph: {
      type: 'website',
      url,
      title: profile.title,
      description: profile.description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: profile.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: profile.title,
      description: profile.description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  }
}

/**
 * Generate JSON-LD structured data for public profile
 */
export interface PublicProfileStructuredData {
  name: string
  description: string
  logo?: string
  slug: string
  links: Array<{
    title: string
    url: string
    description?: string
  }>
  themeColor?: string
}

export function generatePublicProfileStructuredData(profile: PublicProfileStructuredData) {
  const url = `${siteConfig.url}/u/${profile.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    about: {
      '@type': 'Person',
      name: profile.name,
      description: profile.description,
      image: profile.logo,
      url: url,
    },
    mainEntity: {
      '@type': 'ItemList',
      name: `${profile.name}'s Links`,
      description: profile.description,
      numberOfItems: profile.links.length,
      itemListElement: profile.links.map((link, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebSite',
          name: link.title,
          url: link.url,
          description: link.description,
        },
      })),
    },
  }
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: Object.values(siteConfig.links),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@linksphere.example.com',
    },
  }
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: true,
        valueName: 'search_term_string',
      },
    },
  }
}

/**
 * Generate breadcrumb structured data
 */
export interface BreadcrumbItem {
  name: string
  href: string
}

export function generateBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${siteConfig.url}${item.href}`,
    })),
  }
}

/**
 * Format URL for canonical links
 */
export function formatCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url}${cleanPath}`
}

/**
 * Generate meta robots tag based on page type
 */
export function generateMetaRobots(
  type: 'public' | 'private' | 'noindex'
): { index: boolean; follow: boolean } {
  switch (type) {
    case 'public':
      return { index: true, follow: true }
    case 'private':
      return { index: false, follow: false }
    case 'noindex':
      return { index: false, follow: true }
    default:
      return { index: true, follow: true }
  }
}

/**
 * Truncate text for meta descriptions (optimal length: 150-160 characters)
 */
export function truncateMetaDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3).trim() + '...'
}

/**
 * Generate keywords from content
 */
export function generateKeywordsFromContent(content: string, maxKeywords: number = 10): string[] {
  // Remove common Indonesian and English stop words
  const stopWords = new Set([
    'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'yang',
    'the', 'and', 'or', 'in', 'to', 'from', 'for', 'with', 'that',
  ])

  // Extract words and count frequency
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))

  const frequency: Record<string, number> = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
}
