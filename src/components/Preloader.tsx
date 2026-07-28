import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { prefersReduced } from '../lib/motion'

/** Counts to 100, then lifts away in two panels to expose the field. */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    if (prefersReduced()) {
      gsap.set(root.current, { autoAlpha: 0, display: 'none' })
      return
    }
    document.body.style.overflow = 'hidden'

    const counter = { v: 0 }
    const tl = gsap.timeline()

    tl.to(counter, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => setN(Math.round(counter.v)),
    })
      .to('.pl-bar', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      .to('.pl-meta', { autoAlpha: 0, duration: 0.4 }, '-=0.2')
      .to('.pl-panel', {
        scaleY: 0,
        duration: 1.1,
        ease: 'expo.inOut',
        stagger: 0.08,
        transformOrigin: 'top center',
      })
      .set(root.current, { display: 'none' })
      .call(() => {
        document.body.style.overflow = ''
        window.dispatchEvent(new Event('resize'))
      })

    return () => {
      tl.kill()
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-100" aria-hidden>
      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="pl-panel h-full flex-1 bg-ground" />
        ))}
      </div>
      <div className="pl-meta absolute inset-0 grid place-items-center">
        <span className="font-display text-[clamp(3.5rem,13vw,10rem)] leading-none tabular-nums">
          {n < 10 ? `0${n}` : n}
        </span>
        <span className="absolute bottom-10 font-mono text-[0.66rem] tracking-[0.32em] text-muted uppercase">
          Digitivia — establishing signal
        </span>
      </div>
      <div className="pl-meta absolute inset-x-0 bottom-0 h-px bg-line">
        <div className="pl-bar h-full w-full origin-left scale-x-0 bg-linear-to-r from-violet to-lift" />
      </div>
    </div>
  )
}
