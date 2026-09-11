import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Account, AppSettings, AppState, Category, Movement } from '@/types'
import { DEFAULT_CATEGORIES } from '@/data/defaultCategories'
import { computeCashTotal, emptyCashCounts, uid } from '@/lib/money'

const STORAGE_KEY = 'finanzas:state'
export const SCHEMA_VERSION = 3

export const EXPORT_HEADER = {
  app: 'mis-finanzas',
  schemaVersion: SCHEMA_VERSION,
} as const

type NewAccount = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
type NewMovement = Omit<Movement, 'id' | 'createdAt'>
type NewCategory = Omit<Category, 'id'>

export interface FinanceStore extends AppState {
  addAccount: (input: NewAccount) => void
  updateAccount: (id: string, patch: Partial<Account>) => void
  deleteAccount: (id: string) => void
  addMovement: (input: NewMovement) => void
  updateMovement: (id: string, patch: Partial<Movement>) => void
  deleteMovement: (id: string) => void
  addCategory: (input: NewCategory) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => boolean
  replaceAll: (state: Pick<AppState, 'accounts' | 'movements' | 'categories' | 'settings'>) => void
  updateSettings: (patch: Partial<AppSettings>) => void
  clearAll: () => void
}

function applyMovementDelta(
  accounts: Account[],
  movement: Movement,
  invert: boolean,
): Account[] {
  const byId = new Map(accounts.map((a) => [a.id, { ...a, cash: a.cash ? { ...a.cash } : undefined }]))
  const sign = invert ? -1 : 1
  const counts = movement.cashBreakdown ?? {}
  const amount = movement.amount

  const apply = (accountId: string | undefined, gain: boolean) => {
    const acc = byId.get(accountId ?? '')
    if (!acc) return
    const factor = gain ? sign : -sign
    if (acc.kind === 'cash') {
      const next: Account['cash'] = { ...(acc.cash ?? emptyCashCounts()) }
      for (const [denom, count] of Object.entries(counts)) {
        const d = Number(denom)
        const delta = factor * (count ?? 0)
        const after = (next[d] ?? 0) + delta
        if (after <= 0) delete next[d]
        else next[d] = after
      }
      acc.cash = next
      acc.balance = computeCashTotal(next)
    } else {
      acc.balance = acc.balance + factor * amount
    }
    acc.updatedAt = Date.now()
  }

  if (movement.type === 'income') apply(movement.accountId, true)
  else if (movement.type === 'expense') apply(movement.accountId, false)
  else {
    apply(movement.fromAccountId, false)
    apply(movement.toAccountId, true)
  }
  return [...byId.values()]
}

export const useStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      version: SCHEMA_VERSION,
      accounts: [],
      movements: [],
      categories: DEFAULT_CATEGORIES,
      settings: { theme: 'system' },

      addAccount: (input) =>
        set((s) => {
          const now = Date.now()
          const account: Account = {
            ...input,
            balance:
              input.kind === 'cash'
                ? computeCashTotal(input.cash ?? emptyCashCounts())
                : input.balance,
            id: uid('acc'),
            createdAt: now,
            updatedAt: now,
          }
          return { accounts: [...s.accounts, account] }
        }),

      updateAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => {
            if (a.id !== id) return a
            const next = { ...a, ...patch }
            if (a.kind === 'cash') {
              next.balance = computeCashTotal(next.cash ?? emptyCashCounts())
            }
            next.updatedAt = Date.now()
            return next
          }),
        })),

      deleteAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          movements: s.movements.filter(
            (m) =>
              m.accountId !== id && m.fromAccountId !== id && m.toAccountId !== id,
          ),
        })),

      addMovement: (input) =>
        set((s) => {
          const movement: Movement = { ...input, id: uid('mov'), createdAt: Date.now() }
          return {
            movements: [...s.movements, movement],
            accounts: applyMovementDelta(s.accounts, movement, false),
          }
        }),

      updateMovement: (id, patch) =>
        set((s) => {
          const existing = s.movements.find((m) => m.id === id)
          if (!existing) return {}
          const updated: Movement = { ...existing, ...patch }
          let accounts = applyMovementDelta(s.accounts, existing, true)
          accounts = applyMovementDelta(accounts, updated, false)
          return {
            movements: s.movements.map((m) => (m.id === id ? updated : m)),
            accounts,
          }
        }),

      deleteMovement: (id) =>
        set((s) => {
          const existing = s.movements.find((m) => m.id === id)
          return {
            movements: s.movements.filter((m) => m.id !== id),
            accounts: existing ? applyMovementDelta(s.accounts, existing, true) : s.accounts,
          }
        }),

      addCategory: (input) =>
        set((s) => ({ categories: [...s.categories, { ...input, id: uid('cat') }] })),

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteCategory: (id) => {
        const inUse = get().movements.some((m) => m.categoryId === id)
        if (inUse) return false
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
        return true
      },

      replaceAll: (state) => set(state),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      clearAll: () =>
        set({ accounts: [], movements: [], categories: DEFAULT_CATEGORIES, settings: { theme: 'system' } }),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      partialize: (s) => ({
        version: s.version,
        accounts: s.accounts,
        movements: s.movements,
        categories: s.categories,
        settings: s.settings,
      }),
      migrate: () => ({
        version: SCHEMA_VERSION,
        accounts: [],
        movements: [],
        categories: DEFAULT_CATEGORIES,
        settings: { theme: 'system' } as AppState['settings'],
      }),
    },
  ),
)

export function accountTotal(account: Account): number {
  return account.kind === 'cash'
    ? computeCashTotal((account.cash ?? emptyCashCounts()) as Record<number, number>)
    : account.balance
}

export function selectAccountNames(state: Pick<AppState, 'accounts'>): Map<string, string> {
  return new Map(state.accounts.map((a) => [a.id, a.name]))
}