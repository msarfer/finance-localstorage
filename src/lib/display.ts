import type { MovementType } from '../types'
import { formatEUR } from '../lib/money'

export const MOVEMENT_TYPE_LABEL: Record<MovementType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function monthLabel(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date)
}

export function signedEUR(cents: number, type: MovementType): string {
  if (type === 'expense') return `- ${formatEUR(cents)}`
  if (type === 'income') return `+ ${formatEUR(cents)}`
  return formatEUR(cents)
}