import Reveal from './Reveal'

const FACTS = [
  { n: '6', unit: 'months', label: 'maceration before a batch is released' },
  { n: '24—30', unit: '%', label: 'concentration — extrait, never eau' },
  { n: '180', unit: 'flacons', label: 'per batch, filled and sealed by hand' },
  { n: '5', unit: 'traces', label: 'in the house. There will not be a sixth this year' },
]

export default function House() {
  return (
    <section id="house" className="relative z-10 border-t border-line/70">
      <div className="mx-auto max-w-[1240px] px-[max(1.25rem,5vw)] py-28">
        <div className="grid gap-14 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <div>
            <p className="eyebrow" data-fx="rise">
              The house
            </p>
            <Reveal
              as="h2"
              words
              className="mt-7 text-[clamp(2.2rem,1rem+4vw,4.2rem)] leading-[0.94]"
            >
              A khamsin carries the desert into the city for fifty days a year.
            </Reveal>
          </div>

          <div className="space-y-6 text-[clamp(1rem,0.95rem+0.35vw,1.15rem)] text-muted">
            <p data-fx="blur">
              We started in 2019 in two rooms in Garden City, with a rotary evaporator that was
              older than anyone using it. The brief has not changed since: build perfumes that
              smell like this city in the weeks the wind comes — hot mineral air, bitter orange off
              the trees, resin, salt, and something underneath it that is only skin.
            </p>
            <p data-fx="blur">
              Everything is macerated six months. Nothing is filtered clear for the sake of looking
              clear. The flacon is one form in five weights of colour, because a house that changes
              its bottle every season is selling the bottle.
            </p>
            <p className="font-mono text-[0.68rem] tracking-[0.16em] text-ink/70 uppercase" data-fx="rise">
              Made in Cairo. Shipped worldwide from Cairo and Dubai.
            </p>
          </div>
        </div>

        <dl className="mt-24 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-line/70 pt-14 lg:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.label} data-fx="rise">
              <dt className="font-display text-[clamp(2.4rem,1rem+4vw,4rem)] leading-none">
                {f.n}
                <span className="ml-2 align-super font-mono text-[0.7rem] tracking-[0.14em] text-amber uppercase">
                  {f.unit}
                </span>
              </dt>
              <dd className="mt-4 max-w-[24ch] font-mono text-[0.66rem] leading-relaxed tracking-[0.12em] text-muted uppercase">
                {f.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
