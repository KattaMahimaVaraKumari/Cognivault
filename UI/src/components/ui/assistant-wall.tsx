"use client"

// Assistant Wall by Louis Studios.
// 140+ more hand-made React components at https://studios.lou15.com/?ref=21st-code

import * as React from "react"

/* Assistant Wall: a staggered wall of frosted glass assistant cards over a violet bloom.
   Every few seconds the wall hands the centre to the next card: the cards above leave
   first, each card a beat after the one above it, with a vertical motion blur that
   resolves into crisp type as the card settles. Measured layout units are "stage px"
   (a 864 px tall stage), scaled to the height of the component. */

export interface AssistantWallProps {
  /** Assistant messages shown on the cards. Use "\n" for explicit line breaks. The first third cycles through the centre column, the second third fills the columns to the right and the last third the columns to the left. */
  messages?: string[]
  /** Placeholder text on the hairline input row of every card. */
  placeholder?: string
  /** Seconds between automatic hand-offs to the next card. 0 turns auto-advance off. */
  interval?: number
  /** Playback speed of the hand-off motion. 1 matches the reference timing, 2 is twice as fast. */
  speed?: number
  /** Deep base colour of the backdrop (bottom and left of the frame). */
  background?: string
  /** Colour of the soft light blooming from the upper right. */
  glow?: string
  /** Saturated violet haze that carries the bloom across the top of the frame. */
  haze?: string
  /** Tint of the frosted glass cards. */
  glass?: string
  /** Deep accent used for the glossy avatar sphere and the round mic button. */
  accent?: string
  /** Colour of the message text, placeholder, hairline and mic glyph. */
  text?: string
  /** Font stack for all card text. */
  font?: string
  /** Wordmark printed on the avatar sphere in thin rounded lowercase. Long text scales down to fit. Empty string hides it. */
  badge?: string
  /** Called when a card is clicked and brought to the centre, with the index of its message in `messages`. */
  onSelect?: (index: number, message: string) => void
  /** Extra class name for the outer element. */
  className?: string
  /** Inline styles for the outer element (set a height here or on the parent). */
  style?: React.CSSProperties
}

// ---------- measured geometry (stage px, 864 px tall stage) ----------
const STAGE_H = 864
const CW = 379 // card width
const CH = 433 // card height
const RAD = 22 // card corner radius
const COLP = 454 // column pitch
const ROWP = 515 // row pitch
const ODD = -ROWP / 2 // vertical offset of odd columns
const BADGE_PX = 13 // "louis" spans about 40% of the sphere, as on the reference
const BADGE_MAX_W = 58 // longer badges scale down to this width
const GPAD = 600 // padding of the stage-space glass field around the stage
const CY = 1 // card centre sits 1 px below the stage centre

// ---------- measured hand-off motion (reference frames at 30 fps, displacement in stage px) ----------
// A: global settle before the move (the whole wall sinks a little), F: each card's own fast move,
// S: the long global glide into place. Total = one row pitch.
const A_T = [0, 0.1, 0.2, 0.2, 0.3, 0.5, 0.8, 1, 1.2, 1.5, 1.8, 2, 2.3, 2.7, 3.1, 3.5, 3.9, 4.4, 4.9, 5.4, 5.9, 6.6, 7.3, 8.1, 8.9, 9.9, 10.9, 11.9, 12.8, 13.9, 15, 16.4, 17.7, 19.4, 21, 22.4, 23.8, 24.6, 25.5, 25.8, 26]
const F_T = [0, -3.8, -8.7, -16.1, -27, -41, -59, -80.6, -106.2, -134.4, -163.8, -193.8, -223, -251.8, -278.2, -302.3, -324, -343.9, -362.5, -379.5, -395, -409.4, -422.5, -434.3, -444.4, -453.2, -460.8, -467.5, -473.2, -478, -482, -485.2, -487.8, -489.7, -490.8, -491.3]
const S_T = [0, -0.3, -0.5, -0.8, -1, -1.4, -1.8, -2.3, -2.8, -3.4, -3.9, -4.6, -5.2, -5.9, -6.6, -7.4, -8.1, -8.9, -9.7, -10.5, -11.3, -12.1, -12.9, -13.7, -14.5, -15.3, -16.1, -16.8, -17.5, -18.3, -19.1, -19.8, -20.5, -21.3, -22, -22.6, -23.3, -24, -24.6, -25.3, -25.9, -26.5, -27.1, -27.7, -28.3, -28.8, -29.4, -29.9, -30.5, -30.9, -31.5, -31.9, -32.4, -32.8, -33.3, -33.6, -34, -34.4, -34.7, -35.1, -35.4, -35.7, -36.1, -36.4, -36.7, -37, -37.3, -37.6, -37.9, -38.1, -38.4, -38.7, -39, -39.2, -39.5, -39.7, -40, -40.2, -40.4, -40.7, -40.9, -41.1, -41.3, -41.5, -41.8, -42, -42.2, -42.4, -42.5, -42.7, -42.9, -43.1, -43.3, -43.5, -43.6, -43.8, -44, -44.1, -44.3, -44.4, -44.6, -44.8, -44.9, -45, -45.2, -45.3, -45.5, -45.6, -45.7, -45.9, -46, -46.1, -46.2, -46.4, -46.5, -46.6, -46.7, -46.8, -46.9, -47, -47.1, -47.2, -47.3, -47.4, -47.5, -47.6, -47.7, -47.8, -47.9, -48, -48.1, -48.1, -48.2, -48.3, -48.4, -48.5, -48.5, -48.6, -48.7, -48.8, -48.8, -48.9, -49, -49, -49.1, -49.2, -49.2, -49.3, -49.3, -49.4, -49.4, -49.5, -49.5, -49.6, -49.7, -49.7, -49.8, -49.8, -49.8, -49.9, -49.9, -50, -50, -50.1, -50.1, -50.1, -50.2, -50.2, -50.3, -50.3, -50.3, -50.4, -50.4, -50.4, -50.5, -50.5, -50.5, -50.5, -50.6, -50.6, -50.6, -50.6, -50.7, -50.7]
const F_START = 25 // frame (after the settle begins) at which the centre card starts its move
const S_START = 60
const TOTAL = -516
const T_END = S_START + S_T.length - 1
const LAG = 12.8 // frames of lag per row pitch further back along the motion
const BLUR_K = 0.17 // motion blur sigma per px/frame of speed

