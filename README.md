# KHAMSIN

Storefront for a fictional niche fragrance house in Cairo — a portfolio project built by Digitivia.
The house, its perfumes and its prices are invented; no payment is ever taken.

Live: <https://digitivia.github.io/digitivia-web/>

## Running it

```bash
npm install
npm run dev      # http://localhost:5273
npm run build    # typecheck + bundle to ./dist
npm run test     # cart reducer
npm run lint
```

Add `?motion=full` to the URL to force full motion on a machine whose OS reports
`prefers-reduced-motion: reduce` (Windows' "animation effects" toggle does this). `?motion=reduce`
forces the opposite. The choice sticks in `localStorage`.

## How it fits together

One fixed WebGL canvas sits behind the whole document: the lit contour field, one glass flacon, and
the post stack. The DOM never passes scene data as props — React owns the page, the render loop owns
the scene, and `src/lib/scene.ts` is the single mutable channel between them.

There is exactly one transmissive mesh on screen at any time. Transmission re-renders the scene once
per glass object, so the collection is one flacon that changes juice and light rather than five
bottles in a grid.

```
src/
  data/catalog.ts        the five perfumes
  lib/scene.ts           the DOM → canvas channel (active, focus, pulse, dim, sillage)
  lib/route.ts           hash routing + view transitions
  lib/cart.tsx           cart context; the reducer is pure and tested
  lib/motion.ts          Lenis, reduced-motion policy, pointer + sillage sampling
  lib/scrollfx.ts        one scroll choreography pass, opted into with data-fx
  components/Scene.tsx   the canvas: field, flacon, lights, effects
```

Design decisions and their reasoning: [`docs/superpowers/specs/2026-07-28-khamsin-storefront-design.md`](docs/superpowers/specs/2026-07-28-khamsin-storefront-design.md).

## Deploying

Pushing to `main` builds and publishes to GitHub Pages (`.github/workflows/deploy.yml`). Vite's
`base` switches to `/digitivia-web/` only under `GITHUB_ACTIONS`; point a custom domain at it and
set that back to `/`.
