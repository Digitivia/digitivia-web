# KHAMSIN — storefront design

**Date:** 2026-07-28
**Status:** approved, implemented
**Repo:** `Digitivia/digitivia-web` (the Digitivia marketing site it replaces stays in git history)

## What this is

A client-facing ecommerce storefront for a fictional niche fragrance house, built as a portfolio
piece — the work itself, not a description of the work. The footer states plainly that the house,
its perfumes and its prices are fictional and that no payment is ever taken.

## The client

**KHAMSIN — Parfums d'extrait, Cairo, est. 2019.** Named for the spring wind that carries the
desert into the city. The name does the art direction: a scent is what a wind leaves on you, so
the WebGL field behind the page is wind-borne dust lit from below rather than an abstract gradient.

Five extraits at 50 ml, $185–$320, plus a $65 discovery set. Catalogue lives in
`src/data/catalog.ts`: SIWA, LAYL, NARENJ, ZAHR, RAML.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Deliverable | Real storefront | Browsing, product pages and a working cart prove more than a case-study page describing them |
| Imagery | WebGL, no photography | No product photos exist; stock would read as stock |
| Language | English only | One set of copy, fully attended to |
| Commerce depth | Browse → PDP → cart drawer | Checkout stops at an honest "concept store" panel |
| Routing | Hash routes | No dependency, and GitHub Pages serves deep links without a 404 rewrite |

## Architecture

**One channel between DOM and canvas.** `src/lib/scene.ts` holds a plain mutable object
(`active`, `focus`, `pulse`, `reveal`, `dim`) that the render loop reads every frame. Passing this
through React props would re-render the tree sixty times a second.

- `lib/route.ts` — hash router (`#/`, `#/p/<slug>`), wraps navigation in a view transition
- `lib/cart.tsx` — context + pure reducer + `localStorage`; reducer is exported and tested
- `lib/motion.ts` — Lenis, reduced-motion policy, pointer state, sillage sampling
- `lib/scrollfx.ts` — one choreography pass, opted into with `data-fx`
- `components/Scene.tsx` — the single fixed canvas: field, flacon, lights, post stack
- `components/ScentField.tsx` — the lit contour field
- `components/Bottle.tsx` — the flacon

## One bottle, five traces

Transmission re-renders the whole scene once per transmissive object, and drei's `View` does not
compose with postprocessing. A grid of five glass bottles is therefore off the table — so the house
casts **one** flacon and the collection changes its juice and its light instead. Exactly one
transmissive mesh is ever on screen. The constraint and the art direction are the same decision.

## The visual system

- **Palette** — warm near-black ground, ember as the emitted light, bone type, one cold jade
  accent. Authored in `src/index.css` under `@theme`.
- **Lighting** — the source is a floor light *behind* the flacon, never under it: underlighting
  glass makes it read as a lantern. Two narrow lightformer strips draw the long edge highlights
  that do most of the work of reading as glass. The environment is built from lightformers, not an
  HDR file — no network request, nothing new in the CSP.
- **Sillage** — a decaying ring buffer of pointer positions is burned into the field, so the cursor
  leaves a wake. The signature interaction, and literally what the product does.
- **Route change** — opening a product eases `sceneState.focus` toward 1 (the flacon grows and
  moves into its column) while the DOM cross-dissolves under the View Transitions API. No moment
  reads as a page load.
- **Cart** — liquid glass (`backdrop-filter` + inset hairline). Adding to cart sets `pulse`, which
  sends a ring of light across the field and lights the juice from inside.
- **The closing frame** — the last section scrubs `dim` to 1: the source goes out and the flacon
  recedes, leaving only the reader's own trail in the dark under one line, *What stays is the
  trace.*
- **Post stack** — bloom above a high luminance threshold so copy never smears, edge chromatic
  aberration, vignette. MSAA at 4.

## Responsive and motion policy

- Desktop: flacon stands in its own column beside the copy.
- Under 900 px: it drops to the lower third and shrinks; a permanent top scrim keeps the reading
  half legible. Copy is never set over glass.
- `prefers-reduced-motion` drops the trail, the turntable and the whole post stack, and lowers
  transmission samples. `?motion=full` still overrides an OS that reports reduce (Windows
  animation effects).

## Verification

- `npm run build` — typecheck + bundle
- `npm run test` — cart reducer and totals (7 cases)
- Playwright screenshots at 390 and 1280; horizontal overflow measured at 0 on 390

## Known ceilings

- Bundle is ~1.4 MB (400 kB gzipped), dominated by three. Code-splitting the canvas behind a
  dynamic import is the obvious next move if first paint matters more than it does today.
- Checkout is deliberately a dead end.
