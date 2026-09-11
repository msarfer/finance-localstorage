import { BILLS, COINS } from '@/data/constants'
import type { CashCounts } from '@/types'

const eurFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

const numberFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatEUR(cents: number): string {
  return eurFormatter.format(cents / 100)
}

export function formatNumber(cents: number): string {
  return numberFormatter.format(cents / 100)
}

export function computeCashTotal(cash: CashCounts): number {
  return Object.entries(cash).reduce<number>(
    (total, [denom, count]) => total + Number(denom) * (count ?? 0),
    0,
  )
}

export function emptyCashCounts(): CashCounts {
  return {}
}

export function countsFromValue(cents: number): CashCounts {
  const result: CashCounts = {}
  let rest = Math.round(cents)
  for (const denom of BILLS) {
    const count = Math.floor(rest / denom)
    if (count > 0) {
      result[denom] = count
      rest -= count * denom
    }
  }
  for (const denom of COINS) {
    const count = Math.round(rest / denom)
    if (count > 0) {
      result[denom] = count
      rest -= count * denom
    }
  }
  return result
}

export function uid(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function parseCentsInput(input: string): number | null {
  const normalized = input.trim().replace(/\u00a0|\u202f/g, ' ').replace(/[€\s]/g, '')
  if (!normalized) return null
  const cleaned = normalized.replace(',', '.')
  const value = Number(cleaned)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100)
}

export function todayISO(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

export function isEuroBill(denom: number): boolean {
  return BILLS.includes(denom)
}