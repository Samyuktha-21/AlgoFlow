import { useEffect, useRef, useCallback } from 'react'

/* ─── Per-theme canvas particle configs ─── */
const THEME_CANVAS = {
  water: {
    bg: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 30%, #0ea5e9 65%, #38bdf8 100%)',
    init: (w, h) => Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * w, y: h + Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, vy: -(0.4 + Math.random() * 0.8),
      r: 3 + Math.random() * 6,
      alpha: 0.15 + Math.random() * 0.3,
      color: ['#bfdbfe','#93c5fd','#dbeafe','#ffffff','#7dd3fc'][i % 5],
    })),
    update: (p, w, h) => {
      p.x += p.vx; p.y += p.vy
      if (p.y < -20) { p.y = h + 10; p.x = Math.random() * w }
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
    },
    draw: (ctx, p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2,'0')
      ctx.fill()
    },
  },
  network: {
    bg: 'radial-gradient(ellipse at 50% 30%, #1e3a5f 0%, #0f172a 60%, #020617 100%)',
    init: (w, h) => Array.from({ length: 160 }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
      r: 0.8 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02,
      color: ['#ffffff','#60a5fa','#a78bfa','#38bdf8','#e0f2fe'][i % 5],
    })),
    update: (p, w, h, t) => {
      p.x += p.vx; p.y += p.vy
      p.currentAlpha = p.alpha * (0.4 + 0.6 * Math.sin(t * p.speed * 100 + p.phase))
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
    },
    draw: (ctx, p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.color + Math.floor((p.currentAlpha||p.alpha) * 255).toString(16).padStart(2,'0')
      ctx.fill()
    },
    connect: true,
    connectColor: 'rgba(96,165,250,',
    connectDist: 100,
  },
  forest: {
    bg: 'linear-gradient(180deg, #86efac 0%, #22c55e 35%, #16a34a 65%, #14532d 100%)',
    init: (w, h) => Array.from({ length: 70 }, (_, i) => ({
      x: Math.random() * w, y: -20 - Math.random() * h * 0.5,
      vx: (Math.random() - 0.5) * 0.7, vy: 0.5 + Math.random() * 1.2,
      rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 3,
      size: 8 + Math.random() * 10,
      alpha: 0.5 + Math.random() * 0.5,
      color: ['#86efac','#4ade80','#fbbf24','#fde68a','#a3e635','#bbf7d0'][i % 6],
    })),
    update: (p, w, h) => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotSpeed
      if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w }
    },
    draw: (ctx, p) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot * Math.PI / 180)
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      // Leaf shape
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size/2, p.size/3, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      ctx.globalAlpha = 1
    },
  },
  light: {
    bg: 'linear-gradient(180deg, #1c1107 0%, #292524 40%, #44403c 100%)',
    init: (w, h) => Array.from({ length: 50 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * w * 0.4,
      y: h * 0.3 + Math.random() * h * 0.6,
      vx: (Math.random() - 0.5) * 0.4, vy: -(Math.random() * 0.5),
      r: 1 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    })),
    update: (p, w, h, t) => {
      p.x += p.vx; p.y += p.vy
      p.currentAlpha = p.alpha * (0.5 + 0.5 * Math.sin(t * 50 + p.phase))
      if (p.y < h * 0.1) { p.y = h * 0.9; p.x = w/2 + (Math.random()-0.5)*w*0.4 }
    },
    draw: (ctx, p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      const a = Math.floor((p.currentAlpha||p.alpha)*255).toString(16).padStart(2,'0')
      ctx.fillStyle = '#fcd34d' + a
      ctx.fill()
    },
  },
  circuit: {
    bg: 'radial-gradient(ellipse at 50% 50%, #0f1629 0%, #030712 80%)',
    init: (w, h) => Array.from({ length: 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: 2 + Math.random() * 4,
      alpha: 0.3 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      color: ['#22d3ee','#a78bfa','#4ade80','#60a5fa'][Math.floor(Math.random()*4)],
    })),
    update: (p, w, h, t) => {
      p.x += p.vx; p.y += p.vy
      p.currentAlpha = p.alpha * (0.3 + 0.7 * Math.abs(Math.sin(t * 60 + p.phase)))
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
    },
    draw: (ctx, p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      const a = Math.floor((p.currentAlpha||p.alpha)*255).toString(16).padStart(2,'0')
      ctx.fillStyle = p.color + a
      ctx.shadowBlur = 8
      ctx.shadowColor = p.color
      ctx.fill()
      ctx.shadowBlur = 0
    },
    connect: true,
    connectColor: 'rgba(34,211,238,',
    connectDist: 80,
  },
}

