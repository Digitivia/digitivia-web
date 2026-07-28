import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { money } from '../data/catalog'
import { FREE_SHIPPING_AT, count, shippingProgress, subtotal, useCart } from '../lib/cart'
import { prefersReduced } from '../lib/motion'

/**
 * Liquid glass over the scene. It is the only surface on the site that floats,
 * so it is the only one allowed to refract what is behind it.
 */
export default function CartDrawer() {
  const { state, dispatch } = useCart()
  const panel = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const [placed, setPlaced] = useState(false)

  const lines = state.lines
  const total = subtotal(lines)
  const progress = shippingProgress(lines)

  // esc closes, and the page underneath must not scroll while it is open
  useEffect(() => {
    if (!state.open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dispatch({ type: 'close' })
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [state.open, dispatch])

  // the panel's own open/close is a CSS transition, not a tween: GSAP writing
  // an inline transform on an element that also carries a Tailwind translate
  // utility is a fight neither side wins
  useEffect(() => {
    if (!state.open) setPlaced(false)
  }, [state.open])

  // the line stagger is still worth a tween — CSS can't stagger a list
  useEffect(() => {
    if (!state.open || prefersReduced()) return
    const rows = panel.current?.querySelectorAll('.cd-row')
    if (!rows?.length) return
    const tween = gsap.fromTo(
      rows,
      { autoAlpha: 0, x: 26 },
      { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06, delay: 0.18 },
    )
    return () => {
      tween.kill()
    }
  }, [state.open, lines.length])

  return (
    <>
      <div
        ref={scrim}
        data-open={state.open}
        onClick={() => dispatch({ type: 'close' })}
        className="fixed inset-0 z-90 bg-ground/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-500 data-[open=false]:pointer-events-none data-[open=true]:opacity-100"
        aria-hidden
      />

      <aside
        ref={panel}
        data-open={state.open}
        className="glass fixed inset-y-0 right-0 z-95 w-[min(30rem,100vw)] translate-x-full flex-col transition-transform duration-700 ease-[cubic-bezier(.19,1,.22,1)] data-[open=false]:pointer-events-none data-[open=true]:translate-x-0"
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-line/70 px-7 py-6">
            <p className="font-mono text-[0.68rem] tracking-[0.24em] text-muted uppercase">
              Your selection — {count(lines)}
            </p>
            <button
              type="button"
              onClick={() => dispatch({ type: 'close' })}
              data-cursor="link"
              className="font-mono text-[0.68rem] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
            >
              Close
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-7 no-bar">
            {lines.length === 0 && (
              <p className="py-16 text-center text-muted italic">
                Nothing yet. The Discovery Set is where most people start.
              </p>
            )}

            {lines.map((l) => (
              <div key={l.slug} className="cd-row flex gap-5 border-b border-line/50 py-6">
                <div className="flex-1">
                  <p className="font-display text-[1.5rem] leading-none">{l.name}</p>
                  <p className="mt-2 font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                    {l.size} · {money(l.price)}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-4 rounded-full border border-line px-3 py-1.5">
                    <button
                      type="button"
                      aria-label={`One fewer ${l.name}`}
                      onClick={() => dispatch({ type: 'qty', slug: l.slug, qty: l.qty - 1 })}
                      className="font-mono text-sm text-muted transition-colors hover:text-amber"
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-mono text-[0.72rem] tabular-nums">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`One more ${l.name}`}
                      onClick={() => dispatch({ type: 'qty', slug: l.slug, qty: l.qty + 1 })}
                      className="font-mono text-sm text-muted transition-colors hover:text-amber"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <p className="font-mono text-[0.8rem] tabular-nums">{money(l.price * l.qty)}</p>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'remove', slug: l.slug })}
                    className="font-mono text-[0.6rem] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ember"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t border-line/70 px-7 py-6">
            <div className="mb-5">
              <div className="h-px w-full bg-line">
                <div
                  className="h-px bg-linear-to-r from-amber to-ember transition-[width] duration-700 ease-out"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="mt-3 font-mono text-[0.6rem] tracking-[0.16em] text-muted uppercase">
                {progress >= 1
                  ? 'Shipping is on us'
                  : `${money(FREE_SHIPPING_AT - total)} to free shipping`}
              </p>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[0.66rem] tracking-[0.2em] text-muted uppercase">
                Subtotal
              </span>
              <span className="font-display text-[1.9rem] leading-none tabular-nums">
                {money(total)}
              </span>
            </div>

            <button
              type="button"
              disabled={!lines.length}
              onClick={() => setPlaced(true)}
              data-cursor="hot"
              data-label={placed ? 'Demo' : 'Checkout'}
              className="mt-6 w-full rounded-full bg-linear-120 from-amber to-ember py-4 font-mono text-[0.7rem] font-bold tracking-[0.2em] text-[#1a0d06] uppercase transition-opacity duration-300 disabled:opacity-30"
            >
              {placed ? 'This is a concept store' : 'Checkout'}
            </button>

            <p className="mt-4 text-center font-mono text-[0.58rem] leading-relaxed tracking-[0.14em] text-muted/80 uppercase">
              {placed
                ? 'No payment is taken and no order is placed.'
                : 'Taxes and duties calculated at checkout'}
            </p>
          </footer>
        </div>
      </aside>
    </>
  )
}
