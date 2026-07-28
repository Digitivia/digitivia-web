import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import SignalField from './SignalField'
import { prefersReduced } from '../lib/motion'

/**
 * Fixed full-viewport WebGL layer. It sits behind the whole document so the
 * field keeps resolving from signal into system as you read.
 */
export default function Scene() {
  const reduced = prefersReduced()
  const layer = useRef<HTMLDivElement>(null)

  // past the hero the field becomes atmosphere, so the copy stays first
  useEffect(() => {
    if (reduced) return
    const st = gsap.to(layer.current, {
      opacity: 0.42,
      ease: 'none',
      scrollTrigger: { start: () => window.innerHeight * 0.35, end: () => window.innerHeight, scrub: 0.7 },
    })
    return () => {
      st.scrollTrigger?.kill()
      st.kill()
    }
  }, [reduced])

  return (
    <div ref={layer} className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 9.5], fov: 50 }}
      >
        {/* No bloom: it smears the thin contours into a grey haze. The lines
            carry their own glow in the shader instead. */}
        <SignalField reduced={reduced} />
      </Canvas>
    </div>
  )
}
