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
  '#a3b0f4',
  '#7db8f7',
  '#5ecfc6',
  '#63d1ae',
  '#f7c56e',
  '#f8b08c',
  '#f5a2d2',
  '#bca0f5',
]

export const CATEGORY_COLORS = [
  '#a3b0f4',
  '#7db8f7',
  '#5ecfc6',
  '#63d1ae',
  '#c3e07e',
  '#f7c56e',
  '#f8b08c',
  '#ee8a83',
  '#f5a2d2',
  '#bca0f5',
  '#c79ac9',
  '#b6c2d1',
]