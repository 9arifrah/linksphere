import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'
import { ExternalLink } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-accent-50/20 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-success-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and title */}
        <div className="mb-8 text-center animate-scale-in">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-xl shadow-brand-500/30 transition-transform duration-300 hover:scale-105 hover:rotate-3">
            <ExternalLink className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Buat Akun Baru
          </h1>
          <p className="mt-2 text-slate-600">
            Mulai kelola link Anda dengan mudah dan gratis
          </p>
        </div>

        {/* Register form */}
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            {/* Glass effect background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 via-accent-500/20 to-brand-500/20 rounded-2xl blur-xl opacity-50" />

            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60">
              <RegisterForm />
            </div>
          </div>
        </div>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-slate-600 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="font-medium bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent hover:from-brand-700 hover:to-accent-700 hover:underline transition-all"
          >
            Masuk di sini
          </Link>
        </p>

        {/* Back to home link */}
        <div className="mt-8 text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-brand-600 transition-colors group"
          >
            <span className="mr-1 transition-transform group-hover:-translate-x-1">←</span>
            Kembali ke halaman utama
          </Link>
        </div>
      </div>
    </div>
  )
}