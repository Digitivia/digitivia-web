import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointerState, scrollState } from '../lib/motion'

const COUNT = 26000
const COLS = 200
const ROWS = COUNT / COLS

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uOrder;      // 0 = signal (chaotic vortex), 1 = system (grid)
  uniform vec2  uPointer;    // world-space pointer
  uniform float uBurst;      // click shockwave radius, 0 when idle
  uniform float uVel;        // scroll velocity

  attribute vec3  aGrid;
  attribute float aSeed;
  attribute float aRadius;
  attribute float aSpeed;

  varying float vGlow;
  varying float vDepth;

  // cheap 3d hash noise — enough for organic drift, far cheaper than simplex
  float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p){
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
    return n * 2.0 - 1.0;
  }

  void main() {
    // ── state A: the signal. a turbulent torus of noise-driven orbits
    float ang = aSeed * 6.2831853 + uTime * aSpeed * (1.0 + uVel * 0.4);
    float r   = aRadius * (1.0 + noise(vec3(aSeed * 7.0, uTime * 0.22, 0.0)) * 0.24);
    // the signal state sits right of centre so the headline keeps a clean field
    vec3 signalPos = vec3(cos(ang) * r * 1.5 + 3.1, sin(ang) * r * 0.92, sin(ang * 2.0 + aSeed * 9.0) * 1.4);
    signalPos += vec3(
      noise(vec3(signalPos.xy * 0.34, uTime * 0.18)),
      noise(vec3(signalPos.yz * 0.34, uTime * 0.18 + 4.0)),
      noise(vec3(signalPos.zx * 0.34, uTime * 0.18 + 8.0))
    ) * 0.85;

    // ── state B: the system. an exact lattice, breathing very slightly
    vec3 gridPos = aGrid;
    gridPos.z += sin(uTime * 0.9 + aGrid.x * 0.55 + aGrid.y * 0.35) * 0.13;

    // stagger the morph so the lattice assembles left-to-right, not all at once
    float stagger = clamp((uOrder * 1.55) - (aGrid.x + 9.0) / 20.0, 0.0, 1.0);
    float k = stagger * stagger * (3.0 - 2.0 * stagger);
    vec3 pos = mix(signalPos, gridPos, k);

    // ── pointer repulsion, strongest while the field is still chaotic
    vec2 toP = pos.xy - uPointer;
    float d = length(toP);
    float push = smoothstep(3.4, 0.0, d) * (1.0 - k * 0.65);
    pos.xy += normalize(toP + 1e-4) * push * 1.5;

    // ── click shockwave: a travelling ring of displacement
    float band = 1.0 - smoothstep(0.0, 0.9, abs(d - uBurst));
    pos.xy += normalize(toP + 1e-4) * band * 1.1;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    vDepth = clamp((pos.z + 2.5) / 5.0, 0.0, 1.0);
    vGlow  = push * 1.6 + band * 2.2 + k * 0.55 + 0.55;
    gl_PointSize = (9.0 + vDepth * 11.0 + push * 14.0) * (1.0 / -mv.z);
  }
`

const fragment = /* glsl */ `
  precision mediump float;
  varying float vGlow;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.02, d);

    vec3 deep = vec3(0.17, 0.12, 0.42);   // brand indigo, far from the camera
    vec3 near = vec3(0.65, 0.55, 1.00);   // lift
    vec3 hot  = vec3(0.36, 0.68, 0.70);   // teal, only where energy is high
    vec3 col  = mix(deep, near, vDepth);
    col = mix(col, hot, clamp(vGlow - 1.0, 0.0, 1.0) * 0.65);

    gl_FragColor = vec4(col * (0.75 + vGlow * 0.6), alpha * (0.5 + vDepth * 0.85));
  }
`

export default function SignalField({ reduced }: { reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()
  const pointer = useRef(new THREE.Vector2(999, 999))
  const burst = useRef(0)

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(COUNT * 3)
    const grid = new Float32Array(COUNT * 3)
    const seed = new Float32Array(COUNT)
    const radius = new Float32Array(COUNT)
    const speed = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      grid[i * 3] = (col / (COLS - 1) - 0.5) * 19
      grid[i * 3 + 1] = (row / (ROWS - 1) - 0.5) * 9.5
      grid[i * 3 + 2] = 0
      seed[i] = Math.random()
      radius[i] = 2.1 + Math.random() * 2.6
      speed[i] = 0.06 + Math.random() * 0.24
    }

    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aGrid', new THREE.BufferAttribute(grid, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aRadius', new THREE.BufferAttribute(radius, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 24)
    return g
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOrder: { value: 0 },
      uPointer: { value: new THREE.Vector2(999, 999) },
      uBurst: { value: 0 },
      uVel: { value: 0 },
    }),
    [],
  )

  useFrame((_state, delta) => {
    const u = mat.current?.uniforms
    if (!u) return

    u.uTime.value += reduced ? 0 : Math.min(delta, 0.05)

    // pointer → world space on the z=0 plane
    pointer.current.set(
      (pointerState.x * viewport.width) / 2,
      (pointerState.y * viewport.height) / 2,
    )
    u.uPointer.value.lerp(pointer.current, 0.12)

    // the field orders itself over the first viewport of scrolling
    const target = Math.min(1, scrollState.progress * 5.2)
    u.uOrder.value += (target - u.uOrder.value) * 0.06
    u.uVel.value += (Math.min(Math.abs(scrollState.velocity) * 0.05, 2) - u.uVel.value) * 0.08

    if (pointerState.click) {
      pointerState.click = 0
      burst.current = 0.001
    }
    if (burst.current > 0) {
      burst.current += delta * 9
      if (burst.current > 9) burst.current = 0
    }
    u.uBurst.value = burst.current
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
