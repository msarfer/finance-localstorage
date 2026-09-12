import type { TrendPoint } from '@/lib/reports'
import { formatEUR } from '@/lib/money'

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const max = Math.max(1, ...points.map((p) => Math.max(p.income, p.expense)))

  return (
    <div>
      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-income" />
          Ingresos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-expense" />
          Gastos
        </span>
      </div>

      <div
        role="img"
        aria-label={points
          .map(
            (p) =>
              `${p.label}: ingresos ${formatEUR(p.income)} y gastos ${formatEUR(p.expense)}`,
          )
          .join('. ')}
        className="mt-4 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="flex h-44 gap-3 sm:gap-4">
          {points.map((p) => {
            const inc = Math.max(2, (p.income / max) * 100)
            const exp = Math.max(2, (p.expense / max) * 100)
            return (
              <div
                key={p.month}
                title={`${p.label}: ingresos ${formatEUR(p.income)} · gastos ${formatEUR(p.expense)}`}
                className="flex min-w-0 flex-1 items-end justify-center gap-1 sm:gap-1.5"
              >
                <div
                  style={{ height: `${inc}%` }}
                  className="w-full max-w-[14px] rounded-t-sm bg-income/80 transition-colors hover:bg-income dark:bg-income-bright/70 dark:hover:bg-income-bright"
                />
                <div
                  style={{ height: `${exp}%` }}
                  className="w-full max-w-[14px] rounded-t-sm bg-expense/80 transition-colors hover:bg-expense dark:bg-expense-bright/70 dark:hover:bg-expense-bright"
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2 flex gap-3 sm:gap-4">
        {points.map((p, i) => (
          <div key={p.month} className="flex-1 text-center">
            <span
              className={`text-[11px] font-medium uppercase tracking-wide ${
                i === points.length - 1
                  ? 'text-slate-700 dark:text-slate-200'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}