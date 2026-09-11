import type { CashCounts } from '../../types'
import { BILLS, COINS, BILL_LABELS, COIN_LABELS } from '../../data/constants'
import { computeCashTotal } from '../../lib/money'
import { formatEUR } from '../../lib/money'

function CountRow({
  label,
  count,
  onChange,
}: {
  label: string
  count: number
  onChange: (next: number) => void
}) {
  const inc = () => onChange(count + 1)
  const dec = () => onChange(Math.max(0, count - 1))
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          disabled={count === 0}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums">{count}</span>
        <button
          type="button"
          onClick={inc}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          +
        </button>
      </div>
    </div>
  )
}

export function CashBreakdownEditor({
  value,
  onChange,
}: {
  value: CashCounts
  onChange: (next: CashCounts) => void
}) {
  const setCount = (denom: number, next: number) => {
    const copy = { ...value }
    if (next <= 0) delete copy[denom]
    else copy[denom] = next
    onChange(copy)
  }

  const total = computeCashTotal(value)

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Billetes</p>
        <div className="grid grid-cols-2 gap-2">
          {BILLS.map((d) => (
            <CountRow key={d} label={BILL_LABELS[d]} count={value[d] ?? 0} onChange={(n) => setCount(d, n)} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Monedas</p>
        <div className="grid grid-cols-2 gap-2">
          {COINS.map((d) => (
            <CountRow key={d} label={COIN_LABELS[d]} count={value[d] ?? 0} onChange={(n) => setCount(d, n)} />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2.5 dark:bg-indigo-950/40">
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          Total en esta cuenta
        </span>
        <span className="text-base font-bold text-indigo-700 dark:text-indigo-300">{formatEUR(total)}</span>
      </div>
    </div>
  )
}