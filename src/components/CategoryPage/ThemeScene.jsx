import { useEffect, useRef } from 'react'

/* ════════════════════════════════════════════════════
   PER-THEME CANVAS CONFIGS  (14 visual identities)
════════════════════════════════════════════════════ */

// ── SNOW BLIZZARD (sorting) ─────────────────────────
function snowflakeCfg(w, h) {
  return Array.from({ length: 220 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h - h,
    vx: (Math.random() - 0.5) * 1.8,
    vy: 0.8 + Math.random() * 2.5,
    size: 2 + Math.random() * 9,
    opacity: 0.3 + Math.random() * 0.65,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.05,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.018 + Math.random() * 0.018,
    isFlake: Math.random() < 0.35,
  }))
}
function updateSnowflake(p, w, h) {
  p.wobble += p.wobbleSpeed
  p.x += p.vx + Math.sin(p.wobble) * 1.2
  p.y += p.vy
  p.rotation += p.rotSpeed
  if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w }
  if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20
}
function drawSnowflake(ctx, p) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.globalAlpha = p.opacity
  if (p.isFlake && p.size > 4) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 1.2
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate((i / 6) * Math.PI * 2)
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -p.size)
      ctx.moveTo(0, -p.size * 0.55); ctx.lineTo(p.size * 0.28, -p.size * 0.72)
      ctx.moveTo(0, -p.size * 0.55); ctx.lineTo(-p.size * 0.28, -p.size * 0.72)
      ctx.stroke(); ctx.restore()
    }
  } else {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
    g.addColorStop(0, 'rgba(255,255,255,0.95)')
    g.addColorStop(0.6, 'rgba(220,240,255,0.5)')
    g.addColorStop(1, 'rgba(200,230,255,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore(); ctx.globalAlpha = 1
}

// ── RAIN / STORM (searching) ────────────────────────
function rainCfg(w, h) {
  return Array.from({ length: 180 }, () => mkRainP(w, h))
}
function mkRainP(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vy: 10 + Math.random() * 8,
    vx: 1.5 + Math.random() * 1.5,
    len: 12 + Math.random() * 14,
    alpha: 0.12 + Math.random() * 0.22,
  }
}
function updateRain(p, w, h) {
  p.x += p.vx; p.y += p.vy
  if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w }
  if (p.x > w + 10) p.x = 0
}
function drawRain(ctx, p) {
  ctx.save()
  ctx.globalAlpha = p.alpha
  ctx.strokeStyle = 'rgba(147,197,253,0.8)'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(p.x, p.y)
  ctx.lineTo(p.x + p.vx * 0.7, p.y + p.len)
  ctx.stroke()
  ctx.restore()
}

