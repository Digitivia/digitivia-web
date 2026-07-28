import { describe, expect, it } from 'vitest'
import { MAX_QTY, count, empty, reducer, shippingProgress, subtotal, type CartState } from './cart'

const line = { slug: 'layl', name: 'LAYL', price: 320, size: '50 ml' }
const add = (s: CartState, qty?: number) => reducer(s, { type: 'add', line, qty })

describe('cart reducer', () => {
  it('adds a line and opens the drawer', () => {
    const s = add(empty)
    expect(s.lines).toEqual([{ ...line, qty: 1 }])
    expect(s.open).toBe(true)
  })

  it('merges a repeat add instead of duplicating the line', () => {
    const s = add(add(empty))
    expect(s.lines).toHaveLength(1)
    expect(s.lines[0].qty).toBe(2)
  })

  it('caps quantity on both paths', () => {
    expect(add(empty, 99).lines[0].qty).toBe(MAX_QTY)
    const s = reducer(add(empty), { type: 'qty', slug: 'layl', qty: 99 })
    expect(s.lines[0].qty).toBe(MAX_QTY)
  })

  it('removes the line when quantity drops below one', () => {
    const s = reducer(add(empty), { type: 'qty', slug: 'layl', qty: 0 })
    expect(s.lines).toHaveLength(0)
  })

  it('ignores actions aimed at a slug that is not in the cart', () => {
    const s = reducer(add(empty), { type: 'remove', slug: 'siwa' })
    expect(s.lines).toHaveLength(1)
  })
})

describe('cart totals', () => {
  it('multiplies price by quantity', () => {
    const s = add(add(empty))
    expect(subtotal(s.lines)).toBe(640)
    expect(count(s.lines)).toBe(2)
  })

  it('clamps shipping progress at one', () => {
    expect(shippingProgress([])).toBe(0)
    expect(shippingProgress([{ ...line, qty: 1 }])).toBe(1) // 320 > 250
    expect(shippingProgress([{ ...line, price: 125, qty: 1 }])).toBe(0.5)
  })
})