function lookup(tab: number[], x: number) {
  if (x <= 0) return tab[0]
  const n = tab.length - 1
  if (x >= n) return tab[n]
  const i = Math.floor(x)
  const f = x - i
  return tab[i] + (tab[i + 1] - tab[i]) * f
}
/** normalised progress (0 to 1, slightly negative during the settle) of one card */
function prog(t: number, d: number) {
  if (t <= 0) return 0
  if (t >= T_END && t - F_START - d >= F_T.length) return 1
  return (lookup(A_T, t) + lookup(F_T, t - F_START - d) + lookup(S_T, t - S_START)) / TOTAL
}

// Rim light is a reflection of the room, so it depends on where an edge sits on screen (stage px from the centre).
const ss = (a: number, b: number, v: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const rimL = (y: number) => 0.08 + 0.92 * ss(-40, 25, y)
const rimR = (y: number) => 0.1 + 0.85 * ss(-5, 30, y) * (1 - ss(115, 150, y))
const rimT = (x: number, y: number) => {
  const d = x - 140
  const bump = Math.exp(-((d / (d < 0 ? 45 : 18)) ** 2) / 2)
  return 0.13 + 0.8 * bump * ss(-60, -160, y) + 0.12 * ss(150, 300, y)
}
const rimB = (x: number, y: number) => 0.07 + 0.16 * ss(40, -170, x) * ss(80, 180, y)
const H_OFF = [0, 0.03, 0.08, 0.16, 0.26, 0.36, 0.46, 0.56, 0.64, 0.72, 0.8, 0.88, 0.94, 0.97, 1] // stops along top and bottom edges
const V_OFF = [0, 0.1, 0.2, 0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78, 0.86, 0.93, 1] // stops along the straight side edges

type Move = { t0: number; dx: number; dy: number; bx: number; by: number }
type Cell = { c: number; r: number; key: string }

const isOdd = (c: number) => Math.abs(c) % 2 === 1
const cellX = (c: number) => c * COLP
const cellY = (c: number, r: number) => r * ROWP + (isOdd(c) ? ODD : 0)
const mod = (a: number, n: number) => ((a % n) + n) % n

let uidSeed = 0

function pickMessage(n: number, c: number, r: number) {
  if (!n) return -1
  const g = Math.ceil(n / 3)
  const centre = [0, g]
  const right = n > g ? [g, Math.min(n, 2 * g)] : centre
  const left = n > 2 * g ? [2 * g, n] : right
  const [a, b] = !isOdd(c) ? centre : c > 0 ? right : left
  return a + mod(r + (isOdd(c) ? 0 : Math.trunc(c / 2)), b - a)
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener?.("change", on)
    return () => mq.removeEventListener?.("change", on)
  }, [])
  return reduced
}

function noiseTile() {
  if (typeof document === "undefined") return ""
  try {
    const cv = document.createElement("canvas")
    cv.width = cv.height = 128
    const g = cv.getContext("2d")
    if (!g) return ""
    const im = g.createImageData(128, 128)
    for (let i = 0; i < im.data.length; i += 4) {
      const v = Math.random() * 255
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v
      im.data[i + 3] = 255
    }
    g.putImageData(im, 0, 0)
    return cv.toDataURL()
  } catch {
    return ""
  }
}

