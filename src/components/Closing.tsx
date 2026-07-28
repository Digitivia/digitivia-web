import Reveal from './Reveal'
import Magnetic from './Magnetic'
import Marquee from './Marquee'

export default function Closing() {
  return (
    <>
      <section
        id="contact"
        className="relative z-10 overflow-hidden border-t border-line py-[clamp(6rem,13vw,11rem)] text-center"
      >
        <div className="pointer-events-none absolute -top-1/3 left-1/2 aspect-2/1 w-[min(64rem,130vw)] -translate-x-1/2 animate-[breathe_8s_ease-in-out_infinite] bg-[radial-gradient(ellipse_at_center,rgba(110,79,246,0.24),transparent_66%)] blur-lg" />

        <div className="relative mx-auto flex max-w-[1240px] flex-col items-center gap-7 px-[max(1.25rem,5vw)]">
          <p className="eyebrow">Start</p>
          <Reveal as="h2" words className="max-w-[18ch] text-[clamp(2.2rem,1.2rem+4vw,4.6rem)] leading-[1]">
            See it answer your own customers.
          </Reveal>
          <Reveal className="max-w-[52ch] text-muted">
            Bring one real conversation. We connect a channel, load your catalogue, and you watch
            the agent handle it live — no slides.
          </Reveal>
          <Magnetic strength={0.5}>
            <a
              href="mailto:hello@digitivia.com?subject=Demo%20request"
              data-cursor="hot"
              data-label="Email us"
              className="inline-block rounded-full bg-linear-120 from-violet to-lift px-9 py-4 font-mono text-[0.75rem] font-bold tracking-[0.14em] text-[#04070a] uppercase"
            >
              Book a demo
            </a>
          </Magnetic>
        </div>

        <style>{`@keyframes breathe{0%,100%{opacity:.6;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.12)}}`}</style>
      </section>

      <footer className="relative z-10 border-t border-line bg-raised">
        <Marquee
          items={['From signal to system', 'From signal to system', 'From signal to system']}
          speed={-0.55}
          className="border-b border-line py-[clamp(1.5rem,5vw,3.5rem)]"
          itemClassName="font-display text-[clamp(3rem,10vw,7.5rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(165,140,255,0.34)]"
        />
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-[max(1.25rem,5vw)] py-8 font-mono text-[0.7rem] tracking-[0.12em] text-muted">
          <span>DIGITIVIA — CARTIVA AI · OPSY AI</span>
          <a
            href="mailto:hello@digitivia.com"
            data-cursor="link"
            className="transition-colors duration-300 hover:text-ink"
          >
            hello@digitivia.com
          </a>
        </div>
      </footer>
    </>
  )
}
