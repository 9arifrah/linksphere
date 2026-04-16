import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { LinkCard } from '@/components/link-card'
import { SearchBar } from '@/components/search-bar'
import { ExternalLink } from 'lucide-react'
import { PublicPageHeader } from '@/components/user/public-page-header'
import { generatePublicProfileMetadata, generatePublicProfileStructuredData } from '@/lib/seo'
import { siteConfig } from '@/lib/seo'
import { StructuredDataScript } from '@/components/structured-data-script'

export const revalidate = 60

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  // Try short code first
  const link = await getLinkByShortCode(slug)
  if (link) {
    return {
      title: 'Redirecting...',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  // Then try user profile
  const user = await getUserBySlug(slug)
  if (!user) {
    return {
      title: 'Not Found',
    }
  }

  const settings = user.user_settings || {}
  const pageTitle = settings.page_title || user.display_name || user.custom_slug
  const description = settings.bio || `Link publik dari ${pageTitle} di ${siteConfig.name}`
  const logoUrl = settings.logo_url

  return generatePublicProfileMetadata({
    title: pageTitle,
    description,
    logo: logoUrl,
    slug: user.custom_slug,
    linkCount: 0, // Will be updated dynamically
  })
}

async function getLinkByShortCode(code: string) {
  try {
    // Validasi basic - cek apakah code mengandung karakter invalid
    if (!/^[a-zA-Z0-9-]+$/.test(code)) {
      return null
    }

    // Cari link berdasarkan short code (case-insensitive)
    const link = await db.getLinkByShortCode(code)
    return link
  } catch (error) {
    console.error('[v0] Error fetching link by short code:', error)
    return null
  }
}

async function getUserBySlug(slug: string) {
  try {
    const user = await db.getUserBySlug(slug)
    if (!user) return null

    const settings = await db.getUserSettings(user.id)
    return { ...user, user_settings: settings }
  } catch (error) {
    console.error('[v0] Error fetching user by slug:', error)
    return null
  }
}

async function getPublicLinksWithCategories(userId: string) {
  try {
    const links = await db.getLinks(userId)
    return links.filter(link => link.is_active && link.is_public)
  } catch (error) {
    console.error('[v0] Error fetching public links:', error)
    return []
  }
}

async function getPublicCategories(userId: string) {
  try {
    return await db.getCategories(userId)
  } catch (error) {
    console.error('[v0] Error fetching public categories:', error)
    return []
  }
}

export default async function PublicSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Priority 1: Check if it's a short code (redirect)
  const link = await getLinkByShortCode(slug)
  if (link) {
    // Increment click count
    try {
      await db.incrementClickCount(link.id)
    } catch (error) {
      console.error('[v0] Error incrementing click count:', error)
      // Continue redirect even if tracking fails
    }

    // Redirect with HTTP 302 (Temporary)
    redirect(link.url)
  }

  // Priority 2: Check if it's a user profile
  const user = await getUserBySlug(slug)
  if (!user) {
    notFound()
  }

  const settings = user.user_settings || {}
  const [links, categories] = await Promise.all([
    getPublicLinksWithCategories(user.id),
    settings.show_categories !== false ? getPublicCategories(user.id) : []
  ])

  // Group links by category
  const groupedLinks = categories.map(category => ({
    ...category,
    links: links.filter(link => link.category_id === category.id)
  })).filter(group => group.links.length > 0)

  // Add uncategorized links
  const uncategorizedLinks = links.filter(link => !link.category_id)
  if (uncategorizedLinks.length > 0) {
    groupedLinks.push({
      id: 'uncategorized',
      name: 'Lainnya',
      icon: '📌',
      sort_order: 999,
      user_id: user.id,
      links: uncategorizedLinks
    })
  }

  const themeColor = settings.theme_color || '#2563eb'
  const pageTitle = settings.page_title || user.display_name || user.custom_slug
  const description = settings.profile_description || `Link publik dari ${pageTitle}`

  // Generate structured data
  const structuredData = generatePublicProfileStructuredData({
    name: pageTitle,
    description,
    logo: settings.logo_url,
    slug: user.custom_slug,
    links: links.map(link => ({
      title: link.title,
      url: link.url,
    })),
    themeColor,
  })

  return (
    <>
      <StructuredDataScript data={structuredData} />
      <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background using user's theme color */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Theme-colored floating orbs */}
      <div
        className="absolute top-20 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ backgroundColor: themeColor }}
      />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ backgroundColor: themeColor, animationDelay: '2s' }}
      />

      <div className="relative mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="animate-scale-in">
          <PublicPageHeader
            displayName={user.display_name}
            settings={settings}
          />
        </div>

        {/* Search Bar */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <SearchBar links={links} themeColor={themeColor} />
        </div>

        {/* Links by Category */}
        <div className="space-y-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {groupedLinks.map((group, index) => (
            <div key={group.id} className="animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{group.icon}</span>
                <h2
                  className="text-2xl font-semibold"
                  style={{ color: themeColor }}
                >
                  {group.name}
                </h2>
              </div>
              <div className="space-y-3">
                {group.links.map((link: any) => (
                  <LinkCard key={link.id} link={link} themeColor={themeColor} />
                ))}
              </div>
            </div>
          ))}

          {groupedLinks.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 backdrop-blur-sm p-12 text-center animate-scale-in">
              <div className="flex flex-col items-center justify-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <ExternalLink className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Belum ada link publik</h3>
                <p className="max-w-sm text-slate-500">
                  Pengguna ini belum menambahkan link publik. Kembali lagi nanti untuk melihat update terbaru.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p>
            Powered by{' '}
            <a href="/" className="text-slate-700 hover:underline hover:text-slate-900 transition-colors">
              LinkSpread
            </a>
          </p>
          <p className="mt-2">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
    </>
  )
}
