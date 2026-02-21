'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = '#2563eb',
  className,
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate min/max for scaling
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height * 0.8 - height * 0.1

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, `${color}20`)
    gradient.addColorStop(1, `${color}00`)

    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }, [data, width, height, color])

  if (data.length < 2) return null

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn('inline-block', className)}
    />
  )
}
