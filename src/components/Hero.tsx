import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import '../lib/motion' // registers ScrollTrigger

export default function Hero() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 1.75 })
      // NB: the initial offset lives here, not in a Tailwind class — a CSS
      // transform class would keep overriding whatever GSAP writes.
      tl.fromTo(
        '.hero-line > span',
        { yPercent: 115 },
        { yPercent: 0, duration: 1.45, ease: 'expo.out', stagger: 0.12 },
      )
        .to('.hero-eye', { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.15)
        .to('.hero-tail', { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09 }, 0.6)

      // the whole block drifts up and dissolves as the air takes over
      gsap.to('.hero-inner', {
        yPercent: -20,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} id="top" className="relative flex min-h-svh items-center">
      {/* scrim: keeps the copy legible over the flacon. It runs sideways on a
          desktop spread and downwards on a phone, because that is where the
          glass actually sits in each layout. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[72%] bg-linear-to-b from-ground via-ground/85 to-transparent md:inset-y-0 md:h-auto md:w-[76%] md:bg-linear-to-r md:via-ground/72" />

      <div className="hero-inner relative mx-auto w-full max-w-[1240px] px-[max(1.25rem,5vw)] pt-32 pb-16">
        <p className="hero-eye eyebrow translate-y-4 opacity-0">
          Parfums d&rsquo;extrait — Cairo, est. 2019
        </p>

        {/* three lines have to clear the viewport with the nav and the tail
            still in frame, so the ceiling is lower than a one-line hero */}
        <h1 className="mt-8 text-[clamp(2.6rem,0.8rem+7.2vw,7rem)] leading-[0.86]">
          <span className="line-mask hero-line">
            <span className="block tracking-[-0.02em]">KHAMSIN</span>
          </span>
          <span className="line-mask hero-line">
            <span className="block text-muted italic">the wind leaves</span>
          </span>
          <span className="line-mask hero-line">
            <span className="block italic">something on you.</span>
          </span>
        </h1>

        <div className="mt-14 flex flex-wrap items-end gap-x-16 gap-y-9">
          <p className="hero-tail max-w-[42ch] translate-y-5 text-[clamp(1rem,0.9rem+0.45vw,1.18rem)] text-muted opacity-0">
            Five extraits, one glass form, made in small batches in Garden City. Macerated six
            months before anyone is allowed to smell them.
          </p>

          <a
            href="#collection"
            data-cursor="hot"
            data-label="Enter"
            className="hero-tail group relative inline-flex translate-y-5 items-center gap-4 overflow-hidden rounded-full border border-amber/45 px-7 py-3.5 font-mono text-[0.7rem] tracking-[0.2em] text-ink uppercase opacity-0 transition-colors duration-500 hover:text-[#1a0d06]"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-linear-to-t from-ember to-amber transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)] group-hover:scale-y-100" />
            <span className="relative">The collection</span>
            <span className="relative transition-transform duration-500 group-hover:translate-x-1">
              ↓
            </span>
          </a>
        </div>

        {/* a trail follows a pointer; on touch there is nothing to promise */}
        <p className="hero-tail mt-16 hidden translate-y-5 items-center gap-3 font-mono text-[0.66rem] tracking-[0.22em] text-muted uppercase opacity-0 [@media(hover:hover)and(pointer:fine)]:flex">
          <span className="block h-10 w-px animate-[drop_2.4s_ease-in-out_infinite] bg-linear-to-b from-amber to-transparent" />
          Move the cursor — it leaves a trail
        </p>
      </div>

      <style>{`@keyframes drop{0%,100%{transform:scaleY(.25);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}}`}</style>
    </div>
  )
}
