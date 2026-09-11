export type AccountKind = 'online' | 'cash'

export type CashCounts = Partial<Record<number, number>>

export interface Account {
  id: string
  kind: AccountKind
  name: string
  entity?: string
  balance: number
  cash?: CashCounts
  color: string
  createdAt: number
  updatedAt: number
}

export type MovementType = 'income' | 'expense' | 'transfer'

export interface Movement {
  id: string
  type: MovementType
  amount: number
  concept?: string
  categoryId?: string
  accountId?: string
  fromAccountId?: string
  toAccountId?: string
  date: string
  createdAt: number
}

export type CategoryType = 'income' | 'expense' | 'both'

export interface Category {
  id: string
  name: string
  emoji?: string
  color: string
  type: CategoryType
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
}

export interface AppState {
  version: number
  accounts: Account[]
  movements: Movement[]
  categories: Category[]
  settings: AppSettings
}

export type View = 'dashboard' | 'accounts' | 'movements' | 'categories' | 'tools'