import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from './lib/motion'
import { useScrollChoreography } from './lib/scrollfx'
import Rail from './components/Rail'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Scene from './components/Scene'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Platform from './components/Platform'
import LiveConsole from './components/LiveConsole'
import Brands from './components/Brands'
import Pipeline from './components/Pipeline'
import Metrics from './components/Metrics'
import Closing from './components/Closing'
import TourHud from './components/TourHud'

const CHANNELS = [
  'WhatsApp Cloud API',
  'Instagram',
  'Messenger',
  'Telegram',
  'Shopify',
  'Salla',
  'Zid',
  'WooCommerce',
  'EasyOrders',
  'Website widget',
]

export default function App() {
  useSmoothScroll()
  useScrollChoreography()
  const progress = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) =>
        gsap.set(progress.current, { scaleX: self.progress, transformOrigin: 'left center' }),
    })
    return () => st.kill()
  }, [])

  return (
    <div className="fx-grain">
      <Preloader />
      <Cursor />
      <Scene />

      <div
        ref={progress}
        className="fixed inset-x-0 top-0 z-80 h-0.5 scale-x-0 bg-linear-to-r from-violet to-lift shadow-[0_0_18px_#6e4ff6]"
        aria-hidden
      />

      <Nav />
      <Rail />
      <TourHud />

      <main className="relative">
        <Hero />

        <Marquee
          items={CHANNELS}
          className="relative z-10 border-y border-line bg-raised/70 py-4 font-mono text-[0.72rem] tracking-[0.18em] text-muted uppercase backdrop-blur-sm"
        />

        <Platform />
        <LiveConsole />
        <Brands />
        <Pipeline />
        <Metrics />
        <Closing />
      </main>
    </div>
  )
}
