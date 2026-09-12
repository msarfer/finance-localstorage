export const BILLS = [50000, 20000, 10000, 5000, 2000, 1000, 500]

export const COINS = [200, 100, 50, 20, 10, 5]

export const DENOMINATIONS = [...BILLS, ...COINS]

export const BILL_LABELS: Record<number, string> = {
  50000: '500 €',
  20000: '200 €',
  10000: '100 €',
  5000: '50 €',
  2000: '20 €',
  1000: '10 €',
  500: '5 €',
}

export const COIN_LABELS: Record<number, string> = {
  200: '2 €',
  100: '1 €',
  50: '0,50 €',
  20: '0,20 €',
  10: '0,10 €',
  5: '0,05 €',
}

export const ACCOUNT_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
]

export const CATEGORY_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#84cc16',
  '#f97316',
  '#64748b',
  '#dc2626',
]