import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'

/**
 * Layered network background.
 *
 * What changed from the flat version:
 *  - Three depth layers (far / mid / near) that parallax against page scroll,
 *    so the mesh has distance and the page feels like it moves through it.
 *  - Nodes sit on a jittered grid (even coverage, no empty patches or clumps),
 *    and links are computed from live proximity, so the mesh re-wires as it drifts.
 *  - Signals hop node to node along the links and light up each node they reach.
 *  - The cursor is a node: it links to the nearest nodes, so the visitor is part
 *    of the network.
 *
 * Reads --line, --node, --primary from CSS. Respects prefers-reduced-motion
 * (one static frame, no pointer or scroll reaction).
 */

const PAD = 160 // off-screen margin so nodes wrap without popping
const CURSOR_RADIUS = 230
const CURSOR_MAX_LINKS = 5
const SIGNAL_SPEED = 220 // px per second
const SIGNAL_TRAIL = 1.5 // seconds a travelled link stays lit
const MAX_SIGNALS = 3

type RGB = [number, number, number]

interface Colors {
  line: string
  node: string
  primary: string
  primaryRGB: RGB
}

interface LayerSpec {
  key: 'far' | 'mid' | 'near'
  density: number // nodes per 100k px²
  min: number
  radius: [number, number]
  parallax: number // fraction of scroll this layer travels
  link: number // max link distance, px
  lineAlpha: number
  nodeAlpha: number
  drift: number
  hubChance: number
  seed: number
}

const LAYERS: LayerSpec[] = [
  { key: 'far', density: 6, min: 18, radius: [0.9, 1.4], parallax: 0.06, link: 140, lineAlpha: 0.45, nodeAlpha: 0.6, drift: 10, hubChance: 0, seed: 11 },
  { key: 'mid', density: 4.2, min: 14, radius: [1.8, 2.6], parallax: 0.18, link: 215, lineAlpha: 0.9, nodeAlpha: 0.95, drift: 18, hubChance: 0.14, seed: 23 },
  { key: 'near', density: 0.5, min: 3, radius: [5, 10], parallax: 0.42, link: 0, lineAlpha: 0, nodeAlpha: 0.14, drift: 30, hubChance: 0, seed: 37 },
]

interface GNode {
  bx: number
  by: number
  x: number
  y: number
  r: number
  phase: number
  speed: number
  hub: boolean
  lit: number // 0..1, set to 1 when a signal arrives
}

interface Layer {
  spec: LayerSpec
  nodes: GNode[]
  fieldH: number
}

interface Segment {
  a: GNode
  b: GNode
  life: number
}

interface Signal {
  layer: Layer
  from: GNode
  to: GNode
  t: number
  hopsLeft: number
  visited: Set<GNode>
  segments: Segment[]
  done: boolean
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const mod = (n: number, m: number) => ((n % m) + m) % m

function parseRGB(value: string, fallback: RGB): RGB {
  const hex = value.trim().replace('#', '')
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
  }
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return [parseInt(hex[0] + hex[0], 16), parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16)]
  }
  return fallback
}

function readColors(): Colors {
  const s = getComputedStyle(document.documentElement)
  const primary = s.getPropertyValue('--primary').trim() || '#2563eb'
  return {
    line: s.getPropertyValue('--line').trim() || '#64748b',
    node: s.getPropertyValue('--node').trim() || '#94a3b8',
    primary,
    primaryRGB: parseRGB(primary, [37, 99, 235]),
  }
}

