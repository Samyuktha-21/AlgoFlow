import { useEffect, useRef } from 'react'

/* ─── Per-theme canvas configs ──────────────────────── */
const CONFIGS = {
  water: {
    bg: 'linear-gradient(180deg,#0ea5e9 0%,#0369a1 35%,#0c4a6e 70%,#082f49 100%)',
    count: 70, type: 'bubbles',
  },
  network: {
    bg: 'radial-gradient(ellipse at center,#1e3a5f 0%,#0f172a 60%,#000000 100%)',
    count: 220, type: 'stars',
  },
  forest: {
    bg: 'linear-gradient(180deg,#4ade80 0%,#16a34a 35%,#166534 70%,#14532d 100%)',
    count: 70, type: 'leaves',
  },
  light: {
    bg: 'radial-gradient(ellipse at 50% 0%,#1e293b 0%,#0f172a 55%,#020617 100%)',
    count: 40, type: 'dust',
  },
  compass: {
    bg: 'linear-gradient(135deg,#0c1445 0%,#1e3a5f 60%,#0c1a3e 100%)',
    count: 45, type: 'sparks',
  },
  puzzle: {
    bg: 'linear-gradient(135deg,#2e1065 0%,#4c1d95 50%,#1a0533 100%)',
    count: 50, type: 'fragments',
  },
  chain: {
    bg: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
    count: 35, type: 'sparks',
  },
  books: {
    bg: 'linear-gradient(180deg,#292524 0%,#1c1107 100%)',
    count: 30, type: 'dust',
  },
  cabinet: {
    bg: 'linear-gradient(135deg,#0a1f0e 0%,#14532d 100%)',
    count: 40, type: 'sparks',
  },
  mountain: {
    bg: 'linear-gradient(180deg,#0c1a2e 0%,#1e3a5f 50%,#334155 100%)',
    count: 50, type: 'snow',
  },
  target: {
    bg: 'linear-gradient(135deg,#1c0404 0%,#450a0a 100%)',
    count: 35, type: 'sparks',
  },
  blocks: {
    bg: 'linear-gradient(180deg,#1c1107 0%,#431407 100%)',
    count: 35, type: 'dust',
  },
  maze: {
    bg: 'linear-gradient(135deg,#0f2011 0%,#14532d 100%)',
    count: 30, type: 'fireflies',
  },
  circuit: {
    bg: 'radial-gradient(circle,#0f1629 0%,#030712 80%)',
    count: 40, type: 'sparks',
  },
}

/* ─── Particle creators ──────────────────────────── */
function mkBubbles(w, h, n) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * w, y: h + Math.random() * h * 0.6,
    r: 2 + Math.random() * 9,
    vx: (Math.random() - 0.5) * 0.35, vy: -(0.5 + Math.random() * 1.3),
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.015 + Math.random() * 0.025,
    alpha: 0.12 + Math.random() * 0.3,
  }))
}

function mkStars(w, h, n) {
  const COLORS = ['#ffffff', '#60a5fa', '#a78bfa', '#38bdf8', '#fcd34d', '#f9fafb']
  return Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: 0.4 + Math.random() * 2.4,
    brightness: 0.25 + Math.random() * 0.75,
    phase: Math.random() * Math.PI * 2,
    speed: 0.007 + Math.random() * 0.016,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 0.04,
    vy: (Math.random() - 0.5) * 0.04,
    cur: 0,
  }))
}

function mkLeaves(w, h, n) {
  const COLORS = ['#22c55e','#16a34a','#15803d','#86efac','#4ade80','#f59e0b','#d97706','#a3e635','#bbf7d0']
  return Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.4, vy: 0.4 + Math.random() * 1.3,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    size: 5 + Math.random() * 11,
    phase: Math.random() * Math.PI * 2,
    swingSpeed: 0.012 + Math.random() * 0.022,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 0.45 + Math.random() * 0.55,
  }))
}

function mkSnow(w, h, n) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: 1 + Math.random() * 3,
    vx: (Math.random() - 0.5) * 0.6, vy: 0.3 + Math.random() * 0.9,
    alpha: 0.3 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
  }))
}

function mkSparks(w, h, n) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: 1 + Math.random() * 2.5,
    phase: Math.random() * Math.PI * 2,
    speed: 0.01 + Math.random() * 0.025,
    alpha: 0.2 + Math.random() * 0.5,
    vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    color: ['#fbbf24','#f59e0b','#fcd34d','#fff7ed'][Math.floor(Math.random() * 4)],
    cur: 0,
  }))
}

function mkFireflies(w, h, n) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
    phase: Math.random() * Math.PI * 2,
    speed: 0.02 + Math.random() * 0.04,
    r: 1.5 + Math.random() * 2,
    alpha: 0,
  }))
}

