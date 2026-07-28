import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointerState, scrollState } from '../lib/motion'

/**
 * A flowing contour field: thin lines drifting like a slow current.
 * Turbulent at the top of the page (signal), easing into a calm parallel
 * rhythm as you scroll (system). One fullscreen quad, no particles.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uOrder;    // 0 = turbulent, 1 = settled
  uniform float uAspect;
  uniform vec2  uPointer;  // -1..1
  uniform float uSwell;    // click swell, decays back to 0

  varying vec2 vUv;

  vec2 hash2(vec2 p){
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
  }

  // gradient noise — smooth enough that the contours never show facets
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)), dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
      mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)), dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x),
      u.y);
  }

  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);

    // how far the field has settled: turbulence fades, lines spread apart
    float calm = smoothstep(0.0, 1.0, uOrder);
    float amp  = mix(0.62, 0.10, calm);
    float freq = mix(9.0, 6.0, calm);

    // domain warp — this is what makes the lines feel like a current
    vec2 q = vec2(fbm(p * 1.15 + vec2(0.0, uTime * 0.045)),
                  fbm(p * 1.15 + vec2(4.7, -uTime * 0.038)));
    float field = p.y * 2.0 + amp * fbm(p * 1.3 + q * 1.5 + vec2(uTime * 0.03, 0.0));

    // the pointer lifts the sheet, like a hand under silk
    vec2 mouse = vec2(uPointer.x * uAspect * 0.5, uPointer.y * 0.5);
    float d = length(p - mouse);
    field += (0.13 + uSwell * 0.30) * exp(-d * d * 5.0);

    // contours: one line per band, thickness kept constant in screen space
    float bands = field * freq;
    float w = clamp(fwidth(bands), 0.0015, 0.5);
    float line = smoothstep(0.5 + w, 0.5 - w, abs(fract(bands) - 0.5));
    // where bands pack tighter than a pixel they can only alias into a grey
    // wash, so fade them out instead of drawing them
    line *= 1.0 - smoothstep(0.16, 0.45, w);

    // depth cue — lines near the pointer and the centre read brighter
    float centre = 1.0 - smoothstep(0.15, 1.05, length(p));
    float near   = exp(-d * d * 3.0);
    float energy = line * (0.30 + centre * 0.26 + near * 0.40);

    vec3 deep = vec3(0.16, 0.12, 0.40); // brand indigo
    vec3 lift = vec3(0.62, 0.54, 1.00);
    vec3 warm = vec3(0.36, 0.68, 0.70); // teal, only at the brightest crests
    vec3 col  = mix(deep, lift, energy);
    col = mix(col, warm, smoothstep(0.75, 1.35, energy) * 0.5);

    // vertical falloff so the field never fights the copy at the edges
    float veil = smoothstep(0.0, 0.26, uv.y) * smoothstep(1.0, 0.74, uv.y);

    // additive blending ignores alpha, so premultiply: empty space must
    // contribute exactly nothing, or the whole quad hazes the page grey
    vec3 outc = col * energy * (0.26 + veil * 0.55) * 0.78;

    gl_FragColor = vec4(outc, 1.0);
  }
`

export default function SignalField({ reduced }: { reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()
  const swell = useRef(0)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOrder: { value: 0 },
      uAspect: { value: 1 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uSwell: { value: 0 },
    }),
    [],
  )

  useFrame((_state, delta) => {
    const u = mat.current?.uniforms
    if (!u) return
    const dt = Math.min(delta, 0.05)

    u.uTime.value += reduced ? 0 : dt
    u.uAspect.value = viewport.width / viewport.height

    // pointer eases in, so the lift trails the cursor instead of snapping
    const pt = u.uPointer.value as THREE.Vector2
    pt.x += (pointerState.x - pt.x) * 0.055
    pt.y += (pointerState.y - pt.y) * 0.055

    // the field settles across the first screen of scrolling
    const target = Math.min(1, scrollState.progress * 4.5)
    u.uOrder.value += (target - u.uOrder.value) * 0.045

    if (pointerState.click) {
      pointerState.click = 0
      swell.current = 1
    }
    swell.current *= 0.94
    u.uSwell.value = swell.current
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
