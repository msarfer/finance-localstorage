import { useState } from 'react'

import type { CashCounts, Movement, MovementType } from '@/types'
import { useStore } from '@/store/useStore'
import { computeCashTotal, emptyCashCounts, formatEUR, parseCentsInput, todayISO } from '@/lib/money'
import { Button, Field, Modal, inputCls } from '@/components/ui'
import { CashBreakdownEditor } from '@/components/accounts/CashBreakdownEditor'

function hasEnoughCash(current: CashCounts | undefined, spend: CashCounts): boolean {
  const c = current ?? emptyCashCounts()
  return Object.entries(spend).every(([denom, count]) => (c[Number(denom)] ?? 0) >= (count ?? 0))
}

export function MovementFormModal({
  initial,
  onClose,
  presetAccountId,
  presetType,
}: {
  initial?: Movement
  onClose: () => void
  presetAccountId?: string
  presetType?: MovementType
}) {
  const accounts = useStore((s) => s.accounts)
  const categories = useStore((s) => s.categories)
  const addMovement = useStore((s) => s.addMovement)
  const updateMovement = useStore((s) => s.updateMovement)

  const [type, setType] = useState<MovementType>(initial?.type ?? presetType ?? 'expense')
  const [accountId, setAccountId] = useState<string>(initial?.accountId ?? presetAccountId ?? accounts[0]?.id ?? '')
  const [fromAccountId, setFromAccountId] = useState<string>(initial?.fromAccountId ?? accounts[0]?.id ?? '')
  const [toAccountId, setToAccountId] = useState<string>(initial?.toAccountId ?? accounts[1]?.id ?? '')
  const [amount, setAmount] = useState(initial ? (initial.amount / 100).toString().replace('.', ',') : '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [concept, setConcept] = useState(initial?.concept ?? '')
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ?? '')
  const [cashBreakdown, setCashBreakdown] = useState<CashCounts>(initial?.cashBreakdown ?? emptyCashCounts())
  const [error, setError] = useState<string | null>(null)

  const accountById = new Map(accounts.map((a) => [a.id, a]))
  const fromAccount = accountById.get(fromAccountId)
  const toAccount = accountById.get(toAccountId)
  const selectedAccount = accountById.get(accountId)

  const cashAffected =
    type === 'transfer'
      ? fromAccount?.kind === 'cash' || toAccount?.kind === 'cash'
      : selectedAccount?.kind === 'cash'

  const needToWithdraw =
    type === 'expense' ? selectedAccount?.kind === 'cash' : type === 'transfer' && fromAccount?.kind === 'cash'

  const validCategories = categories.filter((c) => c.type === type || c.type === 'both')

  const resetCash = () => setCashBreakdown(emptyCashCounts())

  const cashTotal = computeCashTotal(cashBreakdown)
  const cents = cashAffected ? cashTotal : parseCentsInput(amount)

  const submit = () => {
    if (!cashAffected && (cents === null || cents <= 0)) {
      setError('Introduce un importe válido mayor que 0')
      return
    }
    if (cashAffected && cashTotal === 0) {
      setError('Define los billetes y monedas de esta operación')
      return
    }
    const finalCents = cents ?? 0
    if (type === 'transfer') {
      if (!fromAccountId || !toAccountId) {
        setError('Selecciona cuentas de origen y destino')
        return
      }
      if (fromAccountId === toAccountId) {
        setError('La cuenta de origen y destino deben ser distintas')
        return
      }
      if (fromAccount?.kind === 'cash' && !hasEnoughCash(fromAccount.cash, cashBreakdown)) {
        setError(`No hay suficientes billetes/monedas en "${fromAccount.name}" para esta transferencia`)
        return
      }
      const payload = {
        type: 'transfer' as const,
        amount: finalCents,
        date,
        concept: concept.trim() || undefined,
        fromAccountId,
        toAccountId,
        cashBreakdown: cashAffected ? cashBreakdown : undefined,
      }
      if (initial) updateMovement(initial.id, payload)
      else addMovement(payload)
    } else {
      if (!accountId) {
        setError('Selecciona una cuenta')
        return
      }
      if (needToWithdraw && selectedAccount && !hasEnoughCash(selectedAccount.cash, cashBreakdown)) {
        setError(`No hay suficientes billetes/monedas en "${selectedAccount.name}" para este gasto`)
        return
      }
      const payload = {
        type,
        amount: finalCents,
        date,
        concept: concept.trim() || undefined,
        accountId,
        categoryId: categoryId || undefined,
        cashBreakdown: cashAffected ? cashBreakdown : undefined,
      }
      if (initial) updateMovement(initial.id, payload)
      else addMovement(payload)
    }
    onClose()
  }

  const typeBtn = (t: MovementType, label: string) => (
    <button
      type="button"
      onClick={() => { setType(t); setCategoryId(''); resetCash() }}
      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
        type === t
          ? t === 'income'
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : t === 'expense'
              ? 'border-red-600 bg-red-600 text-white'
              : 'border-indigo-600 bg-indigo-600 text-white'
          : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  )

  return (
    <Modal
      title={initial ? 'Editar movimiento' : 'Nuevo movimiento'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>{initial ? 'Guardar cambios' : 'Añadir movimiento'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {typeBtn('expense', '💸 Gasto')}
          {typeBtn('income', '📥 Ingreso')}
          {typeBtn('transfer', '🔁 Transferencia')}
        </div>

        {type === 'transfer' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Desde (origen)">
              <select className={inputCls} value={fromAccountId} onChange={(e) => { setFromAccountId(e.target.value); resetCash() }}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Hacia (destino)">
              <select className={inputCls} value={toAccountId} onChange={(e) => { setToAccountId(e.target.value); resetCash() }}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cuenta">
              <select className={inputCls} value={accountId} onChange={(e) => { setAccountId(e.target.value); resetCash() }}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Categoría">
              <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sin categoría</option>
                {validCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji ? `${c.emoji} ` : ''}{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={cashAffected ? 'Importe (calculado del desglose)' : 'Importe (€)'}>
            {cashAffected ? (
              <div className="flex h-9.5 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                {formatEUR(cashTotal)}
              </div>
            ) : (
              <input
                className={inputCls}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
              />
            )}
          </Field>
          <Field label="Fecha">
            <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>

        {cashAffected && (
          <Field
            label={
              type === 'income'
                ? `Billetes y monedas que entran en "${selectedAccount?.name}"`
                : type === 'expense'
                  ? `Billetes y monedas que salen de "${selectedAccount?.name}"`
                  : `Billetes y monedas de la transferencia (${fromAccount?.name} → ${toAccount?.name})`
            }
          >
            <CashBreakdownEditor value={cashBreakdown} onChange={setCashBreakdown} />
            <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800">
              <span className="text-slate-600 dark:text-slate-300">El importe se calcula según los billetes y monedas</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{formatEUR(cashTotal)}</span>
            </div>
          </Field>
        )}

        <Field label="Concepto">
          <input className={inputCls} value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Ej. Compra semanal" />
        </Field>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
      </div>
    </Modal>
  )
}