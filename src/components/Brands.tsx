import { useRef } from 'react'
import gsap from 'gsap'
import Reveal from './Reveal'
import { prefersReduced } from '../lib/motion'

const CARDS = [
  {
    tag: 'Cartiva AI',
    title: 'Agents that close orders.',
    copy: 'Product lookups, live stock and price, media-rich replies, checkout links and order status — wired straight into the store you already run.',
    chips: ['Shopify', 'WooCommerce', 'Salla', 'Zid', 'EasyOrders'],
    accent: '110,79,246',
  },
  {
    tag: 'Opsy AI',
    title: 'Agents that fill the calendar.',
    copy: 'Qualification, real availability, confirmed bookings on your actual calendar, reminders, and a clean handoff the moment a person should take over.',
    chips: ['Bookings', 'Lead capture', 'Support', 'Google Calendar'],
    accent: '91,174,176',
  },
]

function Card({ card }: { card: (typeof CARDS)[number] }) {
  const el = useRef<HTMLDivElement>(null)

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced()) return
    const node = el.current!
    const r = node.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top) / r.height
    node.style.setProperty('--mx', `${nx * 100}%`)
    node.style.setProperty('--my', `${ny * 100}%`)
    gsap.to(node, {
      rotateY: (nx - 0.5) * 8,
      rotateX: (0.5 - ny) * 8,
      duration: 0.7,
      ease: 'power3.out',
      transformPerspective: 1000,
    })
  }

  const out = () =>
    gsap.to(el.current, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1,0.5)' })

  return (
    <div
      ref={el}
      onPointerMove={move}
      onPointerLeave={out}
      data-cursor="hot"
      data-label={card.tag.split(' ')[0]}
      className="group relative flex flex-col gap-4 overflow-hidden bg-ground p-[clamp(1.75rem,4vw,3rem)] [transform-style:preserve-3d]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(${card.accent},0.18), transparent 70%)`,
        }}
      />
      <p
        className="relative font-mono text-[0.68rem] tracking-[0.22em] uppercase"
        style={{ color: `rgb(${card.accent})` }}
      >
        {card.tag}
      </p>
      <h3 className="relative text-[clamp(1.5rem,1.1rem+1.4vw,2.3rem)] leading-[1.1]">
        {card.title}
      </h3>
      <p className="relative max-w-[46ch] text-muted">{card.copy}</p>
      <ul className="relative mt-2 flex flex-wrap gap-2">
        {card.chips.map((c) => (
          <li
            key={c}
            className="rounded-full border border-line px-3 py-1 font-mono text-[0.68rem] text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-violet/50 hover:text-ink"
          >
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Brands() {
  return (
    <section id="brands" className="relative z-10 mx-auto max-w-[1240px] px-[max(1.25rem,5vw)] py-[clamp(5rem,10vw,9rem)]">
      <p className="eyebrow">Two products, one engine</p>
      <Reveal as="h2" words className="mt-6 max-w-[16ch] text-[clamp(2rem,1.2rem+3vw,3.6rem)] leading-[1.02]">
        Built for what you actually sell.
      </Reveal>

      <div className="mt-14 grid gap-px bg-line md:grid-cols-2">
        {CARDS.map((c) => (
          <Card key={c.tag} card={c} />
        ))}
      </div>
    </section>
  )
}
