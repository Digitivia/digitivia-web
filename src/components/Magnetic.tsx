import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { prefersReduced } from '../lib/motion'

/** Wraps a control so it leans toward the pointer and springs back on exit. */
export default function Magnetic({
  children,
  strength = 0.45,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReduced()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const el = box.current!
    const child = el.firstElementChild as HTMLElement | null
    if (!child) return

    const x = gsap.quickTo(child, 'x', { duration: 0.5, ease: 'power3.out' })
    const y = gsap.quickTo(child, 'y', { duration: 0.5, ease: 'power3.out' })

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * strength)
      y((e.clientY - (r.top + r.height / 2)) * strength * 1.3)
    }
    const out = () => {
      gsap.to(child, { x: 0, y: 0, duration: 0.85, ease: 'elastic.out(1,0.4)' })
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', out)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', out)
    }
  }, [strength])

  return (
    <div ref={box} className={`inline-block ${className}`}>
      {children}
    </div>
  )
}
