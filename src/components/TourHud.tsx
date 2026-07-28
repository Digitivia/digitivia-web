import { useEffect, useState } from 'react'
import { stopTour, subscribeTour, type TourSnapshot } from '../lib/tour'

/** Small chip that names the current chapter while the tour drives. */
export default function TourHud() {
  const [s, setS] = useState<TourSnapshot>({ running: false, label: '', progress: 0 })

  useEffect(() => {
    const off = subscribeTour(setS)
    return () => {
      off()
    }
  }, [])

  useEffect(() => {
    if (!s.running) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopTour()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [s.running])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-85 flex justify-center transition-all duration-700"
      style={{
        opacity: s.running ? 1 : 0,
        transform: s.running ? 'none' : 'translateY(18px)',
      }}
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-ground/85 py-2 pr-2 pl-4 backdrop-blur-xl">
        <span className="size-1.5 shrink-0 rounded-full bg-violet" style={{ animation: 'pulse 1.6s ease-in-out infinite' }} />
        <span className="font-mono text-[0.64rem] tracking-[0.18em] text-ink uppercase">
          {s.label || 'Tour'}
        </span>
        <span className="h-1 w-24 overflow-hidden rounded-full bg-line">
          <span
            className="block h-full rounded-full bg-linear-to-r from-violet to-lift transition-[width] duration-700 ease-out"
            style={{ width: `${Math.round(s.progress * 100)}%` }}
          />
        </span>
        <button
          type="button"
          onClick={stopTour}
          data-cursor="link"
          className="rounded-full border border-line px-3 py-1 font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase transition-colors duration-300 hover:border-violet/60 hover:text-ink"
        >
          Esc · stop
        </button>
      </div>
    </div>
  )
}