// Generic fallback for all other themes
function genericTheme(colors, bg) {
  return {
    bg,
    init: (w, h) => Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: 2 + Math.random() * 4,
      alpha: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      color: colors[i % colors.length],
    })),
    update: (p, w, h, t) => {
      p.x += p.vx; p.y += p.vy
      p.currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(t * 50 + p.phase))
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
    },
    draw: (ctx, p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      const a = Math.floor((p.currentAlpha||p.alpha)*255).toString(16).padStart(2,'0')
      ctx.fillStyle = p.color + a
      ctx.fill()
    },
  }
}

const ALL_THEMES = {
  ...THEME_CANVAS,
  compass:  genericTheme(['#fbbf24','#fcd34d','#c9a227','#fde68a'], 'linear-gradient(180deg,#0c1445 0%,#1e3a5f 60%,#0c1a3e 100%)'),
  puzzle:   genericTheme(['#a855f7','#8b5cf6','#c084fc','#e879f9'], 'linear-gradient(135deg,#1a0533 0%,#2e1065 60%,#1a0533 100%)'),
  chain:    genericTheme(['#94a3b8','#cbd5e1','#64748b','#e2e8f0'], 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)'),
  books:    genericTheme(['#f97316','#fb923c','#fbbf24','#f59e0b'], 'linear-gradient(180deg,#1c1107 0%,#292524 100%)'),
  cabinet:  genericTheme(['#4ade80','#22c55e','#86efac','#a3e635'], 'linear-gradient(135deg,#0a1f0e 0%,#14532d 100%)'),
  mountain: genericTheme(['#94a3b8','#cbd5e1','#e2e8f0','#60a5fa'], 'linear-gradient(180deg,#0c1a2e 0%,#1e3a5f 50%,#334155 100%)'),
  target:   genericTheme(['#f87171','#fb923c','#fbbf24','#fca5a5'], 'linear-gradient(135deg,#1c0404 0%,#450a0a 100%)'),
  blocks:   genericTheme(['#f97316','#f59e0b','#eab308','#fbbf24'], 'linear-gradient(180deg,#1c1107 0%,#431407 100%)'),
  maze:     genericTheme(['#4ade80','#22c55e','#86efac','#bef264'], 'linear-gradient(135deg,#0f2011 0%,#14532d 100%)'),
}

function ThemeCanvas({ themeId }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cfg = ALL_THEMES[themeId] || ALL_THEMES.network
    let w = 0, h = 0, particles = [], t = 0

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      particles = cfg.init(w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      t += 0.016

      for (const p of particles) cfg.update(p, w, h, t)
      for (const p of particles) cfg.draw(ctx, p)

      if (cfg.connect) {
        const dist = cfg.connectDist || 100
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const d  = Math.sqrt(dx * dx + dy * dy)
            if (d < dist) {
              const a = (1 - d / dist) * 0.2
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.strokeStyle = (cfg.connectColor || 'rgba(148,163,184,') + a + ')'
              ctx.lineWidth = 0.6
              ctx.stroke()
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [themeId])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" aria-hidden="true" />
}

export default function ThemeScene({ themeId, children }) {
  const cfg = ALL_THEMES[themeId] || ALL_THEMES.network
  const bg  = cfg.bg

  return (
    <div className="relative overflow-hidden" style={{ background: bg }}>
      <ThemeCanvas themeId={themeId} />
      {/* SVG Wave overlay for water theme */}
      {themeId === 'water' && (
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none" style={{ zIndex:1 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-[200%] h-full"
            style={{ animation:'wave-flow 8s linear infinite' }}>
            <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1440,0 1440,40 L1440,80 L0,80 Z"
              fill="rgba(255,255,255,0.07)" />
          </svg>
        </div>
      )}
      {/* Star grid overlay for network theme */}
      {themeId === 'network' && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex:1,
          backgroundImage:'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
          backgroundSize:'60px 60px' }} />
      )}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}
