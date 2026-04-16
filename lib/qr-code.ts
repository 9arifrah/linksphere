import QRCode from 'qrcode'
import { urlSchema } from '@/lib/validation'

/**
 * Generate QR code as base64 data URI
 * Uses the 'qrcode' package which works on both client and server.
 * @param url - The URL to encode in QR code
 * @returns Base64 data URI for QR code image
 * @throws {Error} If URL validation fails or QR generation fails
 */
export async function generateQRCode(url: string): Promise<string> {
  // Validate URL to prevent XSS via malicious URLs
  try {
    urlSchema.parse(url)
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`)
  }

  // Limit URL length for QR code reliability
  if (url.length > 2000) {
    throw new Error(`URL too long for QR code (max 2000 characters): ${url.length}`)
  }

  try {
    // Generate QR code as base64 data URI
    const dataUri = await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',  // Dark color (QR code dots)
        light: '#ffffff'  // Light color (background)
      },
      errorCorrectionLevel: 'M'
    })

    return dataUri
  } catch (error) {
    console.error('[QR Code] Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Convert base64 data URI to downloadable blob
 * @param dataUri - Base64 data URI
 * @param filename - Desired filename for download
 */
export function downloadDataUri(dataUri: string, filename: string): void {
  try {
    const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid data URI format')
    }

    const mimeType = matches[1]
    const base64Data = matches[2]

    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)

    if (typeof window === 'undefined') {
      throw new Error('downloadDataUri can only be used in browser context')
    }

    const blob = new Blob([byteArray], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('[QR Code] Error downloading data URI:', error)
    throw new Error('Failed to download QR code')
  }
}
