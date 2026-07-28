import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Magnetic from './Magnetic'
import { useCart, count } from '../lib/cart'
import { go } from '../lib/route'

const LINKS = [
  { href: '#collection', label: 'Collection' },
  { href: '#house', label: 'The House' },
  { href: '#discovery', label: 'Discovery' },
]

export default function Nav({ onHome }: { onHome: boolean }) {
  const bar = useRef<HTMLElement>(null)
  const { state, dispatch } = useCart()
  const n = count(state.lines)

  useEffect(() => {
    const el = bar.current!
    gsap.fromTo(
      el,
      { yPercent: -120, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: onHome ? 2.1 : 0.2 },
    )

    const st = ScrollTrigger.create({
      start: 'top -80',
      end: 'max',
      onUpdate: (self) => {
        el.dataset.stuck = 'true'
        gsap.to(el, {
          yPercent: self.direction === 1 && self.scroll() > 520 ? -120 : 0,
          duration: 0.6,
          ease: 'expo.out',
        })
      },
      onLeaveBack: () => {
        el.dataset.stuck = 'false'
        gsap.to(el, { yPercent: 0, duration: 0.6, ease: 'expo.out' })
      },
    })
    return () => st.kill()
  }, [onHome])

  const jump = (hash: string) => {
    if (onHome) return
    go('/')
    // let the home route mount before looking for the section
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }),
      ),
    )
  }

  return (
    <header
      ref={bar}
      data-stuck="false"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-[max(1.25rem,5vw)] py-4 transition-[background-color,backdrop-filter,border-color] duration-500 data-[stuck=true]:border-b data-[stuck=true]:border-line data-[stuck=true]:bg-ground/60 data-[stuck=true]:backdrop-blur-xl"
    >
      <nav className="flex w-full max-w-[1240px] items-center gap-6">
        <a
          href="#/"
          data-cursor="link"
          onClick={(e) => {
            e.preventDefault()
            go('/')
          }}
          className="group flex items-baseline gap-2.5"
          aria-label="KHAMSIN — home"
        >
          <span className="font-display text-[1.35rem] leading-none tracking-[0.16em] transition-opacity duration-300 group-hover:opacity-70">
            KHAMSIN
          </span>
          <span className="hidden font-mono text-[0.55rem] tracking-[0.3em] text-muted uppercase sm:block">
            Cairo
          </span>
        </a>

        <div className="ml-auto hidden gap-8 font-mono text-[0.7rem] tracking-[0.14em] uppercase md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-cursor="link"
              onClick={(e) => {
                if (onHome) return
                e.preventDefault()
                jump(l.href)
              }}
              className="group relative text-muted transition-colors duration-300 hover:text-ink"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-amber transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)] group-hover:origin-left group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <Magnetic className="ml-auto md:ml-0" strength={0.3}>
          <button
            type="button"
            onClick={() => dispatch({ type: 'open' })}
            data-cursor="hot"
            data-label="Open"
            className="relative inline-flex items-center gap-2.5 rounded-full border border-line px-5 py-2.5 font-mono text-[0.68rem] tracking-[0.16em] text-ink uppercase transition-colors duration-300 hover:border-amber"
          >
            Cart
            <span
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.62rem] tabular-nums transition-colors duration-300 ${
                n ? 'bg-amber text-[#1a0d06]' : 'bg-line text-muted'
              }`}
            >
              {n}
            </span>
          </button>
        </Magnetic>
      </nav>
    </header>
  )
}
