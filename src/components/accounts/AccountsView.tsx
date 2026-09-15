import { useState } from 'react'
import { Link } from 'wouter'

import type { Account } from '@/types'
import { useStore } from '@/store/useStore'
import { computeCashTotal } from '@/lib/money'
import { formatEUR } from '@/lib/money'
import { Button, Card, ConfirmDialog, EmptyState, IconButton, PageHeader, SectionLabel } from '@/components/ui'
import { AccountFormModal } from './AccountFormModal'

export function AccountsView() {
  const accounts = useStore((s) => s.accounts)
  const deleteAccount = useStore((s) => s.deleteAccount)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState<Account | null>(null)

  const online = accounts.filter((a) => a.kind === 'online')
  const cash = accounts.filter((a) => a.kind === 'cash')

  const renderCard = (a: Account) => (
    <Card key={a.id} className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/accounts/${a.id}`} className="group flex min-w-0 items-start gap-2.5">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
          <span className="min-w-0">
            <span className="block truncate font-semibold leading-tight transition group-hover:text-brand">
              {a.name}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {a.kind === 'cash' ? 'Efectivo físico' : (a.entity || 'Cuenta online')}
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 gap-0.5">
          <IconButton
            onClick={() => {
              setEditing(a)
              setFormOpen(true)
            }}
            title="Editar"
          />
          <IconButton
            onClick={() => setDeleting(a)}
            title="Eliminar"
            icon="trash"
            className="hover:bg-expense-soft hover:text-expense dark:hover:bg-expense-soft-dark/40"
          />
        </div>
      </div>
      <Link
        href={`/accounts/${a.id}`}
        className="mt-auto block pt-6 font-display text-2xl font-semibold tracking-tight tabular-nums transition hover:opacity-75"
        style={{ color: a.color }}
      >
        {formatEUR(a.kind === 'cash' ? computeCashTotal(a.cash ?? {}) : a.balance)}
      </Link>
    </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas"
        subtitle={
          accounts.length === 0
            ? undefined
            : `${accounts.length} cuenta${accounts.length === 1 ? '' : 's'} en total`
        }
        action={
          <Button
            icon="plus"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Nueva cuenta
          </Button>
        }
      />

      {accounts.length === 0 ? (
        <EmptyState
          icon="bank"
          title="No tienes cuentas todavía"
          subtitle="Crea tu primera cuenta online o de efectivo"
          action={
            <Button
              icon="plus"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              Nueva cuenta
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {online.length > 0 && (
            <section>
              <SectionLabel className="mb-3">Cuentas online</SectionLabel>
              <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {online.map(renderCard)}
            </div>
            </section>
          )}
          {cash.length > 0 && (
            <section>
              <SectionLabel className="mb-3">Efectivo físico</SectionLabel>
              <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cash.map(renderCard)}
            </div>
            </section>
          )}
        </div>
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