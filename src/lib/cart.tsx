import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { sceneState } from './scene'

/**
 * Cart state. The reducer is pure and exported on its own so it can be tested
 * without mounting React — see cart.test.ts.
 */

export type Line = { slug: string; name: string; price: number; size: string; qty: number }

export type CartState = { lines: Line[]; open: boolean }

export type CartAction =
  | { type: 'add'; line: Omit<Line, 'qty'>; qty?: number }
  | { type: 'remove'; slug: string }
  | { type: 'qty'; slug: string; qty: number }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'hydrate'; lines: Line[] }

export const FREE_SHIPPING_AT = 250
export const MAX_QTY = 9

export const empty: CartState = { lines: [], open: false }

export function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const qty = action.qty ?? 1
      const found = state.lines.find((l) => l.slug === action.line.slug)
      const lines = found
        ? state.lines.map((l) =>
            l.slug === action.line.slug ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
          )
        : [...state.lines, { ...action.line, qty: Math.min(MAX_QTY, qty) }]
      return { lines, open: true }
    }
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.slug !== action.slug) }
    case 'qty': {
      // dropping to zero removes the line rather than leaving a dead row
      if (action.qty < 1) return { ...state, lines: state.lines.filter((l) => l.slug !== action.slug) }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.slug === action.slug ? { ...l, qty: Math.min(MAX_QTY, action.qty) } : l,
        ),
      }
    }
    case 'open':
      return { ...state, open: true }
    case 'close':
      return { ...state, open: false }
    case 'hydrate':
      return { ...state, lines: action.lines }
  }
}

export const subtotal = (lines: Line[]) => lines.reduce((n, l) => n + l.price * l.qty, 0)
export const count = (lines: Line[]) => lines.reduce((n, l) => n + l.qty, 0)
/** 0..1 toward free shipping — drives the bar in the drawer. */
export const shippingProgress = (lines: Line[]) =>
  Math.min(1, subtotal(lines) / FREE_SHIPPING_AT)

const KEY = 'khamsin.cart.v1'

type Ctx = { state: CartState; dispatch: (a: CartAction) => void }
const CartCtx = createContext<Ctx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, raw] = useReducer(reducer, empty)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      if (Array.isArray(saved) && saved.length) raw({ type: 'hydrate', lines: saved })
    } catch {
      /* a corrupt cart is not worth a crash */
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state.lines))
  }, [state.lines])

  // adding to the cart pulses light through the scene behind the page
  const dispatch = useMemo(
    () => (a: CartAction) => {
      if (a.type === 'add') sceneState.pulse = 1
      raw(a)
    },
    [],
  )

  return <CartCtx.Provider value={{ state, dispatch }}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart outside CartProvider')
  return ctx
}
