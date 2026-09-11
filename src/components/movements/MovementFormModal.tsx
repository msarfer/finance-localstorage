import { useState } from 'react'

import type { Movement, MovementType } from '../../types'
import { useStore } from '../../store/useStore'
import { parseCentsInput, todayISO } from '../../lib/money'
import { Button, Field, Modal, inputCls } from '../ui'

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
  const [error, setError] = useState<string | null>(null)

  const validCategories = categories.filter((c) => c.type === type || c.type === 'both')

  const submit = () => {
    const cents = parseCentsInput(amount)
    if (cents === null || cents <= 0) {
      setError('Introduce un importe válido mayor que 0')
      return
    }
    if (type === 'transfer') {
      if (!fromAccountId || !toAccountId) {
        setError('Selecciona cuentas de origen y destino')
        return
      }
      if (fromAccountId === toAccountId) {
        setError('La cuenta de origen y destino deben ser distintas')
        return
      }
      const payload = { type: 'transfer' as const, amount: cents, date, concept: concept.trim() || undefined, fromAccountId, toAccountId }
      if (initial) updateMovement(initial.id, payload)
      else addMovement(payload)
    } else {
      if (!accountId) {
        setError('Selecciona una cuenta')
        return
      }
      const payload = {
        type,
        amount: cents,
        date,
        concept: concept.trim() || undefined,
        accountId,
        categoryId: categoryId || undefined,
      }
      if (initial) updateMovement(initial.id, payload)
      else addMovement(payload)
    }
    onClose()
  }

  const typeBtn = (t: MovementType, label: string) => (
    <button
      type="button"
      onClick={() => { setType(t); setCategoryId('') }}
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
              <select className={inputCls} value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Hacia (destino)">
              <select className={inputCls} value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cuenta">
              <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
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
          <Field label="Importe (€)">
            <input
              className={inputCls}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
            />
          </Field>
          <Field label="Fecha">
            <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>

        <Field label="Concepto">
          <input className={inputCls} value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Ej. Compra semanal" />
        </Field>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </Modal>
  )
}