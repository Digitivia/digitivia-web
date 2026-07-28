import { PRODUCTS } from '../data/catalog'
import { go } from '../lib/route'

const CARE = [
  'Ships worldwide from Cairo and Dubai',
  'Free shipping over $250',
  'Returns accepted on sealed flacons within 30 days',
  'Store away from light — extrait turns in a sunny room',
]

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line/70">
      <div className="mx-auto max-w-[1240px] px-[max(1.25rem,5vw)] py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-[1.5rem] tracking-[0.14em]">KHAMSIN</p>
            <p className="mt-4 max-w-[26ch] text-[0.9rem] text-muted">
              Parfums d&rsquo;extrait, made in Garden City, Cairo.
            </p>
          </div>

          <nav>
            <p className="font-mono text-[0.62rem] tracking-[0.22em] text-muted uppercase">
              The collection
            </p>
            <ul className="mt-5 space-y-2.5">
              {PRODUCTS.map((p) => (
                <li key={p.slug}>
                  <a
                    href={`#/p/${p.slug}`}
                    data-cursor="link"
                    onClick={(e) => {
                      e.preventDefault()
                      go(`/p/${p.slug}`)
                    }}
                    className="text-[0.95rem] text-ink/80 transition-colors duration-300 hover:text-amber"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.22em] text-muted uppercase">
              Care &amp; shipping
            </p>
            <ul className="mt-5 space-y-2.5 text-[0.9rem] text-muted">
              {CARE.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.22em] text-muted uppercase">
              Contact
            </p>
            <ul className="mt-5 space-y-2.5 text-[0.9rem] text-muted">
              <li>4 Sharia Kamal El-Din Salah, Garden City</li>
              <li>Thursday—Saturday, by appointment</li>
              <li className="text-ink/80">hello@khamsin.example</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-8 font-mono text-[0.6rem] tracking-[0.16em] text-muted/80 uppercase">
          <p>
            Concept project — the house, its perfumes and its prices are fictional. No payment is
            ever taken.
          </p>
          <p>Built by Digitivia</p>
        </div>
      </div>
    </footer>
  )
}