function makeGlowSprite([r, g, b]: RGB): HTMLCanvasElement {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g2 = c.getContext('2d')!
  const grad = g2.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`)
  grad.addColorStop(0.35, `rgba(${r},${g},${b},0.35)`)
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  g2.fillStyle = grad
  g2.fillRect(0, 0, size, size)
  return c
}

function buildLayer(spec: LayerSpec, w: number, h: number): Layer {
  const rand = mulberry32(spec.seed)
  const fieldH = h + PAD * 2
  const target = Math.max(spec.min, Math.round(((w * fieldH) / 1e5) * spec.density))
  const cell = Math.sqrt((w * fieldH) / target)
  const cols = Math.max(1, Math.round(w / cell))
  const rows = Math.max(1, Math.round(fieldH / cell))
  const cw = w / cols
  const ch = fieldH / rows

  const nodes: GNode[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const bx = (col + 0.15 + rand() * 0.7) * cw
      const by = (row + 0.15 + rand() * 0.7) * ch
      nodes.push({
        bx,
        by,
        x: bx,
        y: by - PAD,
        r: spec.radius[0] + rand() * (spec.radius[1] - spec.radius[0]),
        phase: rand() * Math.PI * 2,
        speed: 0.3 + rand() * 0.5,
        hub: rand() < spec.hubChance,
        lit: 0,
      })
    }
  }
  return { spec, nodes, fieldH }
}

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const { isDark } = useTheme()
  // Bumped when the theme changes so the draw loop re-reads CSS variables.
  const themeRef = useRef({ dirty: true })

  useEffect(() => {
    themeRef.current.dirty = true
  }, [isDark])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const motion = !reducedMotion
    let w = window.innerWidth
    let h = window.innerHeight
    let layers: Layer[] = []
    let colors = readColors()
    let sprite = makeGlowSprite(colors.primaryRGB)
    const signals: Signal[] = []
    let nextSpawn = 0.8

    const pointer = { x: 0, y: 0, active: false }
    const cursor = { x: 0, y: 0, strength: 0 }
    let scroll = 0
    let scrollSmooth = 0
    let raf = 0
    let last = performance.now()
    let clock = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      layers = LAYERS.map((spec) => buildLayer(spec, w, h))
      signals.length = 0
    }

    const onMove = (e: PointerEvent) => {
      if (!pointer.active) {
        cursor.x = e.clientX
        cursor.y = e.clientY
      }
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    }
    const onLeave = () => {
      pointer.active = false
    }
    const onTouchEnd = (e: PointerEvent) => {
      if (e.pointerType === 'touch') onLeave()
    }
    const onScroll = () => {
      scroll = window.scrollY
    }

    const refreshColors = () => {
      colors = readColors()
      sprite = makeGlowSprite(colors.primaryRGB)
    }

    const visible = (n: GNode) => n.y > -40 && n.y < h + 40 && n.x > -40 && n.x < w + 40

    const place = (dt: number) => {
      const t = clock
      const sy = scrollSmooth
      for (const layer of layers) {
        const { spec, nodes, fieldH } = layer
        for (const n of nodes) {
          let x = n.bx
          let y = mod(n.by - sy * spec.parallax, fieldH) - PAD
          if (motion) {
            x += Math.sin(t * n.speed + n.phase) * spec.drift + Math.cos(t * n.speed * 0.7 + n.phase) * spec.drift * 0.35
            y += Math.cos(t * n.speed * 0.9 + n.phase) * spec.drift + Math.sin(t * n.speed * 0.6 + n.phase) * spec.drift * 0.35
            if (cursor.strength > 0.01 && spec.key !== 'near') {
              const dx = cursor.x - x
              const dy = cursor.y - y
              const d = Math.hypot(dx, dy)
              if (d < CURSOR_RADIUS && d > 1) {
                const pull = (1 - d / CURSOR_RADIUS) * 16 * cursor.strength
                x += (dx / d) * pull
                y += (dy / d) * pull
              }
            }
          }
          n.x = x
          n.y = y
          if (n.lit > 0) n.lit = Math.max(0, n.lit - dt / 1.4)
        }
      }
    }

    const pickNext = (layer: Layer, from: GNode, visited: Set<GNode>): GNode | null => {
      const link = layer.spec.link
      const candidates: GNode[] = []
      for (const n of layer.nodes) {
        if (n === from || visited.has(n) || !visible(n)) continue
        if (Math.hypot(n.x - from.x, n.y - from.y) < link) candidates.push(n)
      }
      if (!candidates.length) return null
      return candidates[Math.floor(Math.random() * candidates.length)]
    }

    const spawnSignal = () => {
      const layer = layers[1]
      const onScreen = layer.nodes.filter(visible)
      if (!onScreen.length) return
      const hubs = onScreen.filter((n) => n.hub)
      const pool = hubs.length && Math.random() < 0.7 ? hubs : onScreen
      const start = pool[Math.floor(Math.random() * pool.length)]
      const visited = new Set<GNode>([start])
      const to = pickNext(layer, start, visited)
      if (!to) return
      start.lit = 1
      visited.add(to)
      signals.push({ layer, from: start, to, t: 0, hopsLeft: 3 + Math.floor(Math.random() * 4), visited, segments: [], done: false })
    }

    const stepSignals = (dt: number) => {
      for (const s of signals) {
        for (const seg of s.segments) seg.life -= dt / SIGNAL_TRAIL
        s.segments = s.segments.filter((seg) => seg.life > 0)
        if (s.done) continue

        const dist = Math.max(Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y), 1)
        s.t += (SIGNAL_SPEED * dt) / dist
        if (s.t >= 1) {
          s.to.lit = 1
          s.segments.push({ a: s.from, b: s.to, life: 1 })
          s.hopsLeft -= 1
          const next = s.hopsLeft > 0 ? pickNext(s.layer, s.to, s.visited) : null
          if (next) {
            s.visited.add(next)
            s.from = s.to
            s.to = next
            s.t = 0
          } else {
            s.done = true
          }
        }
      }
      for (let i = signals.length - 1; i >= 0; i--) {
        if (signals[i].done && signals[i].segments.length === 0) signals.splice(i, 1)
      }
    }

    const glow = (x: number, y: number, size: number, alpha: number) => {
      ctx.globalAlpha = alpha
      ctx.drawImage(sprite, x - size, y - size, size * 2, size * 2)
    }

    const drawLayer = (layer: Layer, breathe: number) => {
      const { spec, nodes } = layer

      if (spec.key === 'near') {
        // Soft out-of-focus discs in front of everything: pure depth cue.
        for (const n of nodes) {
          glow(n.x, n.y, n.r * 5, spec.nodeAlpha)
        }
        ctx.globalAlpha = 1
        return
      }

      // links
      // Links are batched into a few alpha buckets: one stroke per bucket, not per line.
      const BUCKETS = 6
      const paths = Array.from({ length: BUCKETS }, () => new Path2D())
      const link2 = spec.link * spec.link
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d2 = dx * dx + dy * dy
          if (d2 > link2) continue
          if ((a.y < -20 && b.y < -20) || (a.y > h + 20 && b.y > h + 20)) continue
          const closeness = 1 - Math.sqrt(d2) / spec.link
          const bucket = Math.min(BUCKETS - 1, Math.floor(closeness * BUCKETS))
          paths[bucket].moveTo(a.x, a.y)
          paths[bucket].lineTo(b.x, b.y)
        }
      }
      ctx.lineWidth = spec.key === 'mid' ? 1 : 0.8
      ctx.strokeStyle = colors.line
      for (let k = 0; k < BUCKETS; k++) {
        ctx.globalAlpha = ((k + 0.5) / BUCKETS) * spec.lineAlpha * breathe
        ctx.stroke(paths[k])
      }

      // nodes
      for (const n of nodes) {
        if (n.y < -20 || n.y > h + 20) continue
        if (n.hub) {
          const pulse = 0.85 + Math.sin(clock * 1.6 + n.phase) * 0.15
          glow(n.x, n.y, n.r * 7 * pulse, 0.32)
          ctx.globalAlpha = 1
          ctx.fillStyle = colors.primary
        } else {
          ctx.globalAlpha = spec.nodeAlpha
          ctx.fillStyle = colors.node
        }
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()

        if (n.lit > 0) {
          // arrival flash: filled core plus an expanding ring
          glow(n.x, n.y, n.r * 8 * (0.6 + n.lit * 0.4), 0.55 * n.lit)
          ctx.globalAlpha = n.lit
          ctx.fillStyle = colors.primary
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r * 1.4, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 0.5 * n.lit
          ctx.strokeStyle = colors.primary
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r * (2 + (1 - n.lit) * 9), 0, Math.PI * 2)
          ctx.stroke()
          ctx.strokeStyle = colors.line
        }
      }
      ctx.globalAlpha = 1
    }

    const drawSignals = () => {
      ctx.lineCap = 'round'
      for (const s of signals) {
        ctx.strokeStyle = colors.primary
        ctx.lineWidth = 1.4
        for (const seg of s.segments) {
          ctx.globalAlpha = seg.life * 0.7
          ctx.beginPath()
          ctx.moveTo(seg.a.x, seg.a.y)
          ctx.lineTo(seg.b.x, seg.b.y)
          ctx.stroke()
        }
        if (!s.done) {
          const px = s.from.x + (s.to.x - s.from.x) * s.t
          const py = s.from.y + (s.to.y - s.from.y) * s.t
          // lit leading edge of the current link
          ctx.globalAlpha = 0.7
          ctx.beginPath()
          ctx.moveTo(s.from.x, s.from.y)
          ctx.lineTo(px, py)
          ctx.stroke()
          glow(px, py, 14, 0.8)
          ctx.globalAlpha = 1
          ctx.fillStyle = colors.primary
          ctx.beginPath()
          ctx.arc(px, py, 2.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    const drawCursor = () => {
      if (cursor.strength < 0.01) return
      // Nearest nodes across far + mid layers, linked to the cursor.
      const near: { n: GNode; d: number }[] = []
      for (const layer of layers) {
        if (layer.spec.key === 'near') continue
        for (const n of layer.nodes) {
          const d = Math.hypot(n.x - cursor.x, n.y - cursor.y)
          if (d < CURSOR_RADIUS) near.push({ n, d })
        }
      }
      near.sort((a, b) => a.d - b.d)
      ctx.strokeStyle = colors.primary
      ctx.lineWidth = 1
      for (const { n, d } of near.slice(0, CURSOR_MAX_LINKS)) {
        ctx.globalAlpha = (1 - d / CURSOR_RADIUS) * 0.75 * cursor.strength
        ctx.beginPath()
        ctx.moveTo(cursor.x, cursor.y)
        ctx.lineTo(n.x, n.y)
        ctx.stroke()
        // linked nodes warm up slightly
        glow(n.x, n.y, n.r * 5, (1 - d / CURSOR_RADIUS) * 0.4 * cursor.strength)
      }
      glow(cursor.x, cursor.y, 22, 0.55 * cursor.strength)
      ctx.globalAlpha = cursor.strength
      ctx.fillStyle = colors.primary
      ctx.beginPath()
      ctx.arc(cursor.x, cursor.y, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    const render = (dt: number) => {
      if (themeRef.current.dirty) {
        refreshColors()
        themeRef.current.dirty = false
      }
      clock += dt
      if (motion) {
        scrollSmooth += (scroll - scrollSmooth) * (1 - Math.exp(-dt * 6))
        // the cursor node eases toward the pointer, and fades in / out
        const k = 1 - Math.exp(-dt * 12)
        cursor.x += (pointer.x - cursor.x) * k
        cursor.y += (pointer.y - cursor.y) * k
        cursor.strength += ((pointer.active ? 1 : 0) - cursor.strength) * (1 - Math.exp(-dt * 5))

        nextSpawn -= dt
        if (nextSpawn <= 0 && signals.length < MAX_SIGNALS) {
          spawnSignal()
          nextSpawn = 1.4 + Math.random() * 1.8
        }
      }

      place(dt)
      if (motion) stepSignals(dt)

      ctx.clearRect(0, 0, w, h)
      const breathe = 0.8 + Math.sin(clock * 0.8) * 0.2
      drawLayer(layers[0], breathe)
      drawLayer(layers[1], breathe)
      if (motion) {
        drawSignals()
        drawCursor()
      }
      drawLayer(layers[2], breathe)
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      render(dt)
      raf = requestAnimationFrame(loop)
    }

    const onResize = () => {
      resize()
      if (!motion) render(0)
    }

    resize()
    scroll = scrollSmooth = motion ? window.scrollY : 0

    window.addEventListener('resize', onResize)
    // Keep the static (reduced-motion) frame in sync with theme changes.
    const themeObserver = new MutationObserver(() => {
      themeRef.current.dirty = true
      if (!motion) render(0)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    if (motion) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
      window.addEventListener('pointerup', onTouchEnd)
      raf = requestAnimationFrame(loop)
    } else {
      render(0)
    }

    return () => {
      cancelAnimationFrame(raf)
      themeObserver.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointerup', onTouchEnd)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [reducedMotion])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Fine dot lattice: gives the mesh a surface to sit on. Fades out toward the edges. */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.28]"
        style={{
          backgroundImage: 'radial-gradient(var(--node) 1px, transparent 1.3px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 75% 65% at 62% 30%, #000 0%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 62% 30%, #000 0%, transparent 78%)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Colour wash, top and lower right */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,var(--accent-glow),transparent_55%)] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_85%,var(--accent-glow),transparent_45%)] opacity-40" />
      {/* Vignette keeps the edges calm so text stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_50%,var(--bg)_105%)] opacity-70" />
    </div>
  )
}
