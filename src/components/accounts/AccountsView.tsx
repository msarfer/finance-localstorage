import { useState } from 'react'

import type { Account } from '@/types'
import { BILL_LABELS, COIN_LABELS } from '@/data/constants'
import { useStore } from '@/store/useStore'
import { computeCashTotal } from '@/lib/money'
import { formatEUR } from '@/lib/money'
import { Button, ConfirmDialog, EmptyState } from '@/components/ui'
import { AccountFormModal } from './AccountFormModal'

function BinList({ account }: { account: Account }) {
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

export function AccountsView() {
  const accounts = useStore((s) => s.accounts)
  const deleteAccount = useStore((s) => s.deleteAccount)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState<Account | null>(null)

  const online = accounts.filter((a) => a.kind === 'online')
  const cash = accounts.filter((a) => a.kind === 'cash')

  const renderCard = (a: Account) => (
    <div key={a.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
          <div>
            <p className="font-semibold leading-tight">{a.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {a.kind === 'cash' ? 'Efectivo físico' : (a.entity || 'Cuenta online')}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setEditing(a)
              setFormOpen(true)
            }}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            title="Editar"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setDeleting(a)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            title="Eliminar"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold" style={{ color: a.color }}>
        {formatEUR(a.kind === 'cash' ? computeCashTotal(a.cash ?? {}) : a.balance)}
      </p>
      {a.kind === 'cash' && (
        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Desglose</p>
          <BinList account={a} />
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Cuentas</h1>
        <Button onClick={() => { setEditing(null); setFormOpen(true) }}>+ Nueva cuenta</Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon="🏦"
          title="No tienes cuentas todavía"
          subtitle="Crea tu primera cuenta online o de efectivo"
        />
      ) : (
        <>
          {online.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cuentas online</h2>
              <div className="grid gap-3 sm:grid-cols-2">{online.map(renderCard)}</div>
            </section>
          )}
          {cash.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Efectivo físico</h2>
              <div className="grid gap-3 sm:grid-cols-2">{cash.map(renderCard)}</div>
            </section>
          )}
        </>
      )}

      {formOpen && (
        <AccountFormModal key={editing?.id ?? 'new'} initial={editing ?? undefined} onClose={() => setFormOpen(false)} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Eliminar cuenta"
          message={`Se eliminará "${deleting.name}" y todos sus movimientos asociados. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteAccount(deleting.id)
            setDeleting(null)
          }}
        />
      )}
    </div>
  )
}