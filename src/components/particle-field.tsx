'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; r: number; vy: number; vx: number
  alpha: number; decay: number; hue: number
}

/** Gold dust particles + smoke ambience — canvas 2D, respects prefers-reduced-motion */
export function ParticleField({ density = 60 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let w = 0, h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const particles: Particle[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (initial = false): Particle => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.8,
      vy: -(0.12 + Math.random() * 0.45),
      vx: (Math.random() - 0.5) * 0.22,
      alpha: 0.15 + Math.random() * 0.55,
      decay: 0.0008 + Math.random() * 0.0015,
      hue: Math.random() > 0.72 ? 47 : 44,
    })

    resize()
    const target = Math.round((density * w) / 1440)
    for (let i = 0; i < Math.max(24, target); i++) particles.push(spawn(true))

    let last = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < 33) return // ~30fps, GPU-friendly
      last = t
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.alpha -= p.decay
        if (p.alpha <= 0.02 || p.y < -10) Object.assign(p, spawn())
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
        glow.addColorStop(0, `hsla(${p.hue}, 72%, 62%, ${p.alpha})`)
        glow.addColorStop(1, 'hsla(44, 72%, 60%, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (!reduced) raf = requestAnimationFrame(loop)
    else {
      // static single frame
      for (const p of particles) {
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
        glow.addColorStop(0, `hsla(${p.hue}, 72%, 62%, ${p.alpha})`)
        glow.addColorStop(1, 'hsla(44, 72%, 60%, 0)')
        ctx.fillStyle = glow
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill()
      }
    }

    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [density])

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />
}
