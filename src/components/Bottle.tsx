import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { pointerState } from '../lib/motion'
import { activeProduct, sceneState } from '../lib/scene'

/**
 * One glass form, five traces.
 *
 * The house casts a single flacon; what changes between perfumes is the juice
 * inside it and the light around it. That is also the only way this stays
 * cheap: transmission re-renders the scene once per transmissive object, so
 * there is exactly one on screen, ever — never a grid of them.
 */

/** Profile of the flacon, revolved. x = radius, y = height. */
function profile(): THREE.Vector2[] {
  const p: THREE.Vector2[] = []
  const R = 0.72

  p.push(new THREE.Vector2(0, -1.42))
  p.push(new THREE.Vector2(R * 0.55, -1.42))
  p.push(new THREE.Vector2(R * 0.94, -1.34)) // rounded foot
  p.push(new THREE.Vector2(R, -1.15))
  p.push(new THREE.Vector2(R, 0.34)) // the body, dead straight

  // shoulder: a quarter turn from body to neck, sampled fine enough to catch
  // a highlight along its whole length
  for (let i = 1; i <= 14; i++) {
    const t = i / 14
    const e = Math.sin((t * Math.PI) / 2)
    p.push(new THREE.Vector2(THREE.MathUtils.lerp(R, 0.18, e), THREE.MathUtils.lerp(0.34, 0.94, t)))
  }

  p.push(new THREE.Vector2(0.18, 1.12)) // neck
  p.push(new THREE.Vector2(0.21, 1.16)) // collar
  p.push(new THREE.Vector2(0.21, 1.2))
  p.push(new THREE.Vector2(0.15, 1.22))
  p.push(new THREE.Vector2(0, 1.22))
  return p
}

/**
 * The liquid, cut off at the fill line. Held well below the shoulder: a
 * flacon filled to the neck reads as a jar, and the empty glass above the
 * surface is where all the refraction happens.
 */
function juiceProfile(fill = -0.06): THREE.Vector2[] {
  const inner = profile()
    .map((v) => new THREE.Vector2(v.x * 0.965, v.y * 0.985))
    .filter((v) => v.y <= fill)
  inner.push(new THREE.Vector2(inner[inner.length - 1]?.x ?? 0.68, fill))
  inner.push(new THREE.Vector2(0, fill)) // flat surface of the liquid
  return inner
}

const juiceC = new THREE.Color()

export default function Bottle({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const juiceMat = useRef<THREE.MeshStandardMaterial>(null)
  const { viewport, size } = useThree()

  const glassGeo = useMemo(() => new THREE.LatheGeometry(profile(), 96), [])
  const juiceGeo = useMemo(() => new THREE.LatheGeometry(juiceProfile(), 96), [])

  useFrame((state, delta) => {
    const g = group.current
    const s = spin.current
    if (!g || !s) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    // ease toward the current mode instead of cutting between them: this is
    // what makes opening a product read as a camera move, not a page load
    sceneState.focusEased += (sceneState.focus - sceneState.focusEased) * 0.055
    const f = sceneState.focusEased

    // portrait viewports have no room for the bottle beside the copy, so it
    // sits behind it instead of to the side
    // on a phone there is no column to stand in, so it drops to the lower
    // third and gets smaller: copy over glass is unreadable at any exposure
    const narrow = size.width < 900
    const homeX = narrow ? viewport.width * 0.16 : viewport.width * 0.24
    const homeY = narrow ? -1.15 : -0.06

    // in close-up it stays in its own column rather than sliding under the
    // copy — the product page is a two-column spread, not a hero
    const focusX = narrow ? viewport.width * 0.1 : viewport.width * 0.2
    g.position.x += (THREE.MathUtils.lerp(homeX, focusX, f) - g.position.x) * 0.06
    g.position.y += (THREE.MathUtils.lerp(homeY, narrow ? -1.05 : -0.18, f) - g.position.y) * 0.06

    // the closing frame takes the flacon with it — it recedes rather than
    // fading, because glass that fades reads as a bug
    const base = (narrow ? 0.62 : 1.16) * (1 - sceneState.dim * 0.98)
    const scale = THREE.MathUtils.lerp(base, base * 1.12, f)
    g.scale.setScalar(g.scale.x + (scale - g.scale.x) * 0.06)

    // turntable: a slow rotation of its own, faster while the page is moving
    // between perfumes, so the object always has life in it
    // a change of perfume spins the flacon, then it settles back to its drift
    sceneState.reveal *= 0.94

    if (!reduced) {
      s.rotation.y += dt * (0.22 + sceneState.reveal * 2.6)
      // pointer tilt, damped — the object has weight
      const tx = -pointerState.y * 0.13
      const tz = pointerState.x * 0.1
      s.rotation.x += (tx - s.rotation.x) * 0.035
      s.rotation.z += (tz - s.rotation.z) * 0.035
      // and it breathes, so a still page is never a still frame
      g.position.y += Math.sin(t * 0.6) * 0.0009
    }

    // the juice cross-fades between perfumes rather than cutting
    const prod = activeProduct()
    if (juiceMat.current) {
      juiceMat.current.color.lerp(juiceC.set(prod.juice), 0.05)
      juiceMat.current.emissive.lerp(juiceC.set(prod.light), 0.05)
      // add-to-cart lights the liquid from inside
      juiceMat.current.emissiveIntensity = 0.16 + sceneState.pulse * 0.4 + f * 0.06
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      <group ref={spin}>
        {/* the liquid: rendered before the glass so it refracts through it */}
        <mesh geometry={juiceGeo} renderOrder={0}>
          <meshStandardMaterial
            ref={juiceMat}
            color="#5a1f14"
            emissive="#ff7a3c"
            emissiveIntensity={0.16}
            roughness={0.18}
            metalness={0}
          />
        </mesh>

        {/* the flacon */}
        <mesh geometry={glassGeo} renderOrder={1}>
          <MeshTransmissionMaterial
            samples={reduced ? 2 : 6}
            resolution={256}
            transmission={1}
            /* backside makes the far wall of the flacon refract through the
               near one — without it, glass reads as tinted plastic */
            backside
            backsideThickness={0.28}
            thickness={0.5}
            roughness={0.03}
            ior={1.52}
            chromaticAberration={0.32}
            anisotropy={0.12}
            distortion={0.08}
            distortionScale={0.2}
            temporalDistortion={0.02}
            attenuationDistance={1.6}
            attenuationColor="#ffd9b4"
            color="#ffffff"
            background={new THREE.Color('#08060a')}
          />
        </mesh>

        {/* collar and cap: brushed brass, the only metal in the house */}
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.235, 0.235, 0.05, 48]} />
          <meshStandardMaterial color="#c9a267" metalness={1} roughness={0.34} />
        </mesh>
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.26, 0.245, 0.36, 48]} />
          <meshStandardMaterial color="#d8b98a" metalness={1} roughness={0.24} />
        </mesh>

        {/* a single incised band where the label would be */}
        <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.726, 0.007, 12, 96]} />
          <meshStandardMaterial color="#c9a267" metalness={1} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}
