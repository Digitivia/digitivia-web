import { DISCOVERY, PRODUCTS, money } from '../data/catalog'
import { useCart } from '../lib/cart'
import Magnetic from './Magnetic'
import Reveal from './Reveal'

/** The way most people actually buy a niche house: all five, 2 ml each. */
export default function Discovery() {
  const { dispatch } = useCart()

  return (
    <section id="discovery" className="relative z-10 border-t border-line/70">
      <div className="mx-auto max-w-[1240px] px-[max(1.25rem,5vw)] py-28">
        <div className="glass relative overflow-hidden rounded-[1.75rem] p-[clamp(1.5rem,1rem+3vw,4rem)]">
          {/* the light the set throws, bled in from the corner */}
          <div
            className="pointer-events-none absolute -top-40 -right-24 h-96 w-96 rounded-full opacity-45 blur-[90px]"
            style={{ background: DISCOVERY.light }}
          />

          <div className="relative grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div>
              <p className="eyebrow">Start here</p>
              <Reveal as="h2" words className="mt-6 text-[clamp(2rem,1rem+3.4vw,3.6rem)] leading-[0.95]">
                The Discovery Set
              </Reveal>
              <p className="mt-6 max-w-[46ch] text-muted" data-fx="blur">
                All five extraits at 2 ml, in the same glass, at the same concentration as the
                50 ml. Its price comes off your first full bottle.
              </p>
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.66rem] tracking-[0.16em] text-muted uppercase">
                {PRODUCTS.map((p) => (
                  <li key={p.slug} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: p.juice, boxShadow: `0 0 12px ${p.light}` }}
                    />
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-6 md:items-end">
              <p className="font-display text-[clamp(2.6rem,1rem+5vw,4.6rem)] leading-none">
                {money(DISCOVERY.price)}
              </p>
              <p className="font-mono text-[0.66rem] tracking-[0.18em] text-muted uppercase">
                {DISCOVERY.size} · ships in 48h
              </p>
              <Magnetic strength={0.28}>
                <button
                  type="button"
                  data-cursor="hot"
                  data-label="Add"
                  onClick={() =>
                    dispatch({
                      type: 'add',
                      line: {
                        slug: DISCOVERY.slug,
                        name: DISCOVERY.name,
                        price: DISCOVERY.price,
                        size: DISCOVERY.size,
                      },
                    })
                  }
                  className="group relative overflow-hidden rounded-full bg-linear-120 from-amber to-ember px-8 py-4 font-mono text-[0.7rem] font-bold tracking-[0.18em] text-[#1a0d06] uppercase"
                >
                  <span className="relative">Add the set</span>
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
