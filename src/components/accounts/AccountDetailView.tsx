import { useMemo, useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

import type { Movement, MovementType } from '@/types'
import { accountTotal, useStore } from '@/store/useStore'
import { formatEUR } from '@/lib/money'
import { currentMonthISO, monthOf } from '@/lib/reports'
import { monthLabel } from '@/lib/display'
import {
  Button,
  Card,
  Chip,
  ConfirmDialog,
  EmptyState,
  inputCls,
} from '@/components/ui'
import { AccountFormModal } from './AccountFormModal'
import { BinList } from './BinList'
import { MovementFormModal } from '@/components/movements/MovementFormModal'
import { MovementListItem } from '@/components/movements/MovementListItem'
import { Icon } from '@/components/icons'

export function AccountDetailView() {
  const [, params] = useRoute('/accounts/:id')
  const [, navigate] = useLocation()
  const accountId = params?.id

  const accounts = useStore((s) => s.accounts)
  const movements = useStore((s) => s.movements)
  const categories = useStore((s) => s.categories)
  const deleteMovement = useStore((s) => s.deleteMovement)
  const deleteAccount = useStore((s) => s.deleteAccount)

  const account = accounts.find((a) => a.id === accountId)

  const accountMovements = useMemo(
    () =>
      movements.filter(
        (m) =>
          m.accountId === accountId ||
          m.fromAccountId === accountId ||
          m.toAccountId === accountId,
      ),
    [movements, accountId],
  )

  const accountName = useMemo(
    () => new Map(accounts.map((a) => [a.id, a.name])),
    [accounts],
  )
  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  )

  const months = useMemo(() => {
    const set = new Set(accountMovements.map((m) => monthOf(m.date)))
    set.add(currentMonthISO())
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [accountMovements])

  const [filterMonth, setFilterMonth] = useState(
    months[0] ?? currentMonthISO(),
  )
  const [filterType, setFilterType] = useState<'all' | MovementType>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return accountMovements
      .filter((m) => (filterType === 'all' ? true : m.type === filterType))
      .filter((m) => (filterMonth ? monthOf(m.date) === filterMonth : true))
      .filter((m) =>
        q
          ? (m.concept ?? '').toLowerCase().includes(q) ||
            (m.categoryId
              ? (categoryById.get(m.categoryId)?.name ?? '')
                  .toLowerCase()
                  .includes(q)
              : false)
          : true,
      )
      .sort((a, b) =>
        a.date === b.date
          ? b.createdAt - a.createdAt
          : b.date.localeCompare(a.date),
      )
  }, [accountMovements, filterType, filterMonth, search, categoryById])

  const monthlyTotals = useMemo(() => {
    const income = filtered
      .filter((m) => m.type === 'income')
      .reduce((s, m) => s + m.amount, 0)
    const expense = filtered
      .filter((m) => m.type === 'expense')
      .reduce((s, m) => s + m.amount, 0)
    return { income, expense }
  }, [filtered])

  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [movementFormOpen, setMovementFormOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null)
  const [deletingMovement, setDeletingMovement] = useState<Movement | null>(null)
  const [deletingAccount, setDeletingAccount] = useState(false)

  if (!account) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon="alert"
          title="Cuenta no encontrada"
          subtitle="Puede que se haya eliminado o que el enlace sea incorrecto"
        />
        <div className="flex justify-center">
          <Button variant="secondary" icon="arrow-left" onClick={() => navigate('/accounts')}>
            Volver a cuentas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/accounts"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-brand dark:text-slate-400 dark:hover:text-brand-bright"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Volver a cuentas
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="mt-1 h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: account.color }}
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{account.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {account.kind === 'cash'
                  ? 'Efectivo físico'
                  : (account.entity || 'Cuenta online')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon="pencil" onClick={() => setAccountFormOpen(true)}>
              Editar
            </Button>
            <Button
              variant="secondary"
              icon="trash"
              className="text-expense hover:bg-expense-soft dark:text-expense-bright dark:hover:bg-expense-soft-dark/40"
              onClick={() => setDeletingAccount(true)}
            >
              Eliminar
            </Button>
          </div>
        </div>
        <p
          className="mt-6 text-4xl font-semibold tracking-tight tabular-nums"
          style={{ color: account.color }}
        >
          {formatEUR(accountTotal(account))}
        </p>
        {account.kind === 'cash' && (
          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Desglose
            </p>
            <BinList account={account} />
          </div>
        )}
      </Card>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Movimientos</h2>
          <Button
            icon="plus"
            onClick={() => {
              setEditingMovement(null)
              setMovementFormOpen(true)
            }}
          >
            Nuevo movimiento
          </Button>
        </div>

        <Card className="p-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              className={inputCls}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
            <select
              className={inputCls}
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as 'all' | MovementType)
              }
            >
              <option value="all">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
              <option value="transfer">Transferencias online</option>
              <option value="cashflow">Banco ↔ Efectivo</option>
            </select>
            <input
              className={inputCls}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar concepto, categoría..."
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Chip tone="income">Ingresos: + {formatEUR(monthlyTotals.income)}</Chip>
            <Chip tone="expense">Gastos: - {formatEUR(monthlyTotals.expense)}</Chip>
          </div>
        </Card>

        <div className="mt-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="Sin movimientos"
              subtitle="Ajusta los filtros o registra un nuevo movimiento"
            />
          ) : (
            <Card>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((m) => (
                  <MovementListItem
                    key={m.id}
                    movement={m}
                    accountName={(id) => (id ? accountName.get(id) : undefined)}
                    categoryById={categoryById}
                    onEdit={(mov) => {
                      setEditingMovement(mov)
                      setMovementFormOpen(true)
                    }}
                    onDelete={(mov) => setDeletingMovement(mov)}
                  />
                ))}
              </ul>
            </Card>
          )}
        </div>
        {filtered.length > 0 && (
          <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
            {filtered.length} movimiento{filtered.length === 1 ? '' : 's'} en el mes
            {filterMonth ? ` de ${monthLabel(filterMonth)}` : ''}
          </p>
        )}
      </section>

      {accountFormOpen && (
        <AccountFormModal
          key={account.id}
          initial={account}
          onClose={() => setAccountFormOpen(false)}
        />
      )}

      {movementFormOpen && (
        <MovementFormModal
          key={editingMovement?.id ?? 'new'}
          initial={editingMovement ?? undefined}
          presetAccountId={account.id}
          onClose={() => {
            setMovementFormOpen(false)
            setEditingMovement(null)
          }}
        />
      )}

      {deletingMovement && (
        <ConfirmDialog
          title="Eliminar movimiento"
          message={`¿Seguro que quieres eliminar "${deletingMovement.concept || 'este movimiento'}"?`}
          confirmLabel="Eliminar"
          onCancel={() => setDeletingMovement(null)}
          onConfirm={() => {
            deleteMovement(deletingMovement.id)
            setDeletingMovement(null)
          }}
        />
      )}

      {deletingAccount && (
        <ConfirmDialog
          title="Eliminar cuenta"
          message={`Se eliminará "${account.name}" y todos sus movimientos asociados. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onCancel={() => setDeletingAccount(false)}
          onConfirm={() => {
            deleteAccount(account.id)
            navigate('/accounts')
          }}
        />
      )}
    </div>
  )
}