function mkDust(w, h, n) {
  return Array.from({ length: n }, () => ({
    x: w * 0.3 + Math.random() * w * 0.4,
    y: Math.random() * h * 0.7,
    r: 0.5 + Math.random() * 1.5,
    vx: (Math.random() - 0.5) * 0.25, vy: -(Math.random() * 0.4),
    alpha: 0.2 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    speed: 0.01 + Math.random() * 0.02,
    cur: 0,
  }))
}

function mkFragments(w, h, n) {
  const COLORS = ['#a855f7','#8b5cf6','#c084fc','#e879f9','#7c3aed','#4f46e5']
  return Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    size: 4 + Math.random() * 10,
    rotation: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    rotSpeed: (Math.random() - 0.5) * 0.02,
    alpha: 0.1 + Math.random() * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))
}

/* ─── Particle updaters / drawers ────────────────── */
function tickBubble(p, w, h) {
  p.wobble += p.wobbleSpeed
  p.x += p.vx + Math.sin(p.wobble) * 0.55
  p.y += p.vy
  if (p.y < -p.r * 3) { p.y = h + p.r * 2; p.x = Math.random() * w }
  if (p.x < -p.r) p.x = w + p.r
  if (p.x > w + p.r) p.x = -p.r
}
function drawBubble(ctx, p) {
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(186,230,253,${p.alpha})`; ctx.lineWidth = 0.8; ctx.stroke()
  ctx.beginPath(); ctx.arc(p.x - p.r * 0.32, p.y - p.r * 0.32, p.r * 0.24, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.65})`; ctx.fill()
}

function tickStar(p, w, h, t) {
  p.phase += p.speed
  p.cur = p.brightness * (0.3 + 0.7 * Math.abs(Math.sin(p.phase)))
  p.x += p.vx; p.y += p.vy
  if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
  if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
}
function drawStar(ctx, p) {
  const a = p.cur
  if (p.r > 1.4) {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5)
    const hex = Math.floor(a * 80).toString(16).padStart(2,'0')
    g.addColorStop(0, p.color + hex); g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = p.color + Math.floor(a * 255).toString(16).padStart(2,'0'); ctx.fill()
  if (p.r > 1.8 && a > 0.65) {
    ctx.strokeStyle = `rgba(255,255,255,${a * 0.35})`; ctx.lineWidth = 0.3
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
      ctx.beginPath()
      ctx.moveTo(p.x + Math.cos(angle) * p.r * 2, p.y + Math.sin(angle) * p.r * 2)
      ctx.lineTo(p.x + Math.cos(angle) * p.r * 5, p.y + Math.sin(angle) * p.r * 5)
      ctx.stroke()
    }
  }
}
function drawConstellationLines(ctx, stars) {
  const MAX_DIST = 70
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y
      const d = Math.sqrt(dx*dx+dy*dy)
      if (d < MAX_DIST) {
        const a = (1 - d / MAX_DIST) * 0.12
        ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[j].x, stars[j].y)
        ctx.strokeStyle = `rgba(96,165,250,${a})`; ctx.lineWidth = 0.4; ctx.stroke()
      }
    }
  }
}

function tickLeaf(p, w, h) {
  p.phase += p.swingSpeed
  p.x += p.vx + Math.sin(p.phase) * 0.8; p.y += p.vy; p.rotation += p.rotSpeed
  if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; p.rotation = Math.random() * Math.PI * 2 }
  if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20
}
function drawLeaf(ctx, p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.globalAlpha = p.alpha
  ctx.fillStyle = p.color; ctx.beginPath()
  ctx.moveTo(0, -p.size/2)
  ctx.bezierCurveTo(p.size/2.5, -p.size/4, p.size/2.5, p.size/4, 0, p.size/2)
  ctx.bezierCurveTo(-p.size/2.5, p.size/4, -p.size/2.5, -p.size/4, 0, -p.size/2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.4
  ctx.beginPath(); ctx.moveTo(0, -p.size/2); ctx.lineTo(0, p.size/2); ctx.stroke()
  ctx.restore(); ctx.globalAlpha = 1
}

function tickSnow(p, w, h) {
  p.phase += 0.015; p.x += p.vx + Math.sin(p.phase) * 0.3; p.y += p.vy
  if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w }
  if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
}
function drawSnow(ctx, p) {
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,255,255,${p.alpha})`; ctx.fill()
}

function tickSpark(p, w, h) {
  p.phase += p.speed; p.cur = p.alpha * (0.4 + 0.6 * Math.abs(Math.sin(p.phase)))
  p.x += p.vx; p.y += p.vy
  if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
  if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
}
function drawSpark(ctx, p) {
  const a = p.cur || p.alpha
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = p.color + Math.floor(a * 255).toString(16).padStart(2,'0'); ctx.fill()
}

function tickFirefly(p, w, h) {
  p.phase += p.speed; p.alpha = 0.4 + 0.6 * Math.abs(Math.sin(p.phase))
  p.x += p.vx + (Math.random() - 0.5) * 0.3; p.y += p.vy + (Math.random() - 0.5) * 0.3
  if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
  if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
}
function drawFirefly(ctx, p) {
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
  g.addColorStop(0, `rgba(250,204,21,${p.alpha})`)
  g.addColorStop(0.4, `rgba(250,204,21,${p.alpha * 0.3})`)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,255,255,${p.alpha})`; ctx.fill()
}