const MicGlyph = ({ color }: { color: string }) => (
  <svg width="43" height="43" viewBox="0 0 43 43" style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
    <rect x="17.8" y="10.4" width="7.8" height="15.6" rx="3.9" fill="none" stroke={color} strokeWidth="1.3" />
    <path d="M14 19.4 V21.4 A7.7 7.7 0 0 0 29.4 21.4 V19.4" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M21.7 29.2 V35 M17 35.1 H26.4" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

export function AssistantWall({
  messages = [
    "Hey student,\nready for your study reset?\nLet's pace yourself.",
    "Exam pressure feeling heavy?\nTake 3 deep box breaths\nand ease the tension.",
    "Oh, that sounds stressful.\nI scheduled a gentle stretch\nto unwind your neck & back.",
    "Your burnout check-in\nis ready to review.",
    "Sustainable study pacing\nis key to high retention\nand clear focus.",
    "Take a 5-minute walk break;\nyour eyes and posture\nwill thank you.",
  ],
  placeholder = "Start typing or speaking...",
  interval = 10,
  speed = 1,
  background = "#0d062d",
  glow = "#ff6fff",
  haze = "#aa23de",
  glass = "#7f70a7",
  accent = "#1d004e",
  text = "#f1ebf6",
  font = '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
  badge = "cognivault",
  onSelect,
  className,
  style,
}: AssistantWallProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [size, setSize] = React.useState({ w: 720, h: 864 })
  const [cells, setCells] = React.useState<Cell[]>([])
  const [uid] = React.useState(() => "aw" + (++uidSeed).toString(36))
  const [noise] = React.useState(noiseTile)
  const [badgePx, setBadgePx] = React.useState(BADGE_PX)
  React.useEffect(() => {
    if (!badge || typeof document === "undefined") return
    try {
      const g = document.createElement("canvas").getContext("2d")
      if (!g) return
      g.font = `300 ${BADGE_PX}px "SF Pro Rounded", ui-rounded, "Arial Rounded MT Bold", "Varela Round", ${font}`
      const w = g.measureText(badge).width + badge.length * 0.25
      setBadgePx(w > BADGE_MAX_W ? (BADGE_PX * BADGE_MAX_W) / w : BADGE_PX)
    } catch {
      /* keep the default size */
    }
  }, [badge, font])

  type CardEls = { root: HTMLDivElement; inner: HTMLDivElement; glass: HTMLDivElement | null; blur: SVGFEGaussianBlurElement | null; rim: SVGStopElement[][]; last: string }
  const els = React.useRef(new Map<string, CardEls>())
  const st = React.useRef({
    clock: 0,
    last: -1,
    moves: [] as Move[],
    base: { x: 0, y: 0 }, // offset of finished moves
    target: { x: 0, y: 0 }, // offset once every move has finished
    focus: { c: 0, r: 0 },
    nextAuto: interval > 0 ? interval : Infinity,
    hover: "",
    hoverAmt: new Map<string, number>(),
    cellKey: "",
  })
  const props = React.useRef({ interval, speed, reduced, onSelect, messages })
  props.current = { interval, speed, reduced, onSelect, messages }

  const s = size.h / STAGE_H
  const wr = size.w / s // stage width in stage px

  // messages: first third for even columns (centre), second third right odd columns, last third left odd columns
  const msgIndex = React.useCallback((c: number, r: number) => pickMessage(messages.length, c, r), [messages])

  // resize
  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // auto timer follows the interval prop
  React.useEffect(() => {
    const S = st.current
    S.nextAuto = interval > 0 ? (S.moves.length ? S.moves[S.moves.length - 1].t0 : 0) + interval : Infinity
    if (S.nextAuto < S.clock) S.nextAuto = S.clock + interval
  }, [interval])

  const neededCells = React.useCallback((): Cell[] => {
    const S = st.current
    const halfW = wr / 2 + CW
    const halfH = STAGE_H / 2 + CH
    const offs = [S.base, S.target, ...S.moves.map((m) => ({ x: m.bx, y: m.by }))]
    const xs = offs.map((o) => o.x)
    const ys = offs.map((o) => o.y)
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
    const out: Cell[] = []
    const c0 = Math.floor((-halfW - maxX) / COLP), c1 = Math.ceil((halfW - minX) / COLP)
    for (let c = c0; c <= c1; c++) {
      const x = cellX(c)
      if (x + maxX < -halfW || x + minX > halfW) continue
      const oy = isOdd(c) ? ODD : 0
      const r0 = Math.floor((-halfH - maxY - oy) / ROWP) - 1
      const r1 = Math.ceil((halfH - minY - oy) / ROWP) + 1
      for (let r = r0; r <= r1; r++) out.push({ c, r, key: c + ":" + r })
    }
    return out
  }, [wr])

  const select = React.useCallback((c: number, r: number) => {
    const S = st.current
    const P = props.current
    const dx = -(cellX(c) + S.target.x)
    const dy = -(cellY(c, r) + S.target.y)
    S.focus = { c, r }
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      const t0 = P.reduced ? S.clock - 1e5 : S.clock
      S.moves.push({ t0, dx, dy, bx: S.target.x, by: S.target.y })
      S.target = { x: S.target.x + dx, y: S.target.y + dy }
    }
    if (P.interval > 0) S.nextAuto = S.clock + P.interval
    if (P.reduced) requestAnimationFrame(() => frameRef.current())
    const i = pickMessage(P.messages.length, c, r)
    if (i >= 0 && P.onSelect) P.onSelect(i, P.messages[i])
  }, [])

  // per-frame layout
  const frame = React.useCallback(() => {
    const S = st.current
    const P = props.current
    // auto advance (scheduled on exact times so playback is deterministic)
    if (!P.reduced) {
      let guard = 0
      while (S.clock >= S.nextAuto && guard++ < 50) {
        const t0 = S.nextAuto
        S.focus = { c: S.focus.c, r: S.focus.r + 1 }
        const dy = -(cellY(S.focus.c, S.focus.r) + S.target.y)
        const dx = -(cellX(S.focus.c) + S.target.x)
        S.moves.push({ t0, dx, dy, bx: S.target.x, by: S.target.y })
        S.target = { x: S.target.x + dx, y: S.target.y + dy }
        S.nextAuto += P.interval > 0 ? P.interval : Infinity
      }
    }
    const fps = 30 * Math.max(0.05, P.speed)
    // fold finished moves into the base
    while (S.moves.length) {
      const m = S.moves[0]
      const tf = (S.clock - m.t0) * fps
      if (tf > T_END + 80 || P.reduced) {
        S.base = { x: S.base.x + m.dx, y: S.base.y + m.dy }
        S.moves.shift()
      } else break
    }
    const need = neededCells()
    const key = need.map((n) => n.key).join("|")
    if (key !== S.cellKey) {
      S.cellKey = key
      setCells(need)
    }
    const pos = (c: number, r: number, clock: number) => {
      let x = cellX(c) + S.base.x
      let y = cellY(c, r) + S.base.y
      for (const m of S.moves) {
        const len = Math.hypot(m.dx, m.dy) || 1
        const px = cellX(c) + m.bx, py = cellY(c, r) + m.by
        const ahead = -(px * m.dx + py * m.dy) / len // distance behind the leading edge
        const d = Math.max(-24, Math.min(80, (LAG * ahead) / ROWP))
        const g = prog((clock - m.t0) * fps, d)
        x += m.dx * g
        y += m.dy * g
      }
      return [x, y]
    }
    const dt = 0.5 / fps
    for (const cell of need) {
      const e = els.current.get(cell.key)
      if (!e) continue
      const [x, y] = pos(cell.c, cell.r, S.clock)
      const [x0, y0] = pos(cell.c, cell.r, S.clock - dt)
      const vx = Math.abs(x - x0) * 2, vy = Math.abs(y - y0) * 2 // stage px per reference frame
      const h0 = S.hoverAmt.get(cell.key) || 0
      const h = h0 + ((S.hover === cell.key ? 1 : 0) - h0) * 0.18
      if (Math.abs(h) > 0.001) S.hoverAmt.set(cell.key, h)
      else S.hoverAmt.delete(cell.key)
      const sharp = 1 - 0.85 * h
      // blur grows a little faster than speed: soft at the peak, crisp again as the card settles
      const bx = vx * BLUR_K * Math.pow(vx / 15, 0.35) * sharp, by = vy * BLUR_K * Math.pow(vy / 15, 0.35) * sharp
      const lift = h * 6
      e.root.style.transform = `translate(${(wr / 2 + x - CW / 2).toFixed(2)}px, ${(STAGE_H / 2 + CY + y - CH / 2 - lift).toFixed(2)}px) scale(${(1 + h * 0.018).toFixed(4)})`
      e.root.style.zIndex = h > 0.01 ? "2" : "1"
      e.root.style.setProperty("--aw-hover", h.toFixed(3))
      if (e.blur && (bx > 0.05 || by > 0.05)) {
        e.blur.setAttribute("stdDeviation", `${bx.toFixed(2)} ${by.toFixed(2)}`)
        e.inner.style.filter = `url(#${uid}-${cell.key.replace(":", "_").replace(/-/g, "m")})`
      } else e.inner.style.filter = "none"
      const sig = x.toFixed(1) + "," + y.toFixed(1) + "," + h.toFixed(2) + "," + wr.toFixed(1)
      if (sig !== e.last) {
        e.last = sig
        const X0 = x - CW / 2, Y0 = y + CY - CH / 2 - lift
        if (e.glass) e.glass.style.backgroundPosition = `${(-(wr / 2 + X0) - GPAD).toFixed(2)}px ${(-(STAGE_H / 2 + Y0) - GPAD).toFixed(2)}px`
        const hb = 0.25 * h
        const set = (arr: SVGStopElement[], vals: number[]) => {
          for (let i = 0; i < arr.length; i++) arr[i].setAttribute("stop-opacity", Math.min(1, vals[i] + hb).toFixed(3))
        }
        set(e.rim[0], H_OFF.map((o, i) => {
          const v = rimT(X0 + o * CW, Y0)
          return i <= 1 ? v + 0.05 * ss(-60, -160, Y0) : v
        }))
        set(e.rim[1], H_OFF.map((o, i) => {
          const v = rimB(X0 + o * CW, Y0 + CH)
          if (i <= 1) return Math.max(v, rimL(Y0 + CH - 8) * (i ? 0.55 : 0.85))
          if (i >= H_OFF.length - 2) return Math.max(v, rimR(Y0 + CH - 8) * 0.5)
          return v
        }))
        set(e.rim[2], V_OFF.map((o) => rimL(Y0 + RAD + o * (CH - 2 * RAD))))
        set(e.rim[3], V_OFF.map((o) => rimR(Y0 + RAD + o * (CH - 2 * RAD))))
      }
    }
  }, [neededCells, wr, uid])

  const frameRef = React.useRef(frame)
  frameRef.current = frame

  // animation loop with offscreen / hidden-tab pause (a still wall under reduced motion)
  React.useEffect(() => {
    const S = st.current
    let raf = 0
    let visible = true
    let inView = true
    const loop = (now: number) => {
      if (S.last >= 0) S.clock += Math.max(0, now - S.last) / 1000
      S.last = now
      frame()
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (raf || !visible || !inView) return
      S.last = -1
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    const onVis = () => {
      visible = document.visibilityState !== "hidden"
      if (visible && !props.current.reduced) start()
      else stop()
    }
    document.addEventListener("visibilitychange", onVis)
    let io: IntersectionObserver | null = null
    if (rootRef.current && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((en) => {
        inView = en[0]?.isIntersecting ?? true
        if (inView && !props.current.reduced) start()
        else stop()
      })
      io.observe(rootRef.current)
    }
    frame()
    if (!reduced) start()
    return () => {
      stop()
      io?.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [frame, reduced])

  React.useLayoutEffect(() => {
    frame()
  })

  // ---------- backdrop (fitted to the reference: haze band + upper right bloom) ----------
  // linear haze measured on a 720 x 864 frame anchored to the right edge, re-expressed in px for any width
  const PHI = 197.7
  const a = (PHI * Math.PI) / 180
  const dir = [Math.sin(a), -Math.cos(a)]
  const Lref = Math.abs(720 * Math.sin(a)) + Math.abs(864 * Math.cos(a))
  const Lact = Math.abs(wr * Math.sin(a)) + Math.abs(864 * Math.cos(a))
  const shift = (wr - 360 - wr / 2) * dir[0]
  const at = (t: number) => (Lact / 2 + (t - 0.5) * Lref + shift).toFixed(1) + "px"
  const hz = (p: number) => `color-mix(in srgb, ${haze} ${p}%, transparent)`
  const gl = (p: number) => `color-mix(in srgb, ${glow} ${p}%, transparent)`
  const bloomX = wr - 720 + 755.5
  const backdrop = [
    `radial-gradient(circle 824px at ${bloomX.toFixed(1)}px 47.6px, ${gl(97.1)} 0px, ${gl(56.9)} 164.8px, ${gl(37)} 329.6px, ${gl(7.8)} 494.3px, ${gl(0.4)} 659px, ${gl(0)} 824px)`,
    `linear-gradient(${PHI}deg, ${hz(75.2)} ${at(0)}, ${hz(78)} ${at(0.15)}, ${hz(56.8)} ${at(0.3)}, ${hz(12.6)} ${at(0.45)}, ${hz(5.9)} ${at(0.6)}, ${hz(4.4)} ${at(0.8)}, ${hz(0)} ${at(1)})`,
    background,
  ].join(", ")

  // glass field (fitted to the reference card interiors): base, violet band, white bloom light, lilac floor light
  const GPHI = 227.4
  const ga = (GPHI * Math.PI) / 180
  const gdx = Math.sin(ga)
  const gL = Math.abs(720 * Math.sin(ga)) + Math.abs(864 * Math.cos(ga))
  const gLp = Math.abs((wr + 2 * GPAD) * Math.sin(ga)) + Math.abs((STAGE_H + 2 * GPAD) * Math.cos(ga))
  const gat = (t: number) => ((t - 0.5) * gL + (wr / 2 - 360) * gdx + gLp / 2).toFixed(1) + "px"
  const gBase = `color-mix(in srgb, ${glass} 40%, ${background})`
  const gBand = `color-mix(in srgb, ${glass} 50%, ${haze})`
  const gLight = `color-mix(in srgb, ${glow} 8%, #f2e8f8)`
  const gFloor = `color-mix(in srgb, ${glass} 72%, ${glow})`
  const cm = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`
  const gx = (x: number) => (wr / 2 - 360 + x + GPAD).toFixed(1) + "px"
  const gy = (y: number) => (y + GPAD).toFixed(1) + "px"
  const glassField = [
    `radial-gradient(ellipse 230px 250px at ${gx(300)} ${gy(540)}, rgba(14, 0, 40, 0.075), rgba(14, 0, 40, 0.05) 60%, rgba(14, 0, 40, 0) 100%)`,
    `radial-gradient(ellipse 130px 92px at ${gx(260)} ${gy(380)}, rgba(14, 0, 40, 0.2), rgba(14, 0, 40, 0.09) 55%, rgba(14, 0, 40, 0) 100%)`,
    `radial-gradient(ellipse 112px 232px at ${gx(515)} ${gy(455)}, rgba(240, 214, 255, 0.1), rgba(240, 214, 255, 0.05) 55%, rgba(240, 214, 255, 0) 100%)`,
    `radial-gradient(circle 482.3px at ${(165.1 + GPAD).toFixed(1)}px ${(740.4 + GPAD).toFixed(1)}px, ${cm(gFloor, 100)} 0px, ${cm(gFloor, 72.6)} 120.6px, ${cm(gFloor, 24.9)} 241.2px, ${cm(gFloor, 19.4)} 361.7px, ${cm(gFloor, 0)} 482.3px)`,
    `radial-gradient(ellipse 212px 305px at ${(730 + wr - 720 + GPAD).toFixed(1)}px ${(62 + GPAD).toFixed(1)}px, ${cm(gLight, 96)} 0%, ${cm(gLight, 72)} 35%, ${cm(gLight, 33)} 66%, ${cm(gLight, 0)} 100%)`,
    `linear-gradient(${GPHI}deg, ${cm(gBand, 100)} ${gat(0)}, ${cm(gBand, 94.6)} ${gat(0.2)}, ${cm(gBand, 45.9)} ${gat(0.4)}, ${cm(gBand, 0)} ${gat(0.6)}, ${cm(gBand, 0)} ${gat(0.8)}, ${cm(gBand, 33)} ${gat(1)})`,
    gBase,
  ].join(", ")
  const tx = (p: number) => `color-mix(in srgb, ${text} ${p}%, transparent)`
  const rimColor = `color-mix(in srgb, ${text} 80%, #f0d8ff)`
  const line = `color-mix(in srgb, ${text} 72%, #c9a2ff)`
  const ac = (p: number, w: string) => `color-mix(in srgb, ${accent} ${p}%, ${w})`

  const card = (cell: Cell) => {
    const mi = msgIndex(cell.c, cell.r)
    const msg = mi >= 0 ? messages[mi] : ""
    const fid = `${uid}-${cell.key.replace(":", "_").replace(/-/g, "m")}`
    return (
      <div
        key={cell.key}
        ref={(el) => {
          if (el) {
            const inner = el.firstElementChild as HTMLDivElement
            const blur = el.querySelector("feGaussianBlur") as SVGFEGaussianBlurElement | null
            const rim = ["t", "b", "l", "r"].map((k) => Array.from(el.querySelectorAll(`[data-rim="${k}"] stop`)) as SVGStopElement[])
            const glassEl = el.querySelector("[data-glass]") as HTMLDivElement | null
            els.current.set(cell.key, { root: el, inner, glass: glassEl, blur, rim, last: "" })
          } else els.current.delete(cell.key)
        }}
        role="button"
        tabIndex={0}
        aria-label={msg ? msg.replace(/\n/g, " ") : "Assistant card"}
        onPointerEnter={() => (st.current.hover = cell.key)}
        onPointerLeave={() => {
          if (st.current.hover === cell.key) st.current.hover = ""
        }}
        onClick={() => select(cell.c, cell.r)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            select(cell.c, cell.r)
          }
        }}
        style={{ position: "absolute", left: 0, top: 0, width: CW, height: CH, willChange: "transform", cursor: "pointer", outline: "none", transformOrigin: "50% 50%" }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          {/* glass body: the frosted glass picks up the room light, so its shading lives in stage space */}
          <div
            data-glass=""
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: RAD,
              background: glassField,
              backgroundSize: `${wr + 2 * GPAD}px ${STAGE_H + 2 * GPAD}px`,
              backgroundRepeat: "no-repeat",
              boxShadow: "0 22px 46px -18px rgba(8, 0, 28, calc(0.35 + var(--aw-hover, 0) * 0.25))",
            }}
          />
          {/* sheen: lit right side, shaded upper left, soft diagonal light bands and a warm mauve patch low on the card */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: RAD,
              pointerEvents: "none",
              background: [
                "radial-gradient(ellipse 200px 110px at 92px 405px, rgba(240, 196, 232, 0.04), rgba(240, 196, 232, 0) 100%)",
                "linear-gradient(140deg, rgba(255, 228, 250, 0) 46%, rgba(255, 228, 250, 0.03) 55%, rgba(255, 228, 250, 0) 63%, rgba(255, 228, 250, 0) 71%, rgba(255, 228, 250, 0.025) 79%, rgba(255, 228, 250, 0) 87%)",
              ].join(", "),
            }}
          />
          {/* rim light: four edge strokes whose brightness follows the card across the screen */}
          <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} aria-hidden="true">
            <defs>
              {(["t", "b"] as const).map((k) => (
                <linearGradient key={k} id={`${fid}-r${k}`} data-rim={k} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={CW} y2="0">
                  {H_OFF.map((o) => (
                    <stop key={o} offset={o} style={{ stopColor: rimColor }} stopOpacity="0.2" />
                  ))}
                </linearGradient>
              ))}
              {(["l", "r"] as const).map((k) => (
                <linearGradient key={k} id={`${fid}-r${k}`} data-rim={k} gradientUnits="userSpaceOnUse" x1="0" y1={RAD} x2="0" y2={CH - RAD}>
                  {V_OFF.map((o) => (
                    <stop key={o} offset={o} style={{ stopColor: rimColor }} stopOpacity="0.2" />
                  ))}
                </linearGradient>
              ))}
            </defs>
            <g fill="none" strokeWidth="2" transform="translate(-0.5 -0.5) scale(1.00264 1.00231)">
              <path d={`M1 ${RAD} A${RAD - 1} ${RAD - 1} 0 0 1 ${RAD} 1 H${CW - RAD} A${RAD - 1} ${RAD - 1} 0 0 1 ${CW - 1} ${RAD}`} stroke={`url(#${fid}-rt)`} />
              <path d={`M1 ${CH - RAD} A${RAD - 1} ${RAD - 1} 0 0 0 ${RAD} ${CH - 1} H${CW - RAD} A${RAD - 1} ${RAD - 1} 0 0 0 ${CW - 1} ${CH - RAD}`} stroke={`url(#${fid}-rb)`} />
              <path d={`M1 ${RAD} V${CH - RAD}`} stroke={`url(#${fid}-rl)`} />
              <path d={`M${CW - 1} ${RAD} V${CH - RAD}`} stroke={`url(#${fid}-rr)`} />
            </g>
          </svg>
          {/* avatar sphere */}
          <div
            style={{
              position: "absolute",
              left: 23.5,
              top: 24.5,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: [
                "radial-gradient(ellipse 13% 9% at 73% 25%, rgba(255, 238, 250, 0.95), rgba(255, 232, 248, 0.45) 50%, rgba(255, 232, 248, 0) 100%)",
                "radial-gradient(ellipse 24% 20% at 74% 31%, rgba(255, 214, 244, 0.42), rgba(255, 214, 244, 0.16) 55%, rgba(255, 214, 244, 0) 100%)",
                "radial-gradient(ellipse 40.6% 72.1% at 2% -20.8%, rgba(255, 216, 255, 1), rgba(255, 216, 255, 0.5) 55%, rgba(255, 216, 255, 0) 100%)",
                "radial-gradient(ellipse 26.3% 27.9% at 100.4% 42.7%, rgba(255, 160, 227, 1), rgba(255, 160, 227, 0.5) 55%, rgba(255, 160, 227, 0) 100%)",
                "radial-gradient(ellipse 28.2% 25.2% at 58.2% 38.4%, rgba(135, 92, 194, 1), rgba(135, 92, 194, 0.5) 55%, rgba(135, 92, 194, 0) 100%)",
                "radial-gradient(ellipse 37.3% 18.4% at 72.3% 30.9%, rgba(255, 198, 224, 1), rgba(255, 198, 224, 0.5) 55%, rgba(255, 198, 224, 0) 100%)",
                "radial-gradient(ellipse 67.2% 14.1% at 34.8% 18.4%, rgba(0, 0, 74, 1), rgba(0, 0, 74, 0.5) 55%, rgba(0, 0, 74, 0) 100%)",
                "radial-gradient(ellipse 23.3% 10% at 72.6% 20.1%, rgba(255, 0, 255, 1), rgba(255, 0, 255, 0.5) 55%, rgba(255, 0, 255, 0) 100%)",
                "radial-gradient(ellipse 46% 40% at 30% 78%, rgba(4, 2, 38, 0.7), rgba(4, 2, 38, 0) 100%)",
                `radial-gradient(circle 56px at 39.7% 104.4%, ${ac(35, "#060014")} 0%, ${ac(55, "#060014")} 40%, ${accent} 75%, ${ac(60, "#5a3ab0")} 100%)`,
              ].join(", "),
              boxShadow: "inset -2px -3px 5px rgba(196, 140, 255, 0.32), inset 2px 2px 3px rgba(255, 220, 255, 0.12), 0 5px 9px rgba(12, 0, 36, 0.38)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                padding: 1,
                background:
                  "conic-gradient(from 0deg, rgba(255, 236, 255, 0.3) 0deg, rgba(255, 236, 255, 0.75) 32deg, rgba(255, 236, 255, 0.6) 52deg, rgba(255, 236, 255, 0) 90deg, rgba(255, 236, 255, 0) 250deg, rgba(255, 236, 255, 0.22) 290deg, rgba(255, 236, 255, 0.55) 320deg, rgba(255, 236, 255, 0.3) 360deg)",
                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", // ls:keep
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)", // ls:keep
              }}
            />
            {badge ? (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  textAlign: "center",
                  fontFamily: `"SF Pro Rounded", ui-rounded, "Arial Rounded MT Bold", "Varela Round", ${font}`,
                  fontSize: badgePx,
                  lineHeight: 1,
                  letterSpacing: 0.25,
                  fontWeight: 300,
                  color: "rgba(196, 150, 236, 0.95)",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                {badge}
              </div>
            ) : null}
          </div>
          {/* message */}
          <div
            style={{
              position: "absolute",
              left: 26.5,
              right: 22,
              top: 139,
              fontFamily: font,
              fontSize: 25.6,
              lineHeight: "28.6px",
              fontWeight: 350,
              letterSpacing: -0.05,
              color: text,
              whiteSpace: "pre-line",
              WebkitFontSmoothing: "antialiased",
            }}
          >
            {msg}
          </div>
          {/* hairline input */}
          <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
            <defs>
              <linearGradient id={fid + "-l"} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={CW} y2="0">
                <stop offset="0" style={{ stopColor: line, stopOpacity: 0.2 }} />
                <stop offset="0.45" style={{ stopColor: line, stopOpacity: 0.17 }} />
                <stop offset="0.68" style={{ stopColor: line, stopOpacity: 0.45 }} />
                <stop offset="0.8" style={{ stopColor: line, stopOpacity: 1 }} />
                <stop offset="0.9" style={{ stopColor: line, stopOpacity: 1 }} />
                <stop offset="1" style={{ stopColor: line, stopOpacity: 0.65 }} />
              </linearGradient>
              <filter id={fid} x="-20%" y="-25%" width="140%" height="150%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="0 0" />
              </filter>
            </defs>
            <path
              d={`M0.6 ${328.5 + 22} A22 22 0 0 1 22.6 328.5 H299.6 M342.4 328.5 H${CW - 22.6} A22 22 0 0 1 ${CW - 0.6} ${328.5 + 22}`}
              fill="none"
              stroke={`url(#${fid}-l)`}
              strokeWidth="1.3"
            />
          </svg>
          {/* placeholder */}
          <div
            style={{
              position: "absolute",
              left: 26.5,
              top: 347.5,
              fontFamily: font,
              fontSize: 14.6,
              lineHeight: "17px",
              letterSpacing: -0.1,
              color: tx(86),
              whiteSpace: "nowrap",
              WebkitFontSmoothing: "antialiased",
            }}
          >
            {placeholder}
          </div>
          {/* mic button */}
          <div
            style={{
              position: "absolute",
              left: 321 - 21.5,
              top: 333 - 21.5,
              width: 43,
              height: 43,
              borderRadius: "50%",
              background: ac(22, "#14031f"),
              boxShadow: "0 0 0 1.6px rgba(122, 34, 150, 0.95), 0 0 5px 1.5px rgba(200, 70, 220, 0.35)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -1.5,
                borderRadius: "50%",
                padding: 1.1,
                background:
                  "conic-gradient(from 0deg, rgba(255, 240, 255, 0.85) 0deg, rgba(255, 240, 255, 0) 14deg, rgba(255, 240, 255, 0) 60deg, rgba(255, 240, 255, 0.9) 82deg, rgba(255, 240, 255, 0.95) 92deg, rgba(255, 240, 255, 0.35) 108deg, rgba(255, 240, 255, 0) 122deg, rgba(255, 240, 255, 0) 232deg, rgba(255, 240, 255, 0.8) 252deg, rgba(255, 240, 255, 0.95) 268deg, rgba(255, 240, 255, 0.9) 280deg, rgba(255, 240, 255, 0.3) 298deg, rgba(255, 240, 255, 0) 312deg, rgba(255, 240, 255, 0) 346deg, rgba(255, 240, 255, 0.85) 360deg)",
                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", // ls:keep
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)", // ls:keep
              }}
            />
            <MicGlyph color={tx(92)} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%", minHeight: 420, background, isolation: "isolate", ...style }}
    >
      <div
        style={{ position: "absolute", left: 0, top: 0, width: wr, height: STAGE_H, transform: `scale(${s})`, transformOrigin: "0 0" }}
      >
        <div style={{ position: "absolute", inset: 0, background: backdrop }} />
        {cells.map(card)}
      </div>
      {noise ? (
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: `url(${noise})`, backgroundSize: "128px 128px", opacity: 0.022, mixBlendMode: "overlay" }}
        />
      ) : null}
    </div>
  )
}

export default AssistantWall
