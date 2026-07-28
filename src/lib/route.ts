import { useEffect, useState } from 'react'

/**
 * Hash routing, ~30 lines, no dependency. Hashes also mean GitHub Pages can
 * serve a deep link without a 404.html rewrite dance.
 *
 *   #/           the house
 *   #/p/<slug>   a perfume
 */

export type Route = { name: 'home' } | { name: 'product'; slug: string }

export function parse(hash: string): Route {
  const path = hash.replace(/^#/, '')
  const m = /^\/p\/([a-z0-9-]+)$/.exec(path)
  return m ? { name: 'product', slug: m[1] } : { name: 'home' }
}

/** Navigate, wrapped in a view transition where the browser has one. */
export function go(path: string) {
  const apply = () => {
    window.location.hash = path
  }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
  if (doc.startViewTransition && !document.documentElement.classList.contains('force-reduce')) {
    doc.startViewTransition(apply)
  } else {
    apply()
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))

  useEffect(() => {
    const onHash = () => {
      setRoute(parse(window.location.hash))
      // a route is a new page as far as the reader is concerned
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return route
}
