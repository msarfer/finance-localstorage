import type { Account } from '@/types'
import { BILL_LABELS, COIN_LABELS } from '@/data/constants'

export function BinList({ account }: { account: Account }) {
  const cash = account.cash ?? {}
  const entries = Object.entries(cash)
    .filter(([, count]) => typeof count === 'number' && count > 0)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
  if (entries.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">Sin billetes ni monedas.</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([denom, count]) => {
        const label = (BILL_LABELS[Number(denom)] ?? COIN_LABELS[Number(denom)] ?? `${denom} €`)
        return (
          <span key={denom} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {count} × {label}
          </span>
        )
      })}
    </div>
  )
}