function tickDust(p, w, h) {
  p.phase += p.speed; p.cur = p.alpha * (0.5 + 0.5 * Math.sin(p.phase))
  p.x += p.vx; p.y += p.vy
  if (p.y < -10) { p.y = h * 0.8; p.x = w * 0.2 + Math.random() * w * 0.6 }
  if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
}
function drawDust(ctx, p) {
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(251,191,36,${p.cur || p.alpha})`; ctx.fill()
}

function tickFragment(p, w, h) {
  p.x += p.vx; p.y += p.vy; p.rotation += p.rotSpeed
  if (p.x < -20) p.x = w+20; if (p.x > w+20) p.x = -20
  if (p.y < -20) p.y = h+20; if (p.y > h+20) p.y = -20
}
function drawFragment(ctx, p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation)
  ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color
  ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6)
  ctx.restore(); ctx.globalAlpha = 1
}

/* ─── SVG overlays ───────────────────────────── */
function WaveOverlay() {
  return (
    <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: 24, zIndex: 2 }}>
      <svg viewBox="0 0 800 24" className="w-full h-full" preserveAspectRatio="none">
        <path d="M0,12 C100,0 200,24 300,12 C400,0 500,24 600,12 C700,0 800,24 800,12 L800,0 L0,0 Z"
          fill="rgba(186,230,253,0.15)" />
        <path d="M0,16 C133,6 267,24 400,14 C533,4 667,22 800,14 L800,0 L0,0 Z"
          fill="rgba(125,211,252,0.1)" />
      </svg>
    </div>
  )
}

function SpotlightOverlay({ id }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <svg className="w-full h-full">
        <defs>
          <radialGradient id={`beam-${id}`} cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="rgba(251,191,36,0.12)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="50%" cy="0" rx="40%" ry="80%" fill={`url(#beam-${id})`}>
          <animateTransform attributeName="transform" type="translate"
            values="-80,0;80,0;-80,0" dur="6s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    </div>
  )
}

const OVERLAYS = {
  water: WaveOverlay,
  light: SpotlightOverlay,
}

/* ─── Main canvas hook ───────────────────────── */
function useParticleCanvas(type, count) {
  const ref = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = 0, h = 0, particles = []

    const resize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      switch (type) {
        case 'bubbles':   particles = mkBubbles(w, h, count);   break
        case 'stars':     particles = mkStars(w, h, count);     break
        case 'leaves':    particles = mkLeaves(w, h, count);    break
        case 'snow':      particles = mkSnow(w, h, count);      break
        case 'sparks':    particles = mkSparks(w, h, count);    break
        case 'fireflies': particles = mkFireflies(w, h, count); break
        case 'dust':      particles = mkDust(w, h, count);      break
        case 'fragments': particles = mkFragments(w, h, count); break
        default:          particles = mkBubbles(w, h, count)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      t += 0.016
      switch (type) {
        case 'bubbles':
          particles.forEach(p => { tickBubble(p, w, h); drawBubble(ctx, p) })
          break
        case 'stars':
          particles.forEach(p => { tickStar(p, w, h, t); drawStar(ctx, p) })
          drawConstellationLines(ctx, particles.filter(p => p.r > 1.5))
          break
        case 'leaves':
          particles.forEach(p => { tickLeaf(p, w, h); drawLeaf(ctx, p) })
          break
        case 'snow':
          particles.forEach(p => { tickSnow(p, w, h); drawSnow(ctx, p) })
          break
        case 'sparks':
          particles.forEach(p => { tickSpark(p, w, h); drawSpark(ctx, p) })
          break
        case 'fireflies':
          particles.forEach(p => { tickFirefly(p, w, h); drawFirefly(ctx, p) })
          break
        case 'dust':
          particles.forEach(p => { tickDust(p, w, h); drawDust(ctx, p) })
          break
        case 'fragments':
          particles.forEach(p => { tickFragment(p, w, h); drawFragment(ctx, p) })
          break
      }
      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [type, count])

  return ref
}

/* ─── Public component ───────────────────────── */
export default function ThemeBackground({ themeId, children, className = '' }) {
  const cfg = CONFIGS[themeId] || CONFIGS.circuit
  const canvasRef = useParticleCanvas(cfg.type, cfg.count)
  const Overlay = OVERLAYS[themeId]

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ background: cfg.bg }}
    >
      {Overlay && <Overlay id={themeId} />}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      />
      <div className="relative" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  )
}
