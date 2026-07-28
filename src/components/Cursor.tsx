import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReduced } from '../lib/motion'

/**
 * Two-part cursor: a hard dot that tracks 1:1 and a ring that trails with
 * inertia. Elements opt in with data-cursor="link|hot" and data-label.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (prefersReduced()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const d = dot.current!
    const r = ring.current!
    const l = label.current!

    const dx = gsap.quickTo(d, 'x', { duration: 0.12, ease: 'power3.out' })
    const dy = gsap.quickTo(d, 'y', { duration: 0.12, ease: 'power3.out' })
    const rx = gsap.quickTo(r, 'x', { duration: 0.55, ease: 'power3.out' })
    const ry = gsap.quickTo(r, 'y', { duration: 0.55, ease: 'power3.out' })

    const move = (e: PointerEvent) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }

    const enter = (e: Event) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]')
      if (!el) return
      const hot = el.dataset.cursor === 'hot'
      l.textContent = el.dataset.label ?? ''
      gsap.to(r, {
        width: hot ? 92 : 58,
        height: hot ? 92 : 58,
        backgroundColor: hot ? '#a58cff' : 'rgba(165,140,255,0.12)',
        borderColor: hot ? 'rgba(165,140,255,0)' : '#a58cff',
        duration: 0.5,
        ease: 'expo.out',
      })
      gsap.to(d, { scale: hot ? 0 : 0.6, duration: 0.35, ease: 'expo.out' })
      gsap.to(l, { autoAlpha: hot ? 1 : 0, scale: 1, duration: 0.35, ease: 'expo.out' })
    }

    const leave = () => {
      gsap.to(r, {
        width: 36,
        height: 36,
        backgroundColor: 'rgba(165,140,255,0)',
        borderColor: 'rgba(165,140,255,0.5)',
        duration: 0.5,
        ease: 'expo.out',
      })
      gsap.to(d, { scale: 1, duration: 0.35, ease: 'expo.out' })
      gsap.to(l, { autoAlpha: 0, scale: 0.6, duration: 0.25 })
    }

    const down = () => gsap.to(r, { scale: 0.82, duration: 0.2, ease: 'power2.out' })
    const up = () => gsap.to(r, { scale: 1, duration: 0.4, ease: 'expo.out' })

    gsap.set([d, r], { xPercent: -50, yPercent: -50 })
    gsap.set(l, { autoAlpha: 0, scale: 0.6 })

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('pointerover', enter)
    document.querySelectorAll('[data-cursor]').forEach((el) =>
      el.addEventListener('pointerleave', leave),
    )

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerover', enter)
      document.querySelectorAll('[data-cursor]').forEach((el) =>
        el.removeEventListener('pointerleave', leave),
      )
    }
  }, [])

  return (
    <>
      <div
        ref={dot}
        className="cursor-dot"
        style={{ width: 6, height: 6, background: '#a58cff' }}
        aria-hidden
      />
      <div
        ref={ring}
        className="cursor-ring grid place-items-center"
        style={{ width: 36, height: 36, border: '1px solid rgba(165,140,255,0.5)' }}
        aria-hidden
      >
        <span
          ref={label}
          className="font-mono text-[0.55rem] tracking-[0.16em] uppercase whitespace-nowrap"
          style={{ color: '#04070a' }}
        />
      </div>
    </>
  )
}
