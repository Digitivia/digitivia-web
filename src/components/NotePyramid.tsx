import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Product } from '../data/catalog'
import { prefersReduced } from '../lib/motion'

/**
 * How a perfume wears, read top to bottom: what you smell first, what holds
 * the middle, and what is still there in the morning. Each band lights as it
 * arrives, so the reveal follows the order the nose meets them in.
 */
const BANDS = [
  { key: 'top', label: 'First', minutes: '0 — 20 min' },
  { key: 'heart', label: 'Heart', minutes: '20 min — 3 h' },
  { key: 'base', label: 'Stays', minutes: '3 h — the next day' },
] as const

export default function NotePyramid({ product }: { product: Product }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.np-band').forEach((band) => {
        gsap.fromTo(
          band,
          { autoAlpha: 0, y: 30, filter: 'blur(9px)' },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: { trigger: band, start: 'top 85%' },
          },
        )
        gsap.fromTo(
          band.querySelector('.np-rule'),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.4,
            ease: 'expo.out',
            transformOrigin: 'left center',
            scrollTrigger: { trigger: band, start: 'top 85%' },
          },
        )
      })
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [product.slug])

  return (
    <div ref={root} className="w-full">
      {BANDS.map(({ key, label, minutes }) => {
        const notes = product[key]
        if (!notes.length) return null
        return (
          <div key={key} className="np-band border-t border-line/70 py-7">
            <div
              className="np-rule h-px w-full"
              style={{ background: `linear-gradient(90deg, ${product.light}, transparent)` }}
            />
            <div className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <span className="w-16 font-mono text-[0.64rem] tracking-[0.22em] text-amber uppercase">
                {label}
              </span>
              <p className="flex-1 text-[clamp(1.15rem,1rem+0.7vw,1.7rem)] leading-snug">
                {notes.map((n, i) => (
                  <span key={n.name}>
                    {n.name}
                    {i < notes.length - 1 && <span className="text-muted">, </span>}
                  </span>
                ))}
              </p>
              <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                {minutes}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
