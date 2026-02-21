import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  ExternalLink, 
  Lock, 
  Palette, 
  Users, 
  Shield, 
  Zap, 
  Globe,
  Star,
  Check,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Send
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-brand-50/50 to-accent-50/30">
        {/* Animated gradient mesh overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 via-brand-600/20 to-accent-500/20 animate-pulse" style={{ animationDuration: '8s' }} />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating orbs - brand colors only */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <div className="text-center">
            {/* Logo with floating animation */}
            <div className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-xl shadow-brand-500/30 transition-transform duration-300 hover:scale-105 hover:rotate-3 animate-fade-in">
              <ExternalLink className="h-10 w-10 text-white" />
            </div>

            <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl bg-gradient-to-r from-slate-900 via-brand-700 to-accent-600 bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.1s' }}>
              LinkSphere
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-600 sm:text-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Platform link management profesional yang memungkinkan Anda mengatur,
              berbagi, dan menampilkan link penting dengan cara yang elegan dan personal.
            </p>

            <div className="mb-12 flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-2 border-slate-800 text-slate-700 hover:bg-white hover:text-brand-600 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sudah Punya Akun? Masuk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Mengapa LinkSphere?
            </h2>
            <p className="text-xl text-slate-600">
              Fitur lengkap untuk memenuhi kebutuhan link management profesional Anda
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-brand-500/30">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Kontrol Privasi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Atur visibilitas link sebagai publik atau privat. Link publik dapat diakses melalui halaman personal kustom Anda dengan URL unik.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-accent-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-accent-500/30">
                  <Palette className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Personalisasi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Kustomisasi halaman publik dengan tema warna, logo, judul halaman, dan deskripsi profil sesuai gaya brand Anda.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 shadow-lg shadow-brand-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-brand-500/30">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Multi-User</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Dukungan multi-user dengan kategori personal. Setiap user memiliki space terpisah untuk mengelola linknya.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-accent-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-brand-500 shadow-lg shadow-accent-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-accent-500/30">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">URL Kustom</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Dapatkan halaman publik dengan URL kustom yang mudah diingat. Bagikan link Anda dengan professional.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 animate-stagger-fade" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-rose-500/30">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Cepat & Efisien</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Interface yang cepat dan responsif. Tambah, edit, atau hapus link dalam detik dengan pengalaman user yang smooth.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-2 border-slate-100 transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-500/30">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">Aman & Terpercaya</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  Data Anda dilindungi dengan enkripsi modern. Authentication secure dan backup regular untuk ketenangan pikiran.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Cara Kerja
            </h2>
            <p className="text-xl text-slate-600">
              Tiga langkah simple untuk mulai mengelola link Anda
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
                  1
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                  Buat Akun
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Daftar gratis dalam hitungan detik. Tidak perlu kartu kredit atau komitmen.
                </p>
              </div>
              <div className="hidden md:block md:absolute md:right-0 md:top-24 md:-translate-y-1/2 md:translate-x-1/2">
                <ArrowRight className="h-8 w-8 text-slate-300" />
              </div>
            </div>

            <div className="relative">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
                  2
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                  Kelola Link
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Tambah link, atur kategori, dan tentukan visibilitas. Interface yang intuitive dan powerful.
                </p>
              </div>
              <div className="hidden md:block md:absolute md:right-0 md:top-24 md:-translate-y-1/2 md:translate-x-1/2">
                <ArrowRight className="h-8 w-8 text-slate-300" />
              </div>
            </div>

            <div className="relative">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
                  3
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-slate-900">
                  Bagikan
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Share halaman publik Anda dengan URL kustom. Professional dan mudah diakses oleh semua.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-24 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-white/[0.2] [background-size:32px_32px]" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white animate-fade-in">
            Siap Mengelola Link Anda dengan Profesional?
          </h2>
          <p className="mb-10 text-xl text-blue-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Bergabunglah dengan ribuan user yang sudah mempercayai LinkSphere untuk link management mereka.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-300 text-white"
              >
                Daftar Sekarang - Gratis!
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-600 hover:-translate-y-0.5 transition-all duration-300"
              >
                Sudah Punya Akun? Masuk
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col items-center gap-8 text-center">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <ExternalLink className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                LinkSphere
              </h3>
            </div>

            {/* Description */}
            <p className="max-w-md text-slate-400">
              Platform link management profesional untuk mengatur dan berbagi link penting dengan cara yang elegan dan personal.
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/register" className="text-slate-300 transition-colors hover:text-blue-400">
                Daftar Gratis
              </Link>
              <Link href="/login" className="text-slate-300 transition-colors hover:text-blue-400">
                Login
              </Link>
              <Link href="/admin/login" className="text-slate-300 transition-colors hover:text-blue-400">
                Admin
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} LinkSphere. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}