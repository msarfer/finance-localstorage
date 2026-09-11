import { useState } from 'react'

import type { Account, AccountKind, CashCounts } from '../../types'
import { ACCOUNT_COLORS } from '../../data/constants'
import { useStore } from '../../store/useStore'
import { emptyCashCounts, formatEUR, parseCentsInput } from '../../lib/money'
import { Button, Field, Modal, inputCls } from '../ui'
import { CashBreakdownEditor } from './CashBreakdownEditor'

export function AccountFormModal({
  initial,
  onClose,
}: {
  initial?: Account
  onClose: () => void
}) {
  const addAccount = useStore((s) => s.addAccount)
  const updateAccount = useStore((s) => s.updateAccount)

  const [kind, setKind] = useState<AccountKind>(initial?.kind ?? 'online')
  const [name, setName] = useState(initial?.name ?? '')
  const [entity, setEntity] = useState(initial?.entity ?? '')
  const [balance, setBalance] = useState(initial ? formatEUR(initial.balance).replace(/\s/g, '').replace('€', '') : '')
  const [cash, setCash] = useState<CashCounts>(initial?.cash ?? emptyCashCounts())
  const [color, setColor] = useState(initial?.color ?? ACCOUNT_COLORS[0])
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    if (!name.trim()) {
      setError('El nombre de la cuenta es obligatorio')
      return
    }
    if (kind === 'online') {
      const cents = parseCentsInput(balance)
      if (cents === null) {
        setError('Introduce un saldo válido en euros')
        return
      }
      const payload = {
        name: name.trim(),
        kind: 'online' as const,
        entity: entity.trim() || undefined,
        balance: cents,
        color,
      }
      if (initial) updateAccount(initial.id, payload)
      else addAccount(payload)
    } else {
      const payload = { name: name.trim(), kind: 'cash' as const, cash, color, balance: 0 }
      if (initial) updateAccount(initial.id, payload)
      else addAccount(payload)
    }
    onClose()
  }

  return (
    <Modal
      title={initial ? 'Editar cuenta' : 'Nueva cuenta'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>{initial ? 'Guardar cambios' : 'Crear cuenta'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">Tipo de cuenta</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKind('online')}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                kind === 'online'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              🏦 Online (banco)
            </button>
            <button
              type="button"
              onClick={() => setKind('cash')}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                kind === 'cash'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              💵 Efectivo físico
            </button>
          </div>
        </div>

        <Field label="Nombre">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Cuenta nómina" />
        </Field>

        {kind === 'online' ? (
          <>
            <Field label="Entidad bancaria">
              <input className={inputCls} value={entity} onChange={(e) => setEntity(e.target.value)} placeholder="Ej. Banco Santander" />
            </Field>
            <Field label="Saldo (€)">
              <input
                className={inputCls}
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
              />
            </Field>
          </>
        ) : (
          <Field label="Desglose de billetes y monedas">
            <CashBreakdownEditor value={cash} onChange={setCash} />
          </Field>
        )}

        <Field label="Color">
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full transition ${
                  color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </Field>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </Modal>
  )
}