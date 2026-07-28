import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PRODUCTS, money } from '../data/catalog'
import { sceneState } from '../lib/scene'
import { go } from '../lib/route'
import { prefersReduced } from '../lib/motion'

/**
 * The collection is not a grid of five bottles — it is one bottle, five times.
 *
 * Each row owns a screen. As it takes the viewport it tells the scene which
 * perfume it is wearing, and the flacon in the canvas changes juice and light
 * without the glass ever cutting.
 */
export default function Collection() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.pf-row')

      rows.forEach((row, i) => {
        const wear = () => {
          if (sceneState.active === i) return
          sceneState.active = i
          sceneState.reveal = 1 // the bottle turns while the juice changes
        }

        ScrollTrigger.create({
          trigger: row,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: wear,
          onEnterBack: wear,
        })

        if (prefersReduced()) return

        // the name arrives in one piece from below, the meta behind it
        gsap.fromTo(
          row.querySelector('.pf-name'),
          { yPercent: 40, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1.3,
            ease: 'expo.out',
            scrollTrigger: { trigger: row, start: 'top 78%' },
          },
        )
        gsap.fromTo(
          row.querySelectorAll('.pf-meta'),
          { y: 26, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.07,
            scrollTrigger: { trigger: row, start: 'top 74%' },
          },
        )
      })
    }, root)

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="collection" className="relative z-10">
      <header className="mx-auto flex max-w-[1240px] items-end justify-between gap-8 px-[max(1.25rem,5vw)] pt-32 pb-10">
        <h2 className="text-[clamp(2rem,1rem+3vw,3.4rem)] leading-[0.95]" data-fx="rise">
          Five traces
        </h2>
        <p className="max-w-[26ch] pb-2 font-mono text-[0.66rem] leading-relaxed tracking-[0.16em] text-muted uppercase" data-fx="rise">
          One flacon. The juice changes, the glass never does.
        </p>
      </header>

      {PRODUCTS.map((p) => (
        <article
          key={p.slug}
          className="pf-row relative flex min-h-[82svh] items-center border-t border-line/70"
        >
          <div className="mx-auto w-full max-w-[1240px] px-[max(1.25rem,5vw)] py-16">
            <div className="max-w-[52%] min-w-[min(100%,30rem)] md:max-w-[46%]">
              <div className="pf-meta flex items-center gap-4 font-mono text-[0.66rem] tracking-[0.24em] text-muted uppercase">
                <span className="text-amber">{p.index}</span>
                <span className="h-px w-8 bg-line" />
                <span>{p.year}</span>
                <span dir="rtl" lang="ar" className="ml-auto text-[0.85rem] tracking-normal">
                  {p.arabic}
                </span>
              </div>

              <h3 className="pf-name mt-5 text-[clamp(2.8rem,1rem+7vw,6.5rem)] leading-[0.86] tracking-[-0.015em]">
                {p.name}
              </h3>

              <p className="pf-meta mt-5 max-w-[34ch] text-[clamp(1.05rem,0.95rem+0.4vw,1.35rem)] text-ink/85 italic">
                {p.tagline}
              </p>

              <ul className="pf-meta mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.66rem] tracking-[0.14em] text-muted uppercase">
                {[...p.top, ...p.heart, ...p.base].slice(0, 5).map((n) => (
                  <li key={n.name} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-amber/70" />
                    {n.name}
                  </li>
                ))}
              </ul>

              <div className="pf-meta mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <a
                  href={`#/p/${p.slug}`}
                  data-cursor="hot"
                  data-label="Open"
                  onClick={(e) => {
                    e.preventDefault()
                    go(`/p/${p.slug}`)
                  }}
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-line px-6 py-3 font-mono text-[0.68rem] tracking-[0.18em] uppercase transition-colors duration-500 hover:border-amber/60 hover:text-[#1a0d06]"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-linear-to-r from-amber to-ember transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)] group-hover:scale-x-100" />
                  <span className="relative">Open {p.name}</span>
                </a>
                <p className="font-mono text-[0.7rem] tracking-[0.16em] text-muted uppercase">
                  {money(p.price)} <span className="text-line">/</span> {p.size}
                </p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
