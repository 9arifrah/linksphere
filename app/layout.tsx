import React from "react"
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'

import './globals.css'

export const metadata: Metadata = {
  title: 'LinkSphere - Platform Link Management Profesional',
  description: 'Platform link management profesional yang memungkinkan Anda mengatur, berbagi, dan menampilkan link penting dengan cara yang elegan dan personal.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          className="skip-link"
        >
          Langsung ke konten utama
        </a>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  )
}