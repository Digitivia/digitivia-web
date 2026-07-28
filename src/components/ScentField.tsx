import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointerState } from '../lib/motion'
import { TRAIL, activeProduct, decayTrail, sceneState, trail } from '../lib/scene'

/**
 * The air the bottle stands in: a lit contour field of wind-borne dust.
 *
 * Two things make it more than a background. The light is a real source with
 * falloff, tinted by whichever perfume the scene is wearing — so changing
 * product changes the colour of the room. And the pointer leaves sillage: a
 * decaying trail burned into the contours behind the cursor.
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
  uniform float uOrder;     // 0 = turbulent, 1 = settled
  uniform float uAspect;
  uniform vec2  uPointer;   // -1..1
  uniform float uSwell;     // click swell, decays back to 0
  uniform vec2  uLight;     // the source lighting the field
  uniform float uHeat;      // how hot the source burns
  uniform vec3  uWarm;      // the perfume's own light
  uniform vec3  uJuice;     // its juice, used in the mid tones
  uniform float uPulse;     // add-to-cart: a ring of light crossing the frame
  uniform float uDim;       // the closing frame: the source goes out, sillage stays
  uniform vec3  uTrail[${TRAIL}]; // sillage: xy position, z life

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

    // how far the air has settled: turbulence fades, lines spread apart
    float calm = smoothstep(0.0, 1.0, uOrder);
    float amp  = mix(0.62, 0.12, calm);
    float freq = mix(9.0, 6.2, calm);

    // domain warp — this is what makes the lines drift like warm air
    vec2 q = vec2(fbm(p * 1.15 + vec2(0.0, uTime * 0.045)),
                  fbm(p * 1.15 + vec2(4.7, -uTime * 0.038)));
    float field = p.y * 2.0 + amp * fbm(p * 1.3 + q * 1.5 + vec2(uTime * 0.03, 0.0));

    // the pointer lifts the sheet, like a hand under silk
    vec2 mouse = vec2(uPointer.x * uAspect * 0.5, uPointer.y * 0.5);
    float d = length(p - mouse);
    field += (0.13 + uSwell * 0.30) * exp(-d * d * 5.0);

    // ── sillage: where the pointer has been, the air is still displaced.
    // each sample lifts the sheet by its remaining life, so the trail reads
    // as a wake rather than a row of dots.
    float wake = 0.0;
    for (int i = 0; i < ${TRAIL}; i++) {
      vec3 t = uTrail[i];
      if (t.z <= 0.001) continue;
      vec2 tp = vec2(t.x * uAspect * 0.5, t.y * 0.5);
      float td = length(p - tp);
      float w = exp(-td * td * 26.0) * t.z;
      field += w * 0.085;
      wake += w;
    }

    // contours: one line per band, thickness kept constant in screen space
    float bands = field * freq;
    float w = clamp(fwidth(bands), 0.0015, 0.5);
    float line = smoothstep(0.5 + w, 0.5 - w, abs(fract(bands) - 0.5));
    // where bands pack tighter than a pixel they can only alias into a grey
    // wash, so fade them out instead of drawing them
    line *= 1.0 - smoothstep(0.16, 0.45, w);

    // ── the field is lit, not tinted. one source, everything falls off it
    vec2  lp    = vec2(uLight.x * uAspect, uLight.y);
    float ld    = length(p - lp);
    float core  = exp(-ld * ld * 9.0);              // the hot centre, kept small
    float halo  = exp(-ld * ld * 1.9);              // the reach of the glow
    float beam  = exp(-pow(abs(p.x - lp.x) * 4.2, 1.7)) *
                  smoothstep(-0.1, 0.75, p.y - lp.y) *
                  smoothstep(0.95, 0.35, p.y - lp.y); // light climbing, then fading

    float lit = (core * 0.85 + halo * 0.30 + beam * 0.16) * uHeat;

    // the cart pulse: a ring expanding from the source, once, then gone
    float ring = exp(-pow((ld - (1.0 - uPulse) * 1.9) * 7.0, 2.0)) * uPulse;
    lit += ring * 0.5;

    // the closing frame kills the source but never the wake
    lit *= 1.0 - uDim * 0.97;

    float near   = exp(-d * d * 3.0);
    float energy = line * (0.13 + lit * 0.80 + near * 0.30 + wake * 0.55);

    // four stops, cool to hot: a cold rim so the dark reads three-dimensional,
    // the juice through the mids, the perfume's own light, then a white core.
    // the cool stop stays dark: at full strength it washes the whole frame
    // teal, which is exactly what a "cold contrast" must never do
    vec3 rim  = vec3(0.02, 0.08, 0.09);
    vec3 mid  = uJuice;
    vec3 warm = uWarm;
    vec3 hot  = vec3(1.00, 0.97, 0.92);
    vec3 col  = mix(rim, mid, smoothstep(0.015, 0.24, lit));
    col = mix(col, warm, smoothstep(0.22, 0.70, lit) * 0.9);
    col = mix(col, hot, smoothstep(0.92, 1.5, lit + energy * 0.3));
    // the wake carries the perfume's colour even far from the source
    col = mix(col, warm, clamp(wake * 0.9, 0.0, 0.65));

    // crush the frame: corners go to true black so the light has somewhere
    // to fall off to, the way a lens sees a source in a dark room
    float veil = smoothstep(0.0, 0.22, uv.y) * smoothstep(1.0, 0.80, uv.y);
    float edge = 1.0 - smoothstep(0.35, 1.25, length(vec2(p.x * 0.62, p.y)));

    // additive blending ignores alpha, so premultiply: empty space must
    // contribute exactly nothing, or the whole quad hazes the page grey
    vec3 outc = col * energy * (0.18 + veil * 0.5) * (0.30 + edge * 0.85) * 0.82;

    // a bare breath of the source itself, so the glow reads between lines
    outc += (core * 0.05 + halo * 0.014) * uHeat * mix(warm, hot, core) * edge;

    // tone map. additive light has no ceiling of its own, and without this the
    // bright half of the frame clips to flat white
    outc = outc / (1.0 + outc);

    // tone mapping desaturates as it compresses, so put the chroma back
    float luma = dot(outc, vec3(0.2126, 0.7152, 0.0722));
    outc = mix(vec3(luma), outc, 1.5);
    outc = max(outc, vec3(0.0));

    gl_FragColor = vec4(outc, 1.0);
  }
`

const warmC = new THREE.Color()
const juiceC = new THREE.Color()

export default function ScentField({ reduced }: { reduced: boolean }) {
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
      uLight: { value: new THREE.Vector2(0.0, -0.42) },
      uHeat: { value: 1 },
      uWarm: { value: new THREE.Color('#ff7a3c') },
      uJuice: { value: new THREE.Color('#5a1f14') },
      uPulse: { value: 0 },
      uDim: { value: 0 },
      uTrail: { value: Array.from({ length: TRAIL }, () => new THREE.Vector3()) },
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

    // sillage decays whether or not the pointer is moving
    decayTrail(dt)
    const tu = u.uTrail.value as THREE.Vector3[]
    for (let i = 0; i < TRAIL; i++) {
      const t = trail[i]
      tu[i].set(t.x, t.y, reduced ? 0 : t.life * t.life)
    }

    // measured in screens, not in document progress: this page is ten
    // viewports tall, so `progress` would leave the source burning at full
    // heat well into the collection and wash the copy out
    const screens = window.scrollY / Math.max(1, window.innerHeight)

    // the air settles across the first screen of scrolling
    const target = Math.min(1, screens * 0.9)
    u.uOrder.value += (target - u.uOrder.value) * 0.045

    // the source burns brightest at the top, then cools to atmosphere so the
    // rest of the page keeps its contrast. close-up on a product relights it.
    const heat = (1 - Math.min(1, screens * 0.75) * 0.72) * (1 + sceneState.focusEased * 0.75)
    u.uHeat.value += (heat - u.uHeat.value) * 0.05

    // the room takes the colour of whatever perfume is on stage
    const prod = activeProduct()
    const warm = u.uWarm.value as THREE.Color
    const juice = u.uJuice.value as THREE.Color
    warm.lerp(warmC.set(prod.light), 0.04)
    juice.lerp(juiceC.set(prod.juice), 0.04)

    // it also drifts a little with the pointer, like a light you can nudge
    const lt = u.uLight.value as THREE.Vector2
    lt.x += (pointerState.x * 0.1 - lt.x) * 0.03
    lt.y += (-0.42 + pointerState.y * 0.06 - lt.y) * 0.03

    if (pointerState.click) {
      pointerState.click = 0
      swell.current = 1
    }
    swell.current *= 0.94
    u.uSwell.value = swell.current

    sceneState.pulse *= 0.955
    if (sceneState.pulse < 0.01) sceneState.pulse = 0
    u.uPulse.value = sceneState.pulse

    u.uDim.value += (sceneState.dim - u.uDim.value) * 0.08
  })

  return (
    // the quad has to sit on the camera plane `viewport` was measured at, or it
    // renders smaller than the screen and its own edge becomes visible
    <mesh scale={[viewport.width, viewport.height, 1]} renderOrder={-10}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
