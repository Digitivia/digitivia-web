import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReduced, scrollState } from '../lib/motion'

/** Seamless ticker whose speed rides the current scroll velocity. */
export default function Marquee({
  items,
  speed = 1,
  className = '',
  itemClassName = '',
}: {
  items: string[]
  speed?: number
  className?: string
  itemClassName?: string
}) {
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReduced()) return
    const el = track.current!
    let x = 0
    let half = el.scrollWidth / 2

    const measure = () => (half = el.scrollWidth / 2)
    window.addEventListener('resize', measure)

    const tick = () => {
      const boost = Math.min(Math.abs(scrollState.velocity) * 0.6, 9)
      x -= (0.55 + boost) * speed
      if (half > 0) {
        if (x <= -half) x += half
        if (x > 0) x -= half
      }
      el.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', measure)
    }
  }, [speed])

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div ref={track} className="flex w-max">
        {[...items, ...items].map((it, i) => (
          <span key={i} className={`flex items-center gap-10 pr-10 whitespace-nowrap ${itemClassName}`}>
            {it}
            <span className="text-amber/70">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
