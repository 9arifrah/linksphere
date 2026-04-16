import { LoginForm } from '@/components/admin/login-form'
import { Shield } from 'lucide-react'

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400">Masuk untuk mengelola link</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
