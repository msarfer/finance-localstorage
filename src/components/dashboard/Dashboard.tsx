import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../store/useStore'
import { summarize, currentMonthISO } from '../../lib/reports'
import { formatEUR } from '../../lib/money'
import { formatDate, MOVEMENT_TYPE_LABEL, monthLabel, signedEUR } from '../../lib/display'
import { StatCard, EmptyState } from '../ui'

export function Dashboard() {
  const state = useStore(
    useShallow((s) => ({
      accounts: s.accounts,
      movements: s.movements,
      categories: s.categories,
    })),
  )
  const categoryById = new Map(state.categories.map((c) => [c.id, c]))

  const month = currentMonthISO()
  const summary = summarize(state, month)

  const incomeColor = '#10b981'
  const expenseColor = '#ef4444'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Resumen de {monthLabel(month)}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Patrimonio total" value={formatEUR(summary.totalAssets)} />
        <StatCard label="Cuentas online" value={formatEUR(summary.totalOnline)} sub={`${state.accounts.filter((a) => a.kind === 'online').length} cuentas`} />
        <StatCard label="Efectivo en mano" value={formatEUR(summary.totalCash)} sub={`${state.accounts.filter((a) => a.kind === 'cash').length} cuentas`} />
        <StatCard label="Balance del mes" value={formatEUR(summary.monthBalance)} accent={summary.monthBalance >= 0 ? incomeColor : expenseColor} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ingresos del mes" value={`+ ${formatEUR(summary.monthIncome)}`} accent={incomeColor} />
        <StatCard label="Gastos del mes" value={`- ${formatEUR(summary.monthExpense)}`} accent={expenseColor} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">Gastos por categoría ({monthLabel(month)})</h2>
        {summary.byCategory.length === 0 ? (
          <EmptyState icon="📭" title="Sin gastos este mes" subtitle="Registra un gasto para verlo desglosado aquí" />
        ) : (
          <div className="space-y-3">
            {summary.byCategory.map(({ categoryId, amount, count }) => {
              const cat = categoryById.get(categoryId)
              const pct = summary.monthExpense > 0 ? (amount / summary.monthExpense) * 100 : 0
              return (
                <div key={categoryId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                      {cat?.emoji && <span aria-hidden>{cat.emoji}</span>}
                      {cat?.name ?? 'Sin categoría'}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatEUR(amount)} · {count} mov. · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: cat?.color ?? '#6366f1' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">Últimos movimientos</h2>
        {summary.recent.length === 0 ? (
          <EmptyState icon="🧾" title="Sin movimientos" subtitle="Los movimientos que registres aparecerán aquí" />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {summary.recent.map((m) => {
              const cat = m.categoryId ? categoryById.get(m.categoryId) : undefined
              const accent = m.type === 'expense' ? expenseColor : m.type === 'income' ? incomeColor : '#6366f1'
              return (
                <li key={m.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ backgroundColor: `${cat?.color ?? '#6366f1'}22`, color: cat?.color ?? '#6366f1' }}
                  >
                    {cat?.emoji ?? (m.type === 'transfer' ? '🔁' : '💸')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {m.concept || MOVEMENT_TYPE_LABEL[m.type]}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(m.date)} · {cat?.name ?? MOVEMENT_TYPE_LABEL[m.type]}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold" style={{ color: accent }}>
                    {signedEUR(m.amount, m.type)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}