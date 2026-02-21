'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('[v0] Error Boundary caught an error:', error, errorInfo)

    // Update state
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-xl">
              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-2xl font-bold text-slate-900">
                  Terjadi Kesalahan
                </h1>
                <p className="text-slate-600">
                  Maaf, terjadi kesalahan yang tidak terduga. Kami sudah mencatat masalah ini.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-red-900">
                    Error Details:
                  </p>
                  <p className="mb-2 text-sm text-red-700 font-mono">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-sm text-red-600">
                      <summary className="cursor-pointer">Component Stack</summary>
                      <pre className="mt-2 overflow-auto text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Coba Lagi
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Kembali ke Dashboard
                </Button>
              </div>

              {/* Support Link */}
              <p className="mt-6 text-center text-sm text-slate-500">
                Masalah berlanjut?{' '}
                <a href="mailto:support@linksphere.example.com" className="text-brand-600 hover:underline">
                  Hubungi Support
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Simple error fallback for inline usage
 */
interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  message?: string
}

export function ErrorFallback({ error, resetError, message }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8">
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-600" />
        <h3 className="mb-2 text-lg font-semibold text-red-900">
          {message || 'Terjadi Kesalahan'}
        </h3>
        {error && (
          <p className="mb-4 text-sm text-red-700">{error.message}</p>
        )}
        {resetError && (
          <Button
            onClick={resetError}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Hook for handling async errors
 */
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    // Log error
    console.error('[v0] Async error:', error)

    // You can integrate with error reporting service here
    // Example: Sentry.captureException(error)

    throw error
  }, [])
}
