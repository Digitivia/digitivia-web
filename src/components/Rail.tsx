import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReduced } from '../lib/motion'

const MARKS = [
  { id: 'top', label: 'Signal' },
  { id: 'platform', label: 'Platform' },
  { id: 'live', label: 'Live' },
  { id: 'brands', label: 'Brands' },
  { id: 'pipeline', label: 'Method' },
  { id: 'proof', label: 'Proof' },
  { id: 'contact', label: 'Start' },
]

/** Fixed chapter rail: where you are in the page, and how far is left. */
export default function Rail() {
  const [active, setActive] = useState(0)
  const fill = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (prefersReduced()) return

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.set(fill.current, { scaleY: self.progress, transformOrigin: 'top center' })
      },
    })

    const triggers = MARKS.map((m, i) =>
      ScrollTrigger.create({
        trigger: `#${m.id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(i),
      }),
    )

    return () => {
      st.kill()
      triggers.forEach((t) => t.kill())
    }
  }, [])

  return (
    <nav
      aria-label="Page sections"
      className="pointer-events-none fixed top-1/2 right-[max(1rem,2.5vw)] z-50 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
    >
      <span className="absolute top-0 right-[3px] h-full w-px bg-line">
        <span ref={fill} className="block h-full w-full scale-y-0 bg-linear-to-b from-violet to-lift" />
      </span>

      {MARKS.map((m, i) => {
        const on = i === active
        return (
          <a
            key={m.id}
            href={`#${m.id}`}
            data-cursor="link"
            className="pointer-events-auto group flex items-center gap-3 pr-2"
          >
            <span
              className="font-mono text-[0.58rem] tracking-[0.2em] uppercase transition-all duration-500"
              style={{
                color: on ? 'var(--color-ink)' : 'var(--color-muted)',
                opacity: on ? 1 : 0,
                transform: on ? 'none' : 'translateX(8px)',
              }}
            >
              {m.label}
            </span>
            <span
              className="size-[7px] rounded-full border transition-all duration-500"
              style={{
                borderColor: on ? 'var(--color-lift)' : 'var(--color-line)',
                background: on ? 'var(--color-lift)' : 'transparent',
                transform: on ? 'scale(1)' : 'scale(0.6)',
              }}
            />
          </a>
        )
      })}
    </nav>
  )
}
