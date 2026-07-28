import { PRODUCTS } from '../data/catalog'

/**
 * The one channel between the DOM and the canvas.
 *
 * React owns the page; the render loop owns the scene. Passing state through
 * props would re-render the whole tree sixty times a second, so anything the
 * frame loop reads lives here as a plain mutable object instead.
 */
export const sceneState = {
  /** which perfume the scene is currently wearing (index into PRODUCTS) */
  active: 0,
  /** 0 = the house, 1 = a single perfume in close-up */
  focus: 0,
  /** eased toward `focus` in the frame loop, so the camera never snaps */
  focusEased: 0,
  /** set to 1 on add-to-cart; decays, and drives a light pulse */
  pulse: 0,
  /** 0..1 across the collection, drives the bottle's turntable */
  reveal: 0,
  /** the closing frame: the room goes out, only sillage is left */
  dim: 0,
}

/** Colour of the juice and of the light, for whatever the scene is wearing. */
export const activeProduct = () => PRODUCTS[Math.min(PRODUCTS.length - 1, Math.max(0, sceneState.active))]

/**
 * Sillage: a decaying ring buffer of where the pointer has been. The field
 * shader burns these in, so the cursor leaves a trail the way a perfume does.
 */
export const TRAIL = 10
export const trail = Array.from({ length: TRAIL }, () => ({ x: 0, y: 0, life: 0 }))
let head = 0
let lastPush = 0

export function pushTrail(x: number, y: number, now: number) {
  // one sample every ~55ms: dense enough to read as a line, cheap enough that
  // the whole buffer stays a fixed-size uniform
  if (now - lastPush < 55) return
  lastPush = now
  head = (head + 1) % TRAIL
  trail[head] = { x, y, life: 1 }
}

export function decayTrail(dt: number) {
  for (const t of trail) t.life = Math.max(0, t.life - dt * 0.42)
}
