import type { Account, AppState, Movement } from '@/types'
import { computeCashTotal } from '@/lib/money'

export function currentMonthISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function monthOf(date: string): string {
  return date.slice(0, 7)
}

export interface DashboardSummary {
  totalAssets: number
  totalOnline: number
  totalCash: number
  monthIncome: number
  monthExpense: number
  monthBalance: number
  byCategory: { categoryId: string; amount: number; count: number }[]
  recent: Movement[]
}

export function summarize(state: Pick<AppState, 'accounts' | 'movements' | 'categories'>, month: string = currentMonthISO()): DashboardSummary {
  let totalOnline = 0
  let totalCash = 0
  const byId = new Map<string, Account>()
  for (const a of state.accounts) {
    byId.set(a.id, a)
    const v = a.kind === 'cash' ? computeCashTotal(a.cash ?? {}) : a.balance
    if (a.kind === 'cash') totalCash += v
    else totalOnline += v
  }

  let monthIncome = 0
  let monthExpense = 0
  const catTotals = new Map<string, { amount: number; count: number }>()

  for (const m of state.movements) {
    if (monthOf(m.date) !== month) continue
    if (m.type === 'income') {
      monthIncome += m.amount
    } else if (m.type === 'expense') {
      monthExpense += m.amount
      if (m.categoryId) {
        const cur = catTotals.get(m.categoryId) ?? { amount: 0, count: 0 }
        cur.amount += m.amount
        cur.count += 1
        catTotals.set(m.categoryId, cur)
      }
    }
  }

  const recent = [...state.movements]
    .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)))
    .slice(0, 8)

  return {
    totalAssets: totalOnline + totalCash,
    totalOnline,
    totalCash,
    monthIncome,
    monthExpense,
    monthBalance: monthIncome - monthExpense,
    byCategory: Array.from(catTotals.entries())
      .map(([categoryId, v]) => ({ categoryId, ...v }))
      .sort((a, b) => b.amount - a.amount),
    recent,
  }
}