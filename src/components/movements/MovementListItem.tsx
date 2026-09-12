import { Link } from 'wouter'

import type { Category, Movement } from '@/types'
import { formatDate, signedEUR } from '@/lib/display'

export function MovementListItem({
  movement,
  accountName,
  categoryById,
  onEdit,
  onDelete,
}: {
  movement: Movement
  accountName: (id: string | undefined) => string | undefined
  categoryById: Map<string, Category>
  onEdit: (m: Movement) => void
  onDelete: (m: Movement) => void
}) {
  const m = movement
  const cat = m.categoryId ? categoryById.get(m.categoryId) : undefined
  const isPair = m.type === 'transfer' || m.type === 'cashflow'
  const originId = isPair ? m.fromAccountId : m.accountId
  const destId = isPair ? m.toAccountId : undefined
  const originName = accountName(originId)
  const destName = accountName(destId)

  const chip = () => {
    if (m.type === 'expense')
      return 'bg-expense-soft text-expense-strong dark:bg-expense-soft-dark/60 dark:text-expense-bright'
    if (m.type === 'income')
      return 'bg-income-soft text-income-strong dark:bg-income-soft-dark/60 dark:text-income-bright'
    return 'bg-brand-soft text-brand-strong dark:bg-brand-soft-dark/60 dark:text-brand-bright'
  }

  const accountLinkCls =
    'font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-brand hover:decoration-brand-bright dark:text-slate-300 dark:decoration-slate-700'

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${chip()}`}
      >
        {m.type === 'cashflow'
          ? '💱'
          : (cat?.emoji ??
            (m.type === 'transfer'
              ? '🔁'
              : m.type === 'income'
                ? '📥'
                : '💸'))}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
          {m.concept ||
            (m.type === 'transfer'
              ? 'Transferencia online'
              : m.type === 'cashflow'
                ? 'Sacar / Ingresar dinero'
                : (cat?.name ?? 'Movimiento'))}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {formatDate(m.date)} ·{' '}
          {originId && originName ? (
            <Link href={`/accounts/${originId}`} className={accountLinkCls}>
              {originName}
            </Link>
          ) : (
            '—'
          )}
          {destId && destName ? (
            <>
              {' '}→{' '}
              <Link href={`/accounts/${destId}`} className={accountLinkCls}>
                {destName}
              </Link>
            </>
          ) : null}
          {cat && m.type !== 'transfer' ? ` · ${cat.name}` : ''}
          {m.cashBreakdown ? ' · 💵 efectivo' : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`text-sm font-semibold ${
            m.type === 'expense'
              ? 'text-expense dark:text-expense-bright'
              : m.type === 'income'
                ? 'text-income dark:text-income-bright'
                : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          {signedEUR(m.amount, m.type)}
        </span>
        <button
          type="button"
          onClick={() => onEdit(m)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          title="Editar"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(m)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-expense-soft hover:text-expense dark:hover:bg-expense-soft-dark/40"
          title="Eliminar"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </li>
  )
}