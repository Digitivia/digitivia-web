import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis, prefersReduced } from './motion'

/**
 * The auto tour: one click and the page scrolls itself, continuously, at the
 * speed a person reads — no jumps between sections. The only stop is the live
 * console, which holds still until all three conversations have played out.
 */

const PX_PER_SEC = 118 // reading pace; the whole page lands around 90 seconds
const EASE_IN_MS = 900 // roll up to speed instead of snapping into motion

const listeners = new Set<(s: TourSnapshot) => void>()
export type TourSnapshot = { running: boolean; label: string; progress: number }

let snapshot: TourSnapshot = { running: false, label: '', progress: 0 }
let cancelled = false

/** LiveConsole registers itself here so the tour can drive the conversations. */
export const liveControl: { playAll?: () => Promise<void> } = {}

if (import.meta.env.DEV) {
  ;(window as unknown as { __tour: unknown }).__tour = { liveControl }
}

export function subscribeTour(fn: (s: TourSnapshot) => void) {
  listeners.add(fn)
  fn(snapshot)
  return () => listeners.delete(fn)
}

function emit(patch: Partial<TourSnapshot>) {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((fn) => fn(snapshot))
}

export const isTourRunning = () => snapshot.running

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const CHAPTERS: { id: string; label: string }[] = [
  { id: '#top', label: 'From signal to system' },
  { id: '#platform', label: 'The platform' },
  { id: '#live', label: 'Live conversations' },
  { id: '#brands', label: 'Cartiva & Opsy' },
  { id: '#pipeline', label: 'How it works' },
  { id: '#proof', label: 'Proof' },
  { id: '#contact', label: 'Book a demo' },
]

function currentChapter() {
  const mid = window.scrollY + window.innerHeight * 0.45
  let label = CHAPTERS[0].label
  for (const c of CHAPTERS) {
    const el = document.querySelector<HTMLElement>(c.id)
    if (el && el.getBoundingClientRect().top + window.scrollY <= mid) label = c.label
  }
  return label
}

export function stopTour() {
  if (!snapshot.running) return
  cancelled = true
}

export async function startTour({ fullscreen = true } = {}) {
  if (snapshot.running) return
  cancelled = false

  if (fullscreen && !document.fullscreenElement) {
    // best-effort — a denied request must never break the tour
    try {
      await document.documentElement.requestFullscreen()
      await sleep(450)
    } catch {
      /* filming in a window is fine too */
    }
  }

  document.body.classList.add('tour-on')
  emit({ running: true, label: CHAPTERS[0].label, progress: 0 })

  const lenis = getLenis()
  lenis?.stop() // the tour owns the scroll position for its duration

  // any real input from the user hands control straight back
  const bail = () => stopTour()
  window.addEventListener('wheel', bail, { passive: true })
  window.addEventListener('touchstart', bail, { passive: true })

  const maxY = () => document.documentElement.scrollHeight - window.innerHeight
  let y = window.scrollY
  let paused = false
  let livePlayed = false

  await new Promise<void>((done) => {
    let last = performance.now()
    const started = last
    let ending = false

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (cancelled) return done()

      if (!paused) {
        // ease into motion so the first second doesn't look mechanical
        const ramp = Math.min(1, (now - started) / EASE_IN_MS)
        y = Math.min(y + PX_PER_SEC * ramp * dt, maxY())
        window.scrollTo(0, y)
        ScrollTrigger.update()

        emit({ label: currentChapter(), progress: maxY() > 0 ? y / maxY() : 1 })

        // hold on the console while the three channels play
        const live = document.querySelector<HTMLElement>('#live')
        if (!livePlayed && live) {
          const top = live.getBoundingClientRect().top
          if (top <= window.innerHeight * 0.16) {
            livePlayed = true
            paused = true
            ;(liveControl.playAll?.() ?? sleep(4000)).then(async () => {
              await sleep(700)
              last = performance.now()
              paused = false
            })
          }
        }

        if (y >= maxY() - 1 && !ending) {
          // sit on the closing frame for a beat before handing back
          ending = true
          paused = true
          sleep(2600).then(() => {
            cancelled = true
            done()
          })
        }
      }

      requestAnimationFrame(frame)
    }

    if (prefersReduced()) {
      window.scrollTo(0, maxY())
      done()
    } else {
      requestAnimationFrame(frame)
    }
  })

  window.removeEventListener('wheel', bail)
  window.removeEventListener('touchstart', bail)
  lenis?.start()
  document.body.classList.remove('tour-on')
  emit({ running: false, label: '', progress: 0 })
}
