import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from './lib/motion'
import { useScrollChoreography } from './lib/scrollfx'
import { useRoute } from './lib/route'
import { bySlug } from './data/catalog'
import { CartProvider } from './lib/cart'
import { sceneState } from './lib/scene'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Scene from './components/Scene'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Collection from './components/Collection'
import House from './components/House'
import Discovery from './components/Discovery'
import Trace from './components/Trace'
import Footer from './components/Footer'
import ProductView from './components/ProductView'
import CartDrawer from './components/CartDrawer'

const NOTES = [
  'Oud',
  'Ambergris',
  'Saffron',
  'Fig leaf',
  'Orange blossom',
  'Black leather',
  'White amber',
  'Iris butter',
  'Vetiver',
  'Jasmine sambac',
  'Salt',
  'Atlas cedar',
]

export default function App() {
  useSmoothScroll()
  const route = useRoute()
  const onHome = route.name === 'home'
  const product = route.name === 'product' ? bySlug(route.slug) : undefined

  return (
    <CartProvider>
      <div className="fx-grain">
        <Preloader />
        <Cursor />
        <Scene />
        {/* on a phone the flacon sits in the lower third of every screen, so
            the reading half gets a permanent scrim rather than a per-section one */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-1 h-[62%] bg-linear-to-b from-ground via-ground/80 to-transparent md:hidden"
          aria-hidden
        />
        <Progress />

        <Nav onHome={onHome} />
        <CartDrawer />

        {/* an unknown slug is not an error worth a page — it is the house */}
        {product ? <ProductView key={product.slug} product={product} /> : <Home />}
      </div>
    </CartProvider>
  )
}

function Home() {
  useScrollChoreography()

  // the house is the wide shot; anything that pushed the camera in is released
  useEffect(() => {
    sceneState.focus = 0
    ScrollTrigger.refresh()
  }, [])

  return (
    <main className="relative">
      <Hero />

      <Marquee
        items={NOTES}
        className="relative z-10 border-y border-line bg-raised/60 py-4 font-mono text-[0.72rem] tracking-[0.18em] text-muted uppercase backdrop-blur-sm"
      />

      <Collection />
      <House />
      <Discovery />
      <Trace />
      <Footer />
    </main>
  )
}

/** Hairline of light across the top, tracking how far through the house you are. */
function Progress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) =>
        gsap.set(bar.current, { scaleX: self.progress, transformOrigin: 'left center' }),
    })
    return () => st.kill()
  }, [])

  return (
    <div
      ref={bar}
      className="fixed inset-x-0 top-0 z-80 h-0.5 scale-x-0 bg-linear-to-r from-ember to-amber shadow-[0_0_18px_#ff7a3c]"
      aria-hidden
    />
  )
}
