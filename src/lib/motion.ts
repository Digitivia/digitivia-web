import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { pushTrail } from './scene'

gsap.registerPlugin(ScrollTrigger)

/**
 * Honours the OS setting, but `?motion=full` (stored in localStorage) wins —
 * needed on machines where Windows animation effects are switched off.
 */
export const prefersReduced = () => {
  if (typeof window === 'undefined') return false
  const root = document.documentElement
  if (root.classList.contains('force-motion')) return false
  if (root.classList.contains('force-reduce')) return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Scroll progress of the whole document, 0..1, plus raw and smoothed velocity.
 * `smooth` is what visual effects should read: raw velocity spikes on every
 * wheel tick and would make anything driven by it twitch.
 */
export const scrollState = { progress: 0, velocity: 0, smooth: 0, direction: 1 }

if (typeof window !== 'undefined') {
  const ease = () => {
    scrollState.smooth += (scrollState.velocity - scrollState.smooth) * 0.12
    scrollState.velocity *= 0.86
    requestAnimationFrame(ease)
  }
  requestAnimationFrame(ease)
}

/**
 * Pointer in NDC (-1..1), tracked on the window rather than the canvas so the
 * field keeps responding under headings and copy.
 */
export const pointerState = { x: 0, y: 0, click: 0 }

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointerState.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerState.y = -((e.clientY / window.innerHeight) * 2 - 1)
      pushTrail(pointerState.x, pointerState.y, e.timeStamp)
    },
    { passive: true },
  )
  window.addEventListener('pointerdown', () => (pointerState.click = 1), { passive: true })
}

let lenisRef: Lenis | null = null

/** The live Lenis instance, or null under reduced motion. */
export const getLenis = () => lenisRef

/** Scroll to an element the way a person would — used by the auto tour. */
export function scrollToEl(sel: string, duration = 2) {
  const el = document.querySelector<HTMLElement>(sel)
  if (!el) return
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(el, { duration, offset: -40 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Scroll to an absolute document offset. */
export function scrollToY(y: number, duration = 2) {
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(y, { duration })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

/** Lenis inertial scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
    })
    lenisRef = lenis

    lenis.on('scroll', (e: { progress: number; velocity: number; direction: number }) => {
      scrollState.progress = e.progress
      scrollState.velocity = e.velocity
      if (e.direction) scrollState.direction = e.direction
      ScrollTrigger.update()
    })

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef = null
    }
  }, [])
}

/** Split a string into word spans wrapped in overflow-hidden masks. */
export function splitWords(el: HTMLElement) {
  const words = (el.textContent ?? '').trim().split(/\s+/)
  el.textContent = ''
  return words.map((w, i) => {
    const mask = document.createElement('span')
    mask.style.display = 'inline-block'
    mask.style.overflow = 'hidden'
    mask.style.verticalAlign = 'top'
    const inner = document.createElement('span')
    inner.style.display = 'inline-block'
    inner.textContent = w
    mask.appendChild(inner)
    el.appendChild(mask)
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '))
    return inner
  })
}