// ── OCEAN WAVES (fundamentals) ──────────────────────
function oceanCfg(w, h) {
  return Array.from({ length: 60 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 2 + Math.random() * 5,
    alpha: 0.1 + Math.random() * 0.25,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2,
  }))
}
function updateOcean(p, w, h) {
  p.x += p.vx; p.y += p.vy
  if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
  if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
}
function drawOcean(ctx, p) {
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(186,230,253,${p.alpha})`
  ctx.fill()
}
function drawOceanWaves(ctx, w, h, t) {
  const layers = [
    { amp: 55, freq: 0.012, speed: 0.018, y: 0.62, color: 'rgba(14,165,233,0.45)' },
    { amp: 38, freq: 0.018, speed: 0.026, y: 0.68, color: 'rgba(6,182,212,0.40)' },
    { amp: 28, freq: 0.024, speed: 0.014, y: 0.74, color: 'rgba(8,145,178,0.55)' },
    { amp: 45, freq: 0.009, speed: 0.022, y: 0.79, color: 'rgba(12,74,110,0.65)' },
  ]
  for (const layer of layers) {
    ctx.beginPath()
    for (let x = 0; x <= w; x += 3) {
      const y = h * layer.y
        + Math.sin(x * layer.freq + t * layer.speed * 60) * layer.amp
        + Math.sin(x * layer.freq * 1.8 + t * layer.speed * 35) * (layer.amp * 0.4)
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath()
    ctx.fillStyle = layer.color; ctx.fill()
  }
}

// ── BUTTERFLIES (arrays) ────────────────────────────
function butterflyCfg(w, h) {
  return Array.from({ length: 80 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    size: 10 + Math.random() * 18,
    hue: Math.floor(Math.random() * 360),
    wingPhase: Math.random() * Math.PI * 2,
    wingSpeed: 0.09 + Math.random() * 0.07,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.012 + Math.random() * 0.014,
    alpha: 0.55 + Math.random() * 0.35,
  }))
}
function updateButterfly(p, w, h) {
  p.wingPhase += p.wingSpeed
  p.wobble += p.wobbleSpeed
  p.x += p.vx + Math.sin(p.wobble) * 1.4
  p.y += p.vy + Math.cos(p.wobble * 0.7) * 0.9
  if (p.x < -40) p.x = w + 40; if (p.x > w + 40) p.x = -40
  if (p.y < -40) p.y = h + 40; if (p.y > h + 40) p.y = -40
}
function drawButterfly(ctx, p) {
  const s = p.size
  const wingX = Math.abs(Math.cos(p.wingPhase))
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.globalAlpha = p.alpha
  // Left wing
  ctx.save()
  ctx.scale(-wingX, 1)
  const lg = ctx.createRadialGradient(-s * 0.4, -s * 0.2, 0, -s * 0.4, -s * 0.2, s)
  lg.addColorStop(0, `hsla(${p.hue}, 100%, 80%, 0.9)`)
  lg.addColorStop(0.5, `hsla(${p.hue + 30}, 90%, 65%, 0.6)`)
  lg.addColorStop(1, `hsla(${p.hue + 60}, 80%, 50%, 0)`)
  ctx.fillStyle = lg
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(-s, -s * 0.8, -s * 1.4, 0.1 * s, 0, s * 0.28)
  ctx.fill()
  ctx.restore()
  // Right wing
  ctx.save()
  ctx.scale(wingX, 1)
  const rg = ctx.createRadialGradient(s * 0.4, -s * 0.2, 0, s * 0.4, -s * 0.2, s)
  rg.addColorStop(0, `hsla(${p.hue}, 100%, 80%, 0.9)`)
  rg.addColorStop(0.5, `hsla(${p.hue + 30}, 90%, 65%, 0.6)`)
  rg.addColorStop(1, `hsla(${p.hue + 60}, 80%, 50%, 0)`)
  ctx.fillStyle = rg
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(s, -s * 0.8, s * 1.4, 0.1 * s, 0, s * 0.28)
  ctx.fill()
  ctx.restore()
  // Body
  ctx.fillStyle = `hsla(${p.hue + 180}, 50%, 20%, 0.7)`
  ctx.beginPath()
  ctx.ellipse(0, 0, 2, s * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.globalAlpha = 1
}

// ── CHERRY BLOSSOMS (linked-lists) ──────────────────
function blossomCfg(w, h) {
  return Array.from({ length: 120 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: 0.2 + Math.random() * 0.8,
    vy: 0.3 + Math.random() * 0.7,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.035,
    size: 5 + Math.random() * 9,
    alpha: 0.45 + Math.random() * 0.45,
    phase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.018 + Math.random() * 0.018,
    pinkness: 310 + Math.random() * 30,
  }))
}
function updateBlossom(p, w, h) {
  p.phase += p.wobbleSpeed
  p.x += p.vx + Math.sin(p.phase) * 1.1
  p.y += p.vy
  p.rotation += p.rotSpeed
  if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w }
  if (p.x > w + 20) p.x = -20; if (p.x < -20) p.x = w + 20
}
function drawBlossom(ctx, p) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.globalAlpha = p.alpha
  for (let i = 0; i < 5; i++) {
    ctx.save()
    ctx.rotate((i / 5) * Math.PI * 2)
    ctx.fillStyle = `hsla(${p.pinkness}, 80%, 82%, 0.88)`
    ctx.beginPath()
    ctx.ellipse(0, -p.size * 0.55, p.size * 0.3, p.size * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.fillStyle = 'rgba(255,240,180,0.85)'
  ctx.beginPath()
  ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.globalAlpha = 1
}

// ── CLOUDS (stacks-queues) ──────────────────────────
function cloudCfg(w, h) {
  return Array.from({ length: 14 }, (_, i) => ({
    x: Math.random() * (w + 300) - 150,
    y: (i / 14) * h * 0.75 + Math.random() * 40,
    vx: 0.18 + Math.random() * 0.35,
    size: 70 + Math.random() * 110,
    alpha: 0.35 + Math.random() * 0.35,
    puffs: Array.from({ length: 5 + Math.floor(Math.random() * 4) }, () => ({
      dx: (Math.random() - 0.5) * 90,
      dy: (Math.random() - 0.5) * 22,
      r: 22 + Math.random() * 45,
    })),
  }))
}
function updateCloud(p, w) {
  p.x += p.vx
  if (p.x > w + p.size + 150) p.x = -p.size - 150
}
function drawCloud(ctx, p) {
  ctx.save()
  ctx.globalAlpha = p.alpha
  ctx.translate(p.x, p.y)
  for (const puff of p.puffs) {
    const g = ctx.createRadialGradient(puff.dx, puff.dy, 0, puff.dx, puff.dy, puff.r)
    g.addColorStop(0, 'rgba(255,255,255,0.92)')
    g.addColorStop(0.6, 'rgba(230,245,255,0.65)')
    g.addColorStop(1, 'rgba(190,220,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(puff.dx, puff.dy, puff.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
  ctx.globalAlpha = 1
}

// ── TROPICAL FLOWERS (hashing) ──────────────────────
function flowerCfg(w, h) {
  const HUES = [0, 30, 60, 120, 200, 280, 320]
  return Array.from({ length: 50 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: 10 + Math.random() * 22,
    hue: HUES[Math.floor(Math.random() * HUES.length)],
    alpha: 0.22 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
    bloomSpeed: 0.007 + Math.random() * 0.01,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.004,
  }))
}
function updateFlower(p) {
  p.phase += p.bloomSpeed; p.rotation += p.rotSpeed
}
function drawFlower(ctx, p) {
  const bloom = 0.6 + 0.4 * Math.abs(Math.sin(p.phase))
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.globalAlpha = p.alpha * bloom
  for (let i = 0; i < 6; i++) {
    ctx.save()
    ctx.rotate((i / 6) * Math.PI * 2)
    const g = ctx.createRadialGradient(0, -p.size * 0.55, 0, 0, -p.size * 0.55, p.size)
    g.addColorStop(0, `hsla(${p.hue}, 100%, 75%, 0.9)`)
    g.addColorStop(0.5, `hsla(${p.hue + 20}, 90%, 60%, 0.6)`)
    g.addColorStop(1, `hsla(${p.hue + 40}, 80%, 45%, 0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, -p.size * 0.55, p.size * 0.3, p.size * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.22)
  cg.addColorStop(0, '#fef08a'); cg.addColorStop(1, '#f59e0b')
  ctx.fillStyle = cg
  ctx.beginPath()
  ctx.arc(0, 0, p.size * 0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.globalAlpha = 1
}

// ── LAVA (heaps) ────────────────────────────────────
function lavaCfg(w, h) {
  return Array.from({ length: 100 }, () => mkLavaP(w, h))
}
function mkLavaP(w, h) {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3
  const speed = 2 + Math.random() * 7
  return {
    x: w / 2 + (Math.random() - 0.5) * 100,
    y: h * 0.9,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    gravity: 0.11,
    size: 3 + Math.random() * 15,
    hue: Math.random() * 22,
    alpha: 0.55 + Math.random() * 0.35,
    isEmber: Math.random() < 0.28,
  }
}
function updateLava(p, w, h) {
  p.vx *= 0.98; p.vy += p.gravity
  p.x += p.vx; p.y += p.vy
  p.hue = Math.min(55, p.hue + 0.35)
  p.size *= 0.996
  if (p.y > h + 20 || p.size < 0.4) Object.assign(p, mkLavaP(w, h))
}
function drawLava(ctx, p) {
  ctx.save()
  ctx.globalAlpha = p.alpha
  if (p.isEmber) {
    ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${p.hue + 20}, 100%, 70%, 1)`
    ctx.fillStyle = `hsla(${p.hue + 40}, 100%, 85%, 1)`
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2)
    ctx.fill()
  } else {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
    g.addColorStop(0, `hsla(${p.hue + 50}, 100%, 88%, 1)`)
    g.addColorStop(0.4, `hsla(${p.hue + 22}, 100%, 65%, 0.8)`)
    g.addColorStop(1, `hsla(${p.hue}, 80%, 35%, 0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
  ctx.shadowBlur = 0; ctx.globalAlpha = 1
}

// ── STARS (keep for network + sparse for aurora/target) ──
function starCfg(w, h, n = 160) {
  const C = ['#ffffff','#60a5fa','#a78bfa','#38bdf8','#fcd34d','#f9fafb']
  return Array.from({ length: n }, (_, i) => ({
    x: Math.random() * w, y: Math.random() * h,
    r: 0.5 + Math.random() * 2.2,
    brightness: 0.25 + Math.random() * 0.75,
    phase: Math.random() * Math.PI * 2,
    speed: 0.007 + Math.random() * 0.016,
    color: C[i % C.length],
    vx: (Math.random() - 0.5) * 0.04,
    vy: (Math.random() - 0.5) * 0.04,
  }))
}
function updateStar(p, w, h) {
  p.phase += p.speed
  p.currentAlpha = p.brightness * (0.3 + 0.7 * Math.abs(Math.sin(p.phase)))
  p.x += p.vx; p.y += p.vy
  if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
  if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
}
function drawStar(ctx, p) {
  const a = p.currentAlpha || p.brightness
  if (p.r > 1.4) {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5)
    g.addColorStop(0, p.color + Math.floor(a * 80).toString(16).padStart(2, '0'))
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = p.color + Math.floor(a * 255).toString(16).padStart(2, '0')
  ctx.fill()
}
function drawConstellations(ctx, stars) {
  for (let i = 0; i < Math.min(stars.length, 80); i++) {
    for (let j = i + 1; j < Math.min(stars.length, 80); j++) {
      const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < 80) {
        ctx.beginPath(); ctx.moveTo(stars[i].x, stars[i].y); ctx.lineTo(stars[j].x, stars[j].y)
        ctx.strokeStyle = `rgba(96,165,250,${(1 - d / 80) * 0.1})`
        ctx.lineWidth = 0.4; ctx.stroke()
      }
    }
  }
}

// ── HEARTS / LOVE (backtracking) ─────────────────────
function heartsCfg(w, h) {
  return Array.from({ length: 90 }, () => ({
    x: Math.random() * w,
    y: h + Math.random() * 80,
    vx: (Math.random() - 0.5) * 1.2,
    vy: -(0.5 + Math.random() * 1.8),
    size: 8 + Math.random() * 18,
    hue: 325 + Math.random() * 40,
    alpha: 0.4 + Math.random() * 0.5,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.015 + Math.random() * 0.015,
    rotation: (Math.random() - 0.5) * 0.5,
  }))
}
function updateHeart(p, w, h) {
  p.wobble += p.wobbleSpeed
  p.x += p.vx + Math.sin(p.wobble) * 0.6
  p.y += p.vy
  p.alpha -= 0.003
  if (p.y < -p.size * 3 || p.alpha <= 0) {
    p.y = h + p.size; p.x = Math.random() * w
    p.alpha = 0.4 + Math.random() * 0.5
    p.vy = -(0.5 + Math.random() * 1.8)
  }
}
function drawHeart(ctx, p) {
  ctx.save()
  ctx.translate(p.x, p.y); ctx.rotate(p.rotation)
  ctx.globalAlpha = p.alpha
  const s = p.size / 12
  ctx.beginPath()
  ctx.moveTo(0, s * 4)
  ctx.bezierCurveTo(-s * 12, -s * 2, -s * 12, -s * 12, 0, -s * 6)
  ctx.bezierCurveTo(s * 12, -s * 12, s * 12, -s * 2, 0, s * 4)
  ctx.closePath()
  const g = ctx.createRadialGradient(0, -s * 2, 0, 0, 0, s * 12)
  g.addColorStop(0, `hsla(${p.hue}, 100%, 82%, 1)`)
  g.addColorStop(0.5, `hsla(${p.hue - 10}, 100%, 62%, 0.8)`)
  g.addColorStop(1, `hsla(${p.hue - 20}, 100%, 42%, 0.3)`)
  ctx.fillStyle = g
  ctx.shadowBlur = 10; ctx.shadowColor = `hsla(${p.hue}, 100%, 62%, 0.5)`
  ctx.fill()
  ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1
}

// ── HIGHWAY STREAKS (dp) ────────────────────────────
function highwayCfg(w, h) {
  return Array.from({ length: 50 }, () => mkHighwayStreakP(w, h))
}
function mkHighwayStreakP(w, h) {
  const goRight = Math.random() > 0.5
  return {
    x: goRight ? -60 : w + 60,
    y: h * (0.38 + Math.random() * 0.47),
    vx: goRight ? (2.5 + Math.random() * 5) : -(2.5 + Math.random() * 5),
    len: 25 + Math.random() * 55,
    color: Math.random() > 0.5 ? '#fbbf24' : '#f9fafb',
    alpha: 0.25 + Math.random() * 0.45,
  }
}
function updateHighwayStreak(p, w, h) {
  p.x += p.vx
  if (p.vx > 0 && p.x > w + 70) Object.assign(p, mkHighwayStreakP(w, h), { x: -60, vx: Math.abs(p.vx) })
  if (p.vx < 0 && p.x < -70) Object.assign(p, mkHighwayStreakP(w, h), { x: w + 60, vx: -Math.abs(p.vx) })
}
function drawHighwayStreak(ctx, p) {
  ctx.save(); ctx.globalAlpha = p.alpha
  const x0 = p.vx > 0 ? p.x - p.len : p.x
  const x1 = p.vx > 0 ? p.x : p.x + p.len
  const grad = ctx.createLinearGradient(x0, p.y, x1, p.y)
  grad.addColorStop(0, p.color + '00'); grad.addColorStop(1, p.color)
  ctx.fillStyle = grad; ctx.fillRect(x0, p.y - 1.8, p.len, 3.6)
  ctx.restore()
}

// ── PLASMA (advanced) ────────────────────────────────
function plasmaCfg(w, h) {
  const C = ['#a78bfa','#22d3ee','#f0abfc','#4ade80','#60a5fa']
  return Array.from({ length: 55 }, (_, i) => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 2.5, vy: (Math.random() - 0.5) * 2.5,
    r: 1.2 + Math.random() * 2.2,
    color: C[i % C.length],
    phase: Math.random() * Math.PI * 2,
    speed: 0.04 + Math.random() * 0.06,
    alpha: 0.3 + Math.random() * 0.5,
    trail: [],
  }))
}
function updatePlasma(p, w, h) {
  p.trail.push({ x: p.x, y: p.y })
  if (p.trail.length > 8) p.trail.shift()
  p.phase += p.speed
  p.vx += (Math.random() - 0.5) * 0.4; p.vy += (Math.random() - 0.5) * 0.4
  p.vx *= 0.97; p.vy *= 0.97
  p.x += p.vx; p.y += p.vy
  if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
  if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx) }
  if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
  if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy) }
}
function drawPlasma(ctx, p) {
  const a = p.alpha * (0.5 + 0.5 * Math.abs(Math.sin(p.phase)))
  p.trail.forEach((pt, i) => {
    const ta = (i / p.trail.length) * a * 0.35
    ctx.beginPath(); ctx.arc(pt.x, pt.y, p.r * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = p.color + Math.floor(ta * 255).toString(16).padStart(2, '0'); ctx.fill()
  })
  ctx.save()
  ctx.shadowBlur = 14; ctx.shadowColor = p.color
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
  ctx.fillStyle = p.color + Math.floor(a * 255).toString(16).padStart(2, '0'); ctx.fill()
  ctx.restore()
}

// ── LEAVES (forest — keep) ──────────────────────────
function leafCfg(w, h) {
  const C = ['#22c55e','#16a34a','#15803d','#86efac','#4ade80','#f59e0b','#a3e635','#bbf7d0']
  return Array.from({ length: 80 }, (_, i) => ({
    x: Math.random() * w, y: -20 - Math.random() * h * 0.5,
    vx: (Math.random() - 0.5) * 1.3, vy: 0.4 + Math.random() * 1.2,
    rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.04,
    size: 5 + Math.random() * 11, phase: Math.random() * Math.PI * 2,
    swingSpeed: 0.012 + Math.random() * 0.022,
    color: C[i % C.length], alpha: 0.45 + Math.random() * 0.55,
  }))
}
function updateLeaf(p, w, h) {
  p.phase += p.swingSpeed; p.x += p.vx + Math.sin(p.phase) * 0.8; p.y += p.vy
  p.rotation += p.rotSpeed
  if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; p.rotation = Math.random() * Math.PI * 2 }
  if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20
}
function drawLeaf(ctx, p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation)
  ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -p.size / 2)
  ctx.bezierCurveTo(p.size / 2.5, -p.size / 4, p.size / 2.5, p.size / 4, 0, p.size / 2)
  ctx.bezierCurveTo(-p.size / 2.5, p.size / 4, -p.size / 2.5, -p.size / 4, 0, -p.size / 2)
  ctx.fill()
  ctx.restore(); ctx.globalAlpha = 1
}

