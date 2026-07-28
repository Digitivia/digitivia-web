import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReduced } from '../lib/motion'

const M = [
  { v: 24, pre: '', suf: '/7', label: 'Coverage, no shifts' },
  { v: 5, pre: '<', suf: 's', label: 'Typical first reply' },
  { v: 10, pre: '', suf: '+', label: 'Channels & storefronts' },
  { v: null, text: 'AR / EN', label: 'Dialect-aware' },
]

export default function Metrics() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      root.current!.querySelectorAll<HTMLElement>('[data-to]').forEach((el) => {
        const to = Number(el.dataset.to)
        const obj = { v: 0 }
        gsap.to(obj, {
          v: to,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
          onUpdate: () => {
            el.textContent = `${el.dataset.pre ?? ''}${Math.round(obj.v)}${el.dataset.suf ?? ''}`
          },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="proof" ref={root} className="relative z-10 border-y border-line bg-ground/60 backdrop-blur-sm">
      <div className="mx-auto grid max-w-[1240px] gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {M.map((m) => (
          <div
            key={m.label}
            className="group relative flex flex-col gap-2 overflow-hidden bg-ground p-[clamp(1.5rem,3.5vw,2.6rem)] transition-colors duration-500 hover:bg-raised"
          >
            <b
              data-to={m.v ?? undefined}
              data-pre={m.pre}
              data-suf={m.suf}
              className="font-display text-[clamp(2.4rem,1.5rem+3vw,4rem)] leading-none font-normal tabular-nums"
            >
              {m.v === null ? m.text : `${m.pre}0${m.suf}`}
            </b>
            <small className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">
              {m.label}
            </small>
            <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-lift transition-transform duration-700 ease-[cubic-bezier(.19,1,.22,1)] group-hover:scale-x-100" />
          </div>
        ))}
      </div>
    </section>
  )
}
