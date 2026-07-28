import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { pointerState, prefersReduced } from '../lib/motion'
import { startTour, subscribeTour } from '../lib/tour'

const RING_TEXT = 'PLAY  THE  FULL  TOUR   ✦   ONE  CLICK   ✦   '

/**
 * The showreel trigger. Hovering excites the same particle field the hero runs
 * on, so the button belongs to the page rather than sitting on top of it.
 */
export default function TourButton() {
  const root = useRef<HTMLButtonElement>(null)
  const ring = useRef<HTMLSpanElement>(null)
  const glow = useRef<HTMLSpanElement>(null)
  const wave = useRef<HTMLSpanElement>(null)
  const core = useRef<HTMLSpanElement>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const off = subscribeTour((s) => setRunning(s.running))
    return () => {
      off()
    }
  }, [])

  useEffect(() => {
    if (prefersReduced()) return
    const el = root.current!
    const spin = gsap.to(ring.current, { rotate: 360, duration: 22, ease: 'none', repeat: -1 })

    const x = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' })

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * 0.32)
      y((e.clientY - (r.top + r.height / 2)) * 0.32)
    }

    const enter = () => {
      gsap.to(spin, { timeScale: 3.4, duration: 0.8, ease: 'power2.out' })
      gsap.to(glow.current, { opacity: 1, scale: 1.35, duration: 0.7, ease: 'expo.out' })
      gsap.to(core.current, { scale: 1.12, duration: 0.6, ease: 'expo.out' })
      gsap.fromTo(
        wave.current,
        { opacity: 0.7, scale: 0.85 },
        { opacity: 0, scale: 2.1, duration: 1.4, ease: 'expo.out' },
      )
      pointerState.click = 1 // ripple through the particle field
    }

    const leave = () => {
      gsap.to(spin, { timeScale: 1, duration: 1.2, ease: 'power2.out' })
      gsap.to(glow.current, { opacity: 0.45, scale: 1, duration: 0.9, ease: 'expo.out' })
      gsap.to(core.current, { scale: 1, duration: 0.7, ease: 'expo.out' })
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,0.45)' })
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      spin.kill()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  const fire = () => {
    pointerState.click = 1
    gsap.fromTo(
      wave.current,
      { opacity: 0.9, scale: 0.8 },
      { opacity: 0, scale: 3, duration: 1.1, ease: 'expo.out' },
    )
    startTour()
  }

  return (
    <button
      ref={root}
      type="button"
      onClick={fire}
      disabled={running}
      data-cursor="hot"
      data-label={running ? 'Playing' : 'Start'}
      aria-label="Play the full tour — the page scrolls and demonstrates itself"
      className="tour-btn group relative grid size-[clamp(8.5rem,15vw,10.5rem)] shrink-0 place-items-center rounded-full disabled:opacity-40"
    >
      {/* soft field glow */}
      <span
        ref={glow}
        className="pointer-events-none absolute inset-[-35%] rounded-full opacity-45 blur-xl"
        style={{
          background:
            'radial-gradient(circle,rgba(110,79,246,0.55),rgba(110,79,246,0.08) 55%,transparent 72%)',
        }}
      />
      {/* shockwave on hover / click */}
      <span
        ref={wave}
        className="pointer-events-none absolute inset-0 rounded-full border border-lift opacity-0"
      />
      {/* conic rim */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full p-px"
        style={{
          background:
            'conic-gradient(from 180deg, transparent, var(--color-violet), var(--color-lift), var(--color-teal), transparent)',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />
      {/* rotating label */}
      <span ref={ring} className="pointer-events-none absolute inset-0">
        <svg viewBox="0 0 200 200" className="size-full">
          <defs>
            <path
              id="tour-ring"
              d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"
              fill="none"
            />
          </defs>
          <text className="fill-muted font-mono text-[11px] tracking-[0.34em] uppercase">
            <textPath href="#tour-ring">{RING_TEXT}</textPath>
          </text>
        </svg>
      </span>

      {/* core */}
      <span
        ref={core}
        className="relative grid size-[58%] place-items-center rounded-full border border-white/10 bg-linear-135 from-violet to-[#3a1f9e] shadow-[0_18px_50px_-18px_var(--color-violet)] transition-colors duration-500 group-hover:from-lift group-hover:to-violet"
      >
        <svg viewBox="0 0 24 24" className="size-6 translate-x-[1px] fill-[#06060d]" aria-hidden>
          <path d="M8 5.2v13.6L19 12 8 5.2Z" />
        </svg>
      </span>
    </button>
  )
}