/* ════════════════════════════════════════════════════
   CANVAS COMPONENT
════════════════════════════════════════════════════ */
function ThemeCanvas({ themeId }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = 0, h = 0, particles = [], t = 0

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      switch (themeId) {
        case 'water':    particles = snowflakeCfg(w, h);      break
        case 'light':    particles = rainCfg(w, h);          break
        case 'compass':  particles = oceanCfg(w, h);         break
        case 'puzzle':   particles = butterflyCfg(w, h);     break
        case 'chain':    particles = blossomCfg(w, h);       break
        case 'books':    particles = cloudCfg(w, h);         break
        case 'cabinet':  particles = flowerCfg(w, h);        break
        case 'forest':   particles = leafCfg(w, h);          break
        case 'mountain': particles = lavaCfg(w, h);          break
        case 'network':  particles = starCfg(w, h, 220);     break
        case 'target':   particles = starCfg(w, h, 120);     break
        case 'blocks':   particles = highwayCfg(w, h);       break
        case 'maze':     particles = heartsCfg(w, h);        break
        case 'circuit':  particles = plasmaCfg(w, h);        break
        default:         particles = starCfg(w, h, 100)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      t += 0.016

      if (themeId === 'compass') {
        drawOceanWaves(ctx, w, h, t)
        for (const p of particles) { updateOcean(p, w, h); drawOcean(ctx, p) }
      } else {
        for (const p of particles) {
          switch (themeId) {
            case 'water':    updateSnowflake(p, w, h, t);  drawSnowflake(ctx, p);   break
            case 'light':    updateRain(p, w, h);         drawRain(ctx, p);        break
            case 'puzzle':   updateButterfly(p, w, h);    drawButterfly(ctx, p);   break
            case 'chain':    updateBlossom(p, w, h);      drawBlossom(ctx, p);     break
            case 'books':    updateCloud(p, w);           drawCloud(ctx, p);       break
            case 'cabinet':  updateFlower(p);             drawFlower(ctx, p);      break
            case 'forest':   updateLeaf(p, w, h);         drawLeaf(ctx, p);        break
            case 'mountain': updateLava(p, w, h);         drawLava(ctx, p);        break
            case 'network':  updateStar(p, w, h, t);      drawStar(ctx, p);        break
            case 'target':   updateStar(p, w, h, t);      drawStar(ctx, p);        break
            case 'blocks':   updateHighwayStreak(p, w, h); drawHighwayStreak(ctx, p); break
            case 'maze':     updateHeart(p, w, h);        drawHeart(ctx, p);       break
            case 'circuit':  updatePlasma(p, w, h);       drawPlasma(ctx, p);      break
          }
        }
        if (themeId === 'network') {
          drawConstellations(ctx, particles.filter(p => p.r > 1.4))
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [themeId])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" aria-hidden="true" />
}

/* ════════════════════════════════════════════════════
   THEME BACKGROUNDS  (gradient per identity)
════════════════════════════════════════════════════ */
const THEME_BG = {
  water:    'linear-gradient(180deg,#e0f2fe 0%,#bae6fd 35%,#7dd3fc 65%,#38bdf8 100%)',
  light:    'linear-gradient(180deg,#06091a 0%,#0a0f1e 40%,#0f172a 70%,#1a2540 100%)',
  compass:  'linear-gradient(180deg,#0ea5e9 0%,#0284c7 35%,#0369a1 65%,#0c4a6e 100%)',
  puzzle:   'linear-gradient(135deg,#fdf4ff 0%,#f0e6ff 40%,#e8d5ff 70%,#ddd0ff 100%)',
  chain:    'linear-gradient(180deg,#fff0f5 0%,#fce7f3 40%,#fbcfe8 70%,#f9a8d4 100%)',
  books:    'linear-gradient(180deg,#bfdbfe 0%,#93c5fd 35%,#60a5fa 65%,#3b82f6 100%)',
  cabinet:  'linear-gradient(180deg,#064e3b 0%,#065f46 40%,#047857 70%,#059669 100%)',
  forest:   'linear-gradient(180deg,#4ade80 0%,#16a34a 35%,#166534 70%,#14532d 100%)',
  mountain: 'linear-gradient(180deg,#1c0a00 0%,#2d1000 40%,#1a0800 70%,#0a0300 100%)',
  network:  'radial-gradient(ellipse at center,#1e3a5f 0%,#0f172a 60%,#000000 100%)',
  target:   'linear-gradient(180deg,#020617 0%,#050d1e 50%,#0a1628 100%)',
  blocks:   'linear-gradient(180deg,#0f172a 0%,#1e293b 40%,#334155 60%,#1e293b 100%)',
  maze:     'linear-gradient(180deg,#4a0020 0%,#7f1d4a 40%,#9d174d 70%,#4a0020 100%)',
  circuit:  'radial-gradient(circle at 50% 50%,#0f1629 0%,#030712 80%)',
}

/* ════════════════════════════════════════════════════
   SVG OVERLAYS
════════════════════════════════════════════════════ */

function SnowSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Blizzard wind streaks */}
      {[12,28,45,62,78].map((y,i) => (
        <div key={i} className="absolute left-0 right-0" style={{
          top:`${y}%`,height:2,
          background:`linear-gradient(90deg,transparent,rgba(255,255,255,${0.14+i*.04}),transparent)`,
          animation:`aurora-wave ${3+i*.5}s ease-in-out ${i*.4}s infinite`}} />
      ))}
      {/* Snow on ground */}
      <div className="absolute bottom-0 left-0 right-0" style={{height:32,
        background:'rgba(255,255,255,0.72)',borderRadius:'60% 60% 0 0'}} />
      {/* Cool sky top */}
      <div className="absolute top-0 left-0 right-0" style={{height:'30%',
        background:'radial-gradient(ellipse at 50% 0%,rgba(224,242,254,0.28) 0%,transparent 70%)'}} />
    </div>
  )
}

function StormSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Storm cloud blobs */}
      {[[12,18,220,130],[42,12,260,150],[72,22,200,120],[90,16,160,100]].map(([x,y,w2,h2],i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:`${y}%`,width:w2,height:h2,
          background:`rgba(20,30,60,0.7)`,filter:'blur(20px)',transform:'translate(-50%,-50%)',
          animation:`nebula-breathe ${5+i*1.5}s ease-in-out ${i*1.2}s infinite`}} />
      ))}
      {/* Lightning glow hints */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 15%,rgba(147,197,253,0.04) 0%,transparent 60%)',
        animation:'lightning-hint 8s ease-in-out infinite'}} />
    </div>
  )
}

function OceanSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Caustic light shimmer */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 35% 20%,rgba(186,230,253,0.09) 0%,transparent 55%)',
        animation:'caustic-flow 7s ease-in-out infinite'}} />
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 68% 55%,rgba(125,211,252,0.06) 0%,transparent 50%)',
        animation:'caustic-flow 9s ease-in-out infinite reverse'}} />
      {/* Light rays from surface */}
      {[18,38,58,75].map((x,i) => (
        <div key={i} className="absolute top-0" style={{
          left:`${x}%`,width:40+i*12,height:'75%',
          background:'linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 80%)',
          transform:`rotate(${(i%2===0?-1:1)*(3+i*3)}deg)`,transformOrigin:'top center',
          animation:`light-ray-breathe ${4+i*.6}s ease-in-out ${i*.8}s infinite`}} />
      ))}
    </div>
  )
}

function ButterflyBgSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Soft pastel glow pools */}
      {[[20,30,'#f472b6'],[55,65,'#a78bfa'],[80,20,'#34d399'],[10,75,'#60a5fa']].map(([x,y,c],i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:`${y}%`,width:160,height:160,
          background:`radial-gradient(circle,${c}18 0%,transparent 70%)`,
          filter:'blur(18px)',transform:'translate(-50%,-50%)',
          animation:`nebula-breathe ${6+i}s ease-in-out ${i*1.5}s infinite`}} />
      ))}
    </div>
  )
}

function BlossomSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Branch silhouette */}
      <svg className="absolute top-0 left-0 w-full" style={{height:'45%'}}>
        <path d="M -60 160 Q 250 40 500 100 Q 750 155 1100 60 Q 1300 10 1500 80"
          stroke="rgba(120,60,40,0.25)" strokeWidth="12" fill="none" />
        <path d="M 150 90 Q 250 -10 360 45" stroke="rgba(120,60,40,0.18)" strokeWidth="7" fill="none" />
        <path d="M 650 85 Q 750 -15 900 30" stroke="rgba(120,60,40,0.18)" strokeWidth="7" fill="none" />
      </svg>
      {/* Pink bloom overlay */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 80%,rgba(253,164,175,0.12) 0%,transparent 60%)'}} />
    </div>
  )
}

function CloudSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Sun */}
      <div className="absolute" style={{
        top:'6%',right:'10%',width:90,height:90,
        background:'radial-gradient(circle,#fef9c3 0%,#fde68a 50%,rgba(251,191,36,0) 100%)',
        borderRadius:'50%',boxShadow:'0 0 70px rgba(251,191,36,0.5)',
        animation:'sun-pulse 3s ease-in-out infinite'}} />
      {/* Horizon glow */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height:'20%',
        background:'linear-gradient(0deg,rgba(59,130,246,0.25) 0%,transparent 100%)'}} />
    </div>
  )
}

function TropicalSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Large leaf shapes */}
      <svg className="absolute inset-0 w-full h-full">
        {[
          'M 0 80 Q 60 20 120 80 Q 60 140 0 80',
          'M 200 200 Q 280 120 360 200 Q 280 280 200 200',
          'M 80 340 Q 150 270 230 340 Q 150 410 80 340',
        ].map((d, i) => (
          <path key={i} d={d} fill={`rgba(16,185,129,${0.08 + i * 0.03})`}
            style={{animation:`piece-float ${8+i*2}s ease-in-out ${i*2}s infinite`}} />
        ))}
      </svg>
      {/* Warm top glow */}
      <div className="absolute top-0 left-0 right-0" style={{
        height:'40%',
        background:'radial-gradient(ellipse at 50% 0%,rgba(251,191,36,0.08) 0%,transparent 70%)'}} />
    </div>
  )
}

function ForestSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {[20,50,80].map((x,i) => (
        <div key={i} className="absolute top-0" style={{
          left:`${x}%`,width:50+i*20,height:'65%',
          background:'linear-gradient(180deg,rgba(255,255,255,0.07) 0%,transparent 100%)',
          transform:`rotate(${(i-1)*7}deg)`,transformOrigin:'top',
          animation:`light-shaft ${4+i}s ease-in-out ${i*.8}s infinite`}} />
      ))}
      <div className="absolute bottom-0 left-0 right-0" style={{height:90}}>
        <svg viewBox="0 0 560 90" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="280,0 240,90 320,90" fill="rgba(5,46,22,0.6)" style={{animation:'tree-sway-2 4s ease-in-out infinite'}} />
          <rect x="270" y="70" width="20" height="20" fill="rgba(92,64,42,0.5)" />
          <polygon points="100,20 70,90 130,90" fill="rgba(5,46,22,0.5)" style={{animation:'tree-sway-2 5s ease-in-out .5s infinite'}} />
          <polygon points="430,10 400,90 460,90" fill="rgba(5,46,22,0.55)" style={{animation:'tree-sway-2 3.5s ease-in-out 1s infinite'}} />
          <path d="M0,85 Q20,78 40,85 Q60,78 80,85 Q100,78 120,85 Q140,78 160,85 Q180,78 200,85 Q220,78 240,85 Q260,78 280,85 Q300,78 320,85 Q340,78 360,85 Q380,78 400,85 Q420,78 440,85 Q460,78 480,85 Q500,78 520,85 Q540,78 560,85 L560,90 L0,90 Z"
            fill="rgba(22,101,52,0.4)" />
        </svg>
      </div>
    </div>
  )
}

function VolcanoSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Volcano silhouette */}
      <div className="absolute bottom-0" style={{left:'50%',transform:'translateX(-50%)',width:'55%',zIndex:1}}>
        <svg viewBox="0 0 560 320" className="w-full h-auto" preserveAspectRatio="none">
          <polygon points="0,320 280,40 560,320" fill="rgba(15,7,0,0.75)" />
          <ellipse cx="280" cy="44" rx="72" ry="18" fill="rgba(40,10,0,0.8)" />
        </svg>
      </div>
      {/* Lava glow at base */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height:'30%',
        background:'radial-gradient(ellipse at 50% 100%,rgba(239,68,68,0.22) 0%,rgba(249,115,22,0.1) 50%,transparent 80%)'}} />
      {/* Smoke at top */}
      {[38,50,62].map((x,i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:'2%',width:60+i*20,height:60+i*20,
          background:'radial-gradient(circle,rgba(60,20,0,0.35) 0%,transparent 70%)',
          filter:'blur(14px)',transform:'translate(-50%,-50%)',
          animation:`steam-puff ${3+i*.6}s ease-out ${i*.4}s infinite`}} />
      ))}
    </div>
  )
}

function GalaxySVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {[[20,30,200,150,'#7c3aed'],[65,20,240,180,'#1d4ed8'],[45,70,180,140,'#be185d']].map(([x,y,w2,h2,c],i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:`${y}%`,width:w2,height:h2,
          background:`radial-gradient(ellipse,${c}18 0%,transparent 70%)`,
          filter:'blur(24px)',transform:'translate(-50%,-50%)',
          animation:`nebula-breathe ${5+i*1.5}s ease-in-out ${i*2}s infinite`}} />
      ))}
      <div className="absolute inset-0" style={{
        backgroundImage:'radial-gradient(circle,rgba(148,163,184,0.1) 1px,transparent 1px)',
        backgroundSize:'55px 55px'}} />
      <div className="absolute" style={{
        top:'14%',left:'8%',width:110,height:2,
        background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)',
        borderRadius:2,animation:'shooting-star-anim 14s linear 5s infinite'}} />
    </div>
  )
}

function AuroraSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Aurora ribbon layers */}
      {[
        { top:'18%', color1:'140', color2:'170', speed:'12s', delay:'0s', amp:'60px' },
        { top:'26%', color1:'200', color2:'220', speed:'9s',  delay:'2s', amp:'45px' },
        { top:'20%', color1:'280', color2:'300', speed:'15s', delay:'1s', amp:'50px' },
        { top:'30%', color1:'170', color2:'200', speed:'11s', delay:'3s', amp:'40px' },
      ].map((r,i) => (
        <div key={i} className="absolute left-0 right-0" style={{
          top:r.top,height:40+i*8,
          background:`linear-gradient(90deg,transparent 0%,hsla(${r.color1},100%,65%,0.5) 20%,hsla(${r.color2},100%,60%,0.65) 50%,hsla(${r.color1+30},100%,65%,0.5) 80%,transparent 100%)`,
          filter:'blur(6px)',
          animation:`aurora-wave ${r.speed} ease-in-out ${r.delay} infinite`}} />
      ))}
      {/* Moon */}
      <div className="absolute" style={{
        top:'8%',right:'12%',width:65,height:65,
        background:'radial-gradient(circle at 35% 35%,#fffde7,#fef9c3,#fef08a)',
        borderRadius:'50%',
        boxShadow:'0 0 35px rgba(254,240,138,0.35),0 0 70px rgba(254,240,138,0.15)'}} />
    </div>
  )
}

function HighwaySVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Road surface */}
      <div className="absolute left-0 right-0" style={{
        top:'35%',height:'50%',background:'rgba(55,65,81,0.9)'}} />
      {/* Road edges */}
      <div className="absolute left-0 right-0" style={{top:'35%',height:2,background:'rgba(255,255,255,0.55)'}} />
      <div className="absolute left-0 right-0" style={{top:'85%',height:2,background:'rgba(255,255,255,0.55)'}} />
      {/* City skyline */}
      <svg className="absolute top-0 left-0 w-full" style={{height:'36%'}}>
        <path d="M0,100 L0,60 L8,60 L8,30 L12,30 L12,50 L18,50 L18,15 L22,15 L22,45 L28,45 L28,25 L32,25 L32,55 L40,55 L40,20 L44,20 L44,40 L50,40 L50,10 L54,10 L54,35 L60,35 L60,50 L68,50 L68,22 L72,22 L72,45 L80,45 L80,30 L85,30 L85,55 L92,55 L92,35 L100,35 L100,100"
          fill="rgba(15,23,42,0.92)" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* Lane markers */}
      {[48,61,74].map((y,i) => (
        <div key={i} className="absolute left-0 right-0" style={{
          top:`${y}%`,height:2,opacity:0.55,
          background:'repeating-linear-gradient(90deg,#fbbf24 0,#fbbf24 25px,transparent 25px,transparent 45px)'}} />
      ))}
    </div>
  )
}

function HeartsSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      {/* Pulsing center glow */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 50%,rgba(236,72,153,0.2) 0%,rgba(190,24,93,0.07) 50%,transparent 80%)',
        animation:'lava-pulse 2s ease-in-out infinite'}} />
      {/* Sparkle dots */}
      {[[15,25],[70,15],[30,65],[80,55],[50,80],[85,30]].map(([x,y],i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:`${y}%`,width:5,height:5,
          background:`hsl(${320+i*10},100%,75%)`,
          boxShadow:`0 0 10px hsl(${320+i*10},100%,70%)`,
          animation:`firefly-blink ${1.5+i*.4}s ease-in-out ${i*.3}s infinite`}} />
      ))}
      {/* Top vignette */}
      <div className="absolute top-0 left-0 right-0" style={{
        height:'30%',
        background:'linear-gradient(180deg,rgba(74,0,32,0.45) 0%,transparent 100%)'}} />
    </div>
  )
}

function PlasmaSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:1}}>
      <svg className="absolute inset-0 w-full h-full">
        {['M5,50 L25,50 L25,20 L55,20 L55,50 L85,50',
          'M5,70 L30,70 L30,85 L65,85',
          'M50,10 L50,35 L80,35',
          'M15,80 L15,60 L45,60',
          'M70,15 L70,45 L90,45',
          'M0,30 L20,30 L20,55 L40,55'].map((d,i) => (
          <path key={i} d={d} fill="none" stroke="#a78bfa" strokeWidth="0.8"
            strokeDasharray="200" strokeLinecap="round"
            style={{animation:`circuit-trace ${2.5+i*.5}s ease-in-out ${i*.7}s infinite`,opacity:0.35}} />
        ))}
        {[[25,20],[55,50],[30,70],[50,35],[70,45]].map(([cx,cy],i) => (
          <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="3.5" fill="none"
            stroke="#a78bfa" strokeWidth="1" opacity="0.4"
            style={{animation:`neural-pulse ${1.8+i*.3}s ease-in-out ${i*.4}s infinite`}} />
        ))}
      </svg>
      {/* Energy glow */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 50%,rgba(167,139,250,0.06) 0%,transparent 60%)'}} />
    </div>
  )
}

const OVERLAYS = {
  water:   SnowSVG,
  light:   StormSVG,
  compass: OceanSVG,
  puzzle:  ButterflyBgSVG,
  chain:   BlossomSVG,
  books:   CloudSVG,
  cabinet: TropicalSVG,
  forest:  ForestSVG,
  mountain:VolcanoSVG,
  network: GalaxySVG,
  target:  AuroraSVG,
  blocks:  HighwaySVG,
  maze:    HeartsSVG,
  circuit: PlasmaSVG,
}

/* ════════════════════════════════════════════════════
   PUBLIC COMPONENT
════════════════════════════════════════════════════ */
export default function ThemeScene({ themeId, children, style, className }) {
  const bg = THEME_BG[themeId] || THEME_BG.network
  const Overlay = OVERLAYS[themeId]

  return (
    <div
      className={`relative overflow-hidden${className ? ' ' + className : ''}`}
      style={{ background: bg, ...style }}
    >
      {Overlay && <Overlay />}
      <ThemeCanvas themeId={themeId} />
      <div className="relative" style={{ zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </div>
  )
}
