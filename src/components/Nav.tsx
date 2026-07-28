import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Magnetic from './Magnetic'

const LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#live', label: 'Live' },
  { href: '#brands', label: 'Brands' },
  { href: '#pipeline', label: 'How it works' },
  { href: '#proof', label: 'Proof' },
]

export default function Nav() {
  const bar = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = bar.current!
    gsap.fromTo(
      el,
      { yPercent: -120, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: 2.1 },
    )

    const st = ScrollTrigger.create({
      start: 'top -80',
      end: 'max',
      onUpdate: (self) => {
        el.dataset.stuck = 'true'
        gsap.to(el, {
          yPercent: self.direction === 1 && self.scroll() > 500 ? -120 : 0,
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
  }, [])

  return (
    <header
      ref={bar}
      data-stuck="false"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-[max(1.25rem,5vw)] py-4 transition-[background-color,backdrop-filter,border-color] duration-500 data-[stuck=true]:border-b data-[stuck=true]:border-line data-[stuck=true]:bg-ground/70 data-[stuck=true]:backdrop-blur-xl"
    >
      <nav className="flex w-full max-w-[1240px] items-center gap-6">
        <a
          href="#top"
          data-cursor="link"
          aria-label="Digitivia — home"
          className="group flex items-center"
        >
          <img
            src="/digitivia-logo.png"
            alt="Digitivia"
            width={1998}
            height={668}
            className="h-6 w-auto transition-opacity duration-300 group-hover:opacity-75 sm:h-7"
          />
        </a>

        <div className="ml-auto hidden gap-8 font-mono text-[0.72rem] tracking-[0.12em] uppercase md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-cursor="link"
              className="group relative text-muted transition-colors duration-300 hover:text-ink"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-lift transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)] group-hover:origin-left group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <Magnetic className="ml-auto md:ml-0">
          <a
            href="#contact"
            data-cursor="hot"
            data-label="Let's talk"
            className="relative inline-block overflow-hidden rounded-full bg-linear-120 from-violet to-lift px-5 py-2.5 font-mono text-[0.7rem] font-bold tracking-[0.12em] text-[#04070a] uppercase"
          >
            Book a demo
          </a>
        </Magnetic>
      </nav>
    </header>
  )
}
