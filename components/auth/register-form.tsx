'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Eye, EyeOff, Lock, Mail, User, Link as LinkIcon } from 'lucide-react'
import { getPasswordStrength } from '@/lib/password-strength'

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    customSlug: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter')
      return
    }

    if (formData.customSlug && !/^[a-z0-9-]+$/.test(formData.customSlug)) {
      setError('Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung')
      return
    }

    setLoading(true)

    console.log('[v0] Registration form submitting with email:', formData.email)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName || undefined,
          customSlug: formData.customSlug || undefined
        })
      })

      console.log('[v0] Registration response status:', response.status)

      const data = await response.json()
      console.log('[v0] Registration response data:', data)

      if (!response.ok) {
        setError(data.error || 'Registrasi gagal')
        setLoading(false)
        return
      }

      console.log('[v0] Registration successful, redirecting to dashboard')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('[v0] Registration error:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <Card className="border-slate-200/60 shadow-slack-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-slate-900">Registrasi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-slate-700">Nama Tampilan</Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="displayName"
                type="text"
                placeholder="Nama Anda"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="contoh@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customSlug" className="text-slate-700">URL Kustom (Opsional)</Label>
            <div className="relative group">
              <LinkIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                id="customSlug"
                type="text"
                placeholder="nama-anda"
                value={formData.customSlug}
                onChange={(e) => setFormData({ ...formData, customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500">
              Halaman publik Anda akan diakses di: /u/{formData.customSlug || '<id>'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="pl-10 pr-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Kekuatan Password</span>
                  <span
                    className={`font-medium ${
                      passwordStrength.score <= 1
                        ? 'text-red-600'
                        : passwordStrength.score === 2
                        ? 'text-yellow-600'
                        : passwordStrength.score === 3
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <Progress value={(passwordStrength.score / 5) * 100} className="h-2" />

                {passwordStrength.suggestions.length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-600">
                    {passwordStrength.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-yellow-600">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700">Konfirmasi Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="pl-10 pr-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 animate-scale-in">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}