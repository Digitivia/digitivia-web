import { useEffect } from 'react'
import gsap from 'gsap'
import { PRODUCTS, money, type Product } from '../data/catalog'
import { sceneState } from '../lib/scene'
import { useCart } from '../lib/cart'
import { go } from '../lib/route'
import { prefersReduced } from '../lib/motion'
import NotePyramid from './NotePyramid'
import Magnetic from './Magnetic'
import Footer from './Footer'

/** A 1–5 reading, drawn as five marks rather than a number nobody trusts. */
function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className="font-mono text-[0.62rem] tracking-[0.2em] text-muted uppercase">{label}</p>
      <div className="mt-3 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="h-[3px] w-7 rounded-full transition-colors duration-500"
            style={{
              background: i <= value ? color : 'var(--color-line)',
              boxShadow: i <= value ? `0 0 12px ${color}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ProductView({ product }: { product: Product }) {
  const { dispatch } = useCart()
  const index = PRODUCTS.findIndex((p) => p.slug === product.slug)
  const others = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 2)

  // the scene follows the route: this is what pushes the camera in
  useEffect(() => {
    sceneState.active = Math.max(0, index)
    sceneState.focus = 1
    sceneState.reveal = 1
    return () => {
      sceneState.focus = 0
    }
  }, [index])

  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pv-in',
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', stagger: 0.07, delay: 0.15 },
      )
    })
    return () => ctx.revert()
  }, [product.slug])

  return (
    <main className="relative">
      <div className="pointer-events-none fixed inset-y-0 left-0 z-0 w-[70%] bg-linear-to-r from-ground via-ground/70 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1240px] px-[max(1.25rem,5vw)] pt-32 pb-24">
        <button
          type="button"
          onClick={() => go('/')}
          data-cursor="link"
          className="pv-in group flex items-center gap-3 font-mono text-[0.66rem] tracking-[0.2em] text-muted uppercase transition-colors hover:text-ink"
        >
          <span className="transition-transform duration-500 group-hover:-translate-x-1">←</span>
          The collection
        </button>

        <div className="mt-12 grid gap-16 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
          {/* the copy sits left; the flacon is live in the canvas behind the right */}
          <div>
            <div className="pv-in flex items-center gap-4 font-mono text-[0.66rem] tracking-[0.24em] text-muted uppercase">
              <span className="text-amber">{product.index}</span>
              <span className="h-px w-8 bg-line" />
              <span>{product.year}</span>
            </div>

            <h1 className="pv-in mt-6 text-[clamp(3rem,1rem+8vw,7rem)] leading-[0.84] tracking-[-0.015em]">
              {product.name}
            </h1>
            <p dir="rtl" lang="ar" className="pv-in mt-3 font-display text-[1.6rem] text-muted">
              {product.arabic}
            </p>

            <p className="pv-in mt-8 max-w-[38ch] text-[clamp(1.1rem,1rem+0.5vw,1.5rem)] leading-snug italic">
              {product.tagline}
            </p>

            <p className="pv-in mt-7 max-w-[46ch] text-muted">{product.story}</p>

            <div className="pv-in mt-12 flex flex-wrap gap-x-14 gap-y-8">
              <Meter label="Sillage" value={product.sillage} color={product.light} />
              <Meter label="Longevity" value={product.longevity} color={product.light} />
            </div>

            <div className="pv-in mt-12 flex flex-wrap items-center gap-x-10 gap-y-6 border-t border-line/70 pt-10">
              <div>
                <p className="font-display text-[clamp(2.2rem,1rem+3vw,3.2rem)] leading-none tabular-nums">
                  {money(product.price)}
                </p>
                <p className="mt-2 font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                  {product.size} · {product.concentration}
                </p>
              </div>

              <Magnetic strength={0.3}>
                <button
                  type="button"
                  data-cursor="hot"
                  data-label="Add"
                  onClick={() =>
                    dispatch({
                      type: 'add',
                      line: {
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        size: product.size,
                      },
                    })
                  }
                  className="rounded-full bg-linear-120 from-amber to-ember px-9 py-4 font-mono text-[0.7rem] font-bold tracking-[0.18em] text-[#1a0d06] uppercase"
                >
                  Add to cart
                </button>
              </Magnetic>
            </div>
          </div>

          {/* deliberately mostly empty: this column is a window onto the scene */}
          <div className="relative min-h-[46svh] md:min-h-[70svh]" aria-hidden />
        </div>

        <section className="mt-24">
          <h2 className="pv-in font-mono text-[0.66rem] tracking-[0.24em] text-muted uppercase">
            How it wears
          </h2>
          <div className="mt-8">
            <NotePyramid product={product} />
          </div>
        </section>

        <section className="mt-28 border-t border-line/70 pt-14">
          <h2 className="font-mono text-[0.66rem] tracking-[0.24em] text-muted uppercase">
            Also in the house
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {others.map((p) => (
              <a
                key={p.slug}
                href={`#/p/${p.slug}`}
                data-cursor="hot"
                data-label="Open"
                onClick={(e) => {
                  e.preventDefault()
                  go(`/p/${p.slug}`)
                }}
                className="group flex items-start gap-6 rounded-2xl border border-line/70 p-7 transition-colors duration-500 hover:border-amber/50"
              >
                <span
                  className="mt-2 h-3 w-3 shrink-0 rounded-full"
                  style={{ background: p.juice, boxShadow: `0 0 18px ${p.light}` }}
                />
                <span className="flex-1">
                  <span className="block font-display text-[1.9rem] leading-none">{p.name}</span>
                  <span className="mt-3 block max-w-[28ch] text-[0.95rem] text-muted italic">
                    {p.tagline}
                  </span>
                  <span className="mt-4 block font-mono text-[0.64rem] tracking-[0.16em] text-muted uppercase">
                    {money(p.price)} · {p.size}
                  </span>
                </span>
                <span className="font-mono text-muted transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
