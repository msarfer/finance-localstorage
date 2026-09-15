import { useState } from 'react'

import type { Category } from '@/types'
import type { CategoryBreakdown } from '@/lib/reports'
import { formatEUR } from '@/lib/money'
import { Card, EmptyState, SectionLabel, Segmented } from '@/components/ui'
import { CategoryDonut, type DonutSlice } from '@/components/expenses/CategoryDonut'

const neutralColor = 'var(--color-brand-bright)'

export function ExpensesByCategory({
  rows,
  categoryById,
  emptyTitle = 'Sin gastos este mes',
  emptySubtitle = 'Registra un gasto para verlo desglosado aquí',
}: {
  rows: CategoryBreakdown[]
  categoryById: Map<string, Category>
  emptyTitle?: string
  emptySubtitle?: string
}) {
  const [view, setView] = useState<'lista' | 'grafico'>('lista')

  const sorted = [...rows].sort((a, b) => b.amount - a.amount)
  const total = sorted.reduce((s, r) => s + r.amount, 0)

  const slices: DonutSlice[] = sorted.map(({ categoryId, amount }) => {
    const cat = categoryById.get(categoryId)
    return {
      label: cat?.name ?? 'Sin categoría',
      amount,
      pct: total > 0 ? (amount / total) * 100 : 0,
      color: cat?.color ?? neutralColor,
    }
  })

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Gastos por categoría</SectionLabel>
        <Segmented<'lista' | 'grafico'>
          value={view}
          onChange={setView}
          options={[
            { value: 'lista', label: 'Lista' },
            { value: 'grafico', label: 'Gráfico' },
          ]}
        />
      </div>
      {sorted.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon="tag" title={emptyTitle} subtitle={emptySubtitle} />
        </div>
      ) : view === 'grafico' ? (
        <div className="mt-6">
          <CategoryDonut slices={slices} />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {sorted.map(({ categoryId, amount, count }) => {
            const cat = categoryById.get(categoryId)
            const pct = total > 0 ? (amount / total) * 100 : 0
            return (
              <div key={categoryId}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                    {cat?.emoji && <span aria-hidden>{cat.emoji}</span>}
                    <span className="truncate">{cat?.name ?? 'Sin categoría'}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
                    {formatEUR(amount)} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: cat?.color ?? neutralColor }}
                  />
                </div>
                {count > 1 && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {count} movimientos
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}