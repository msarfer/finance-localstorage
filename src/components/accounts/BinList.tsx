import type { Account } from '@/types'
import { BILLS, COINS, BILL_LABELS, COIN_LABELS } from '@/data/constants'
import { formatEUR } from '@/lib/money'
import { Icon, type IconName } from '@/components/icons'

const units = (n: number) => `${n} ${n === 1 ? 'ud.' : 'uds.'}`

interface Group {
  key: string
  label: string
  icon: IconName
  denoms: readonly number[]
  labels: Record<number, string>
}

const GROUPS: Group[] = [
  { key: 'bills', label: 'Billetes', icon: 'banknote', denoms: BILLS, labels: BILL_LABELS },
  { key: 'coins', label: 'Monedas', icon: 'coin', denoms: COINS, labels: COIN_LABELS },
]

function buildSections(cash: Account['cash']) {
  const counts = cash ?? {}
  return GROUPS.map((g) => {
    const rows = g.denoms
      .map((d) => ({ denom: d, count: counts[d] ?? 0 }))
      .filter((r) => r.count > 0)
    const count = rows.reduce((s, r) => s + r.count, 0)
    const total = rows.reduce((s, r) => s + r.count * r.denom, 0)
    return { ...g, rows, count, total }
  })
}

export function BinList({ account }: { account: Account }) {
  const sections = buildSections(account.cash).filter((s) => s.rows.length > 0)

  if (sections.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Sin billetes ni monedas.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div key={s.key}>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
              <Icon name={s.icon} className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              {s.label}
            </span>
            <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {units(s.count)} · {formatEUR(s.total)}
            </span>
          </div>
          <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
            {s.rows.map((r) => (
              <li
                key={r.denom}
                className="flex items-center justify-between gap-3 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="font-medium tabular-nums">{s.labels[r.denom]}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">× {r.count}</span>
                </span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">
                  {formatEUR(r.denom * r.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}