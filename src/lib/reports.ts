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

export interface TrendPoint {
  month: string
  label: string
  income: number
  expense: number
}

export function monthlyTrend(
  state: Pick<AppState, 'movements'>,
  months: number = 6,
): TrendPoint[] {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('es-ES', { month: 'short' })
  const points: TrendPoint[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    let income = 0
    let expense = 0
    for (const m of state.movements) {
      if (monthOf(m.date) !== month) continue
      if (m.type === 'income') income += m.amount
      else if (m.type === 'expense') expense += m.amount
    }
    points.push({
      month,
      label: fmt.format(d).replace('.', '').trim(),
      income,
      expense,
    })
  }
  return points
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
      const key = m.categoryId || ''
      const cur = catTotals.get(key) ?? { amount: 0, count: 0 }
      cur.amount += m.amount
      cur.count += 1
      catTotals.set(key, cur)
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