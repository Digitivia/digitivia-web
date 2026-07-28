import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState } from '../lib/scene'
import { prefersReduced } from '../lib/motion'

/**
 * The last frame. The room goes out — light, flacon, everything — and what is
 * left on screen is the trail the reader's own cursor is still leaving in the
 * dark. It is the one moment the site stops selling, and it is the frame that
 * survives the tab closing.
 */
export default function Trace() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top 70%',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          sceneState.dim = self.progress
        },
        onLeaveBack: () => {
          sceneState.dim = 0
        },
      })

      if (!prefersReduced()) {
        gsap.fromTo(
          '.trace-line',
          { autoAlpha: 0, filter: 'blur(16px)', letterSpacing: '0.4em' },
          {
            autoAlpha: 1,
            filter: 'blur(0px)',
            letterSpacing: '0.02em',
            duration: 2,
            ease: 'expo.out',
            scrollTrigger: { trigger: root.current, start: 'top 55%' },
          },
        )
      }
      return () => st.kill()
    }, root)

    return () => {
      ctx.revert()
      sceneState.dim = 0
    }
  }, [])

  return (
    <section
      ref={root}
      className="relative z-10 flex min-h-[130svh] flex-col items-center justify-center px-6 text-center"
    >
      <p className="trace-line font-display text-[clamp(2rem,1rem+4.5vw,4.8rem)] leading-[1.05] italic">
        What stays is the trace.
      </p>
      <p className="mt-10 font-mono text-[0.62rem] tracking-[0.3em] text-muted/70 uppercase">
        KHAMSIN — Cairo
      </p>
    </section>
  )
}
