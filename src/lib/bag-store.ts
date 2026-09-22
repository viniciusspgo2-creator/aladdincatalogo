'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BagItem {
  productId: string
  slug: string
  name: string
  brand: string
  code?: string | null
  image?: string | null
  price: number
  quantity: number
  minQuantity: number
}

interface BagState {
  items: BagItem[]
  add: (item: Omit<BagItem, 'quantity'>, qty?: number) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty) =>
        set((state) => {
          const q = Math.max(qty ?? item.minQuantity ?? 1, item.minQuantity ?? 1)
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + q } : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: q }] }
        }),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(0, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      count: () => get().items.reduce((acc, i) => acc + 1, 0),
    }),
    { name: 'aladdin-bag' },
  ),
)
