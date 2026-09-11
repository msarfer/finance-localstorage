import type { Account, AppState, Category, Movement } from '../types'
import { DENOMINATIONS } from '../data/constants'
import { computeCashTotal } from '../lib/money'
import { EXPORT_HEADER, SCHEMA_VERSION } from '../store/useStore'

export interface ExportFile {
  app: string
  schemaVersion: number
  exportedAt: string
  data: Pick<AppState, 'accounts' | 'movements' | 'categories' | 'settings'>
}

export function buildExport(state: Pick<AppState, 'accounts' | 'movements' | 'categories' | 'settings'>): ExportFile {
  return {
    ...EXPORT_HEADER,
    exportedAt: new Date().toISOString(),
    data: state,
  }
}

export interface ImportResult {
  ok: boolean
  state?: Pick<AppState, 'accounts' | 'movements' | 'categories' | 'settings'>
  errors: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateSettings(value: unknown): AppState['settings'] {
  if (!isRecord(value)) return { theme: 'system' }
  const theme = value.theme === 'dark' || value.theme === 'light' ? value.theme : 'system'
  return { theme }
}

function validateAccount(value: unknown, errors: string[], idx: number): Account | null {
  if (!isRecord(value)) {
    errors.push(`Cuenta ${idx + 1}: no es un objeto válido`)
    return null
  }
  const kind = value.kind === 'cash' ? 'cash' : 'online'
  const name = typeof value.name === 'string' && value.name.trim() ? value.name.trim() : null
  if (!name) {
    errors.push(`Cuenta ${idx + 1}: nombre obligatorio`)
    return null
  }
  const cash: Record<number, number> = {}
  if (kind === 'cash' && isRecord(value.cash)) {
    for (const [denom, count] of Object.entries(value.cash)) {
      const d = Number(denom)
      const c = typeof count === 'number' ? count : 0
      if (DENOMINATIONS.includes(d) && Number.isInteger(c) && c >= 0 && c <= 100000) {
        cash[d] = c
      }
    }
  }
  return {
    id: typeof value.id === 'string' ? value.id : `acc-import-${idx}`,
    kind,
    name,
    entity: typeof value.entity === 'string' ? value.entity : undefined,
    balance: kind === 'cash' ? computeCashTotal(cash) : Math.max(0, Math.round(Number(value.balance) || 0)),
    cash: kind === 'cash' ? cash : undefined,
    color: typeof value.color === 'string' ? value.color : '#6366f1',
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : Date.now(),
  }
}

function validateMovement(value: unknown, errors: string[], idx: number): Movement | null {
  if (!isRecord(value)) {
    errors.push(`Movimiento ${idx + 1}: no es un objeto válido`)
    return null
  }
  const type = value.type === 'income' || value.type === 'expense' || value.type === 'transfer' ? value.type : null
  if (!type) {
    errors.push(`Movimiento ${idx + 1}: tipo inválido`)
    return null
  }
  const amount = Math.round(Number(value.amount))
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push(`Movimiento ${idx + 1}: importe inválido`)
    return null
  }
  if (type === 'transfer') {
    if (typeof value.fromAccountId !== 'string' || typeof value.toAccountId !== 'string') {
      errors.push(`Movimiento ${idx + 1}: transferencia sin cuentas origen/destino`)
      return null
    }
  } else if (typeof value.accountId !== 'string') {
    errors.push(`Movimiento ${idx + 1}: no tiene cuenta asociada`)
    return null
  }
  return {
    id: typeof value.id === 'string' ? value.id : `mov-import-${idx}`,
    type,
    amount,
    concept: typeof value.concept === 'string' ? value.concept : undefined,
    categoryId: typeof value.categoryId === 'string' ? value.categoryId : undefined,
    accountId: typeof value.accountId === 'string' ? value.accountId : undefined,
    fromAccountId: typeof value.fromAccountId === 'string' ? value.fromAccountId : undefined,
    toAccountId: typeof value.toAccountId === 'string' ? value.toAccountId : undefined,
    date: typeof value.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.date) ? value.date : new Date().toISOString().slice(0, 10),
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
  }
}

function validateCategory(value: unknown, errors: string[], idx: number): Category | null {
  if (!isRecord(value)) {
    errors.push(`Categoría ${idx + 1}: no es un objeto válido`)
    return null
  }
  const name = typeof value.name === 'string' && value.name.trim() ? value.name.trim() : null
  if (!name) {
    errors.push(`Categoría ${idx + 1}: nombre obligatorio`)
    return null
  }
  const type = value.type === 'income' || value.type === 'expense' || value.type === 'both' ? value.type : 'both'
  return {
    id: typeof value.id === 'string' ? value.id : `cat-import-${idx}`,
    name,
    emoji: typeof value.emoji === 'string' ? value.emoji : undefined,
    color: typeof value.color === 'string' ? value.color : '#6366f1',
    type,
  }
}

export function parseImport(raw: string): ImportResult {
  const errors: string[] = []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, errors: ['El archivo no es JSON válido'] }
  }

  if (!isRecord(parsed)) {
    return { ok: false, errors: ['La raíz del archivo no es un objeto'] }
  }

  if (parsed.app !== 'mis-finanzas') {
    return { ok: false, errors: ['El archivo no parece una exportación de Mis Finanzas'] }
  }

  const data = isRecord(parsed.data) ? parsed.data : parsed
  const accountsRaw = Array.isArray(data.accounts) ? data.accounts : []
  if (!Array.isArray(data.accounts)) errors.push('No se encontró la lista de cuentas')

  const accounts = accountsRaw
    .map((v, i) => validateAccount(v, errors, i))
    .filter((a): a is Account => a !== null)
  const movements = (Array.isArray(data.movements) ? data.movements : [])
    .map((v, i) => validateMovement(v, errors, i))
    .filter((m): m is Movement => m !== null)
  const categories = (Array.isArray(data.categories) ? data.categories : [])
    .map((v, i) => validateCategory(v, errors, i))
    .filter((c): c is Category => c !== null)

  if (accounts.length === 0) {
    return { ok: false, errors: ['No hay ninguna cuenta válida en el archivo'] }
  }

  if (errors.length > 20) {
    errors.length = 20
    errors.push('...')
  }

  return {
    ok: true,
    state: { accounts, movements, categories, settings: validateSettings(data.settings) },
    errors,
  }
}

export function formatErrorsSummary(errors: string[]): string {
  if (errors.length <= 1) return errors[0] ?? 'Error desconocido'
  return `${errors.length} errores detectados (se mostrará la vista previa de las entradas válidas)`
}

export { SCHEMA_VERSION }