'use client'

import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

/**
 * Page transition wrapper with fade-in animation
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        'transition-opacity duration-300 ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Page loading spinner with backdrop
 */
interface PageLoadingProps {
  message?: string
  fullScreen?: boolean
}

export function PageLoading({ message = 'Memuat...', fullScreen = false }: PageLoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      {message && (
        <p className="text-sm text-slate-600">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      {content}
    </div>
  )
}

/**
 * Route change transition indicator
 */
export function RouteChangeIndicator() {
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsChanging(true)
    const handleEnd = () => setIsChanging(false)

    // Listen to Next.js route events
    window.addEventListener('beforeunload', handleStart)

    return () => {
      window.removeEventListener('beforeunload', handleStart)
    }
  }, [])

  if (!isChanging) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div className="h-full w-full animate-progress bg-gradient-to-r from-brand-600 via-accent-500 to-brand-600 bg-[length:200%_100%]" />
    </div>
  )
}

/**
 * Skeleton wrapper for smooth loading transitions
 */
interface SkeletonTransitionProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton: React.ReactNode
  className?: string
}

export function SkeletonTransition({
  isLoading,
  children,
  skeleton,
  className
}: SkeletonTransitionProps) {
  const [showSkeleton, setShowSkeleton] = useState(isLoading)

  useEffect(() => {
    if (!isLoading) {
      // Delay hiding skeleton for smooth transition
      const timer = setTimeout(() => setShowSkeleton(false), 150)
      return () => clearTimeout(timer)
    } else {
      setShowSkeleton(true)
    }
  }, [isLoading])

  return (
    <div className={cn('relative', className)}>
      {showSkeleton ? (
        <div className="animate-fade-in">{skeleton}</div>
      ) : (
        <div className="animate-fade-in">{children}</div>
      )}
    </div>
  )
}

/**
 * Stagger children animation
 */
interface StaggerChildrenProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggerChildren({
  children,
  staggerDelay = 100,
  className
}: StaggerChildrenProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 0)
    return () => clearTimeout(timer)
  }, [])

  const childrenArray = React.Children.toArray(children)

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{
            animationDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
            animationFillMode: 'both',
            opacity: isVisible ? 1 : 0,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

/**
 * Smooth scroll to top on route change
 */
export function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return null
}
