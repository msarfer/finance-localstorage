import { Link } from 'wouter'

import type { Category, Movement } from '@/types'
import { formatDate, signedEUR } from '@/lib/display'
import { Icon } from '@/components/icons'
import { IconButton } from '@/components/ui'
import type { IconName } from '@/components/icons'

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
  onEdit?: (m: Movement) => void
  onDelete?: (m: Movement) => void
}) {
  const m = movement
  const cat = m.categoryId ? categoryById.get(m.categoryId) : undefined
  const isPair = m.type === 'transfer' || m.type === 'cashflow'
  const originId = isPair ? m.fromAccountId : m.accountId
  const destId = isPair ? m.toAccountId : undefined
  const originName = accountName(originId)
  const destName = accountName(destId)

  const chip = (): { tone: string; icon: IconName } => {
    if (m.type === 'expense')
      return {
        tone: 'bg-expense-soft text-expense dark:bg-expense-soft-dark/60 dark:text-expense-bright',
        icon: 'trend-down',
      }
    if (m.type === 'income')
      return {
        tone: 'bg-income-soft text-income dark:bg-income-soft-dark/60 dark:text-income-bright',
        icon: 'trend-up',
      }
    if (m.type === 'transfer')
      return {
        tone: 'bg-brand-soft text-brand dark:bg-brand-soft-dark/60 dark:text-brand-bright',
        icon: 'swap',
      }
    return {
      tone: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
      icon: 'wallet',
    }
  }

  const { tone, icon } = chip()

  const accountLinkCls =
    'font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-brand hover:decoration-brand-bright dark:text-slate-300 dark:decoration-slate-700'

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone}`}
      >
        <Icon name={icon} className="h-4 w-4" />
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
      <span
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          m.type === 'expense'
            ? 'text-expense dark:text-expense-bright'
            : m.type === 'income'
              ? 'text-income dark:text-income-bright'
              : 'text-slate-600 dark:text-slate-300'
        }`}
      >
        {signedEUR(m.amount, m.type)}
      </span>
      <div className="flex shrink-0 items-center gap-0.5">
        {onEdit && (
          <IconButton onClick={() => onEdit(m)} title="Editar" icon="pencil" />
        )}
        {onDelete && (
          <IconButton
            onClick={() => onDelete(m)}
            title="Eliminar"
            icon="trash"
            className="hover:bg-expense-soft hover:text-expense dark:hover:bg-expense-soft-dark/40"
          />
        )}
      </div>
    </li>
  )
}