import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import TourButton from './TourButton'
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
        { yPercent: 0, duration: 1.35, ease: 'expo.out', stagger: 0.11 },
      )
        .to('.hero-eye', { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.15)
        .to('.hero-tail', { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09 }, 0.55)

      // the whole block drifts up and dissolves as the field takes over
      gsap.to('.hero-inner', {
        yPercent: -22,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} id="top" className="relative flex min-h-svh items-center">
      {/* scrim: keeps the headline legible where the field is densest */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[70%] bg-linear-to-r from-ground via-ground/75 to-transparent" />

      <div className="hero-inner relative mx-auto w-full max-w-[1240px] px-[max(1.25rem,5vw)] pt-36 pb-20">
        <p className="hero-eye eyebrow translate-y-4 opacity-0">
          AI agents for commerce &amp; service
        </p>

        <h1 className="mt-7 text-[clamp(3rem,1rem+8vw,8.5rem)] leading-[0.88]">
          <span className="line-mask hero-line">
            <span className="">From signal</span>
          </span>
          <span className="line-mask hero-line">
            <span className=" text-muted italic">to system.</span>
          </span>
        </h1>

        <div className="hero-tail mt-12 flex translate-y-5 flex-wrap items-center gap-x-10 gap-y-6 opacity-0">
          <TourButton />
          <p className="max-w-[24ch] font-mono text-[0.68rem] leading-relaxed tracking-[0.16em] text-muted uppercase">
            Press play — the page scrolls itself and the agents answer, live.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap items-end gap-x-16 gap-y-8">
          <p className="hero-tail max-w-[46ch] translate-y-5 text-[clamp(1rem,0.9rem+0.45vw,1.2rem)] text-muted opacity-0">
            Every message a customer sends is a signal. Digitivia turns it into an answer, an order,
            a booking and a record — across WhatsApp, Instagram, Messenger, Telegram and your
            storefront. In Arabic and English, at three in the morning.
          </p>
          <p className="hero-tail flex translate-y-5 items-center gap-3 font-mono text-[0.68rem] tracking-[0.22em] text-muted uppercase opacity-0">
            <span className="block h-10 w-px animate-[drop_2.4s_ease-in-out_infinite] bg-linear-to-b from-violet to-transparent" />
            Scroll to resolve
          </p>
        </div>
      </div>

      <style>{`@keyframes drop{0%,100%{transform:scaleY(.25);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}}`}</style>
    </div>
  )
}
