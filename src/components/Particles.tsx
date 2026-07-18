'use client'

import { useEffect, useRef } from 'react'

import { useQuota } from '@/hooks/useQuota'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  hue: number
  twinkleSpeed: number
  twinkleOffset: number
}

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { tier } = useQuota()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let mouseX = -9999
    let mouseY = -9999
    const particles: Particle[] = []
    const PARTICLE_COUNT = tier === 'PRO' ? 80 : 55

    const isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const init = () => {
      particles.length = 0
      const isPro = tier === 'PRO'
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (isPro ? 0.45 : 0.35),
          vy: (Math.random() - 0.5) * (isPro ? 0.45 : 0.35),
          radius: Math.random() * (isPro ? 2.2 : 1.8) + 0.6,
          opacity: Math.random() * 0.45 + 0.08,
          // Si PRO : spectrum Or/Orange (30-55). Si normal : Bleu/Violet (195-275)
          hue: Math.random() * (isPro ? 25 : 80) + (isPro ? 30 : 195),
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const dark = isDark()

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse repulsion
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110 && dist > 0) {
          const f = ((110 - dist) / 110) * 0.25
          p.vx += (dx / dist) * f
          p.vy += (dy / dist) * f
        }

        // Speed limit + damping
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 1.5) {
          p.vx = (p.vx / speed) * 1.5
          p.vy = (p.vy / speed) * 1.5
        }
        p.vx *= 0.985
        p.vy *= 0.985

        p.x += p.vx
        p.y += p.vy

        // Wrap edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Twinkle effect for PRO particles
        const twinkleOpacity = tier === 'PRO'
          ? p.opacity * (0.6 + 0.4 * Math.sin(Date.now() * p.twinkleSpeed + p.twinkleOffset))
          : p.opacity

        // Draw dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        if (tier === 'PRO') {
          // Radial gold shimmer for PRO
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2)
          grad.addColorStop(0, `hsla(${p.hue}, 95%, 85%, ${twinkleOpacity})`)
          grad.addColorStop(1, `hsla(${p.hue}, 80%, 55%, 0)`)
          ctx.fillStyle = grad
        } else {
          ctx.fillStyle = dark
            ? `hsla(${p.hue}, 85%, 72%, ${twinkleOpacity})`
            : `hsla(${p.hue}, 55%, 38%, ${twinkleOpacity * 0.55})`
        }
        ctx.fill()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx2 = p.x - p2.x
          const dy2 = p.y - p2.y
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (d2 < 130) {
            const a = (1 - d2 / 130) * (dark ? 0.14 : 0.07)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = tier === 'PRO'
              ? `hsla(${p.hue}, 90%, 70%, ${a * 1.5})`
              : dark
                ? `hsla(${p.hue}, 85%, 72%, ${a})`
                : `hsla(${p.hue}, 55%, 38%, ${a})`
            ctx.lineWidth = tier === 'PRO' ? 0.8 : 0.5
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    const onMouseLeave = () => {
      mouseX = -9999
      mouseY = -9999
    }

    resize()
    init()
    draw()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [tier])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}
