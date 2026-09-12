import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { todayISO } from '@/lib/money'

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      {children}
    </div>
  )
}

export const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-brand-bright focus:ring-2 focus:ring-brand-bright/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  className = '',
  title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  title?: string
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50'
  const styles: Record<string, string> = {
    primary:
      'bg-brand text-white hover:bg-brand-bright shadow-sm',
    secondary:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    danger:
      'bg-expense text-white hover:bg-expense-bright shadow-sm',
    ghost:
      'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
      <div className="mb-2 text-4xl">{icon}</div>
      <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-bold" style={{ color: accent ?? undefined }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  )
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  )
}

export function ColorPalette({
  value,
  onChange,
  colors,
}: {
  value: string
  onChange: (color: string) => void
  colors: readonly string[]
}) {
  const normalize = (c: string) => (/^#[0-9a-f]{6}$/i.test(c) ? c : '#000000')
  const isCustom = !colors.includes(value)
  const snapRef = useRef<string | null>(null)
  const captureSnap = (el: HTMLInputElement) => {
    snapRef.current = normalize(el.value)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          title={c}
          aria-label={`Color ${c}`}
          className={`h-8 w-8 rounded-full transition ${
            value === c
              ? 'ring-2 ring-offset-2 ring-slate-400'
              : 'hover:ring-2 hover:ring-offset-1 hover:ring-slate-300'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
      <div
        title="Color personalizado"
        aria-label="Color personalizado"
        className={`relative h-8 w-8 cursor-pointer overflow-hidden rounded-full ring-1 transition ${
          isCustom ? 'ring-2 ring-offset-2 ring-slate-400' : 'ring-slate-300'
        }`}
        style={{
          background: isCustom
            ? value
            : 'linear-gradient(135deg, #9747ff 0%, #00e5ff 100%)',
        }}
      >
        <input
          type="color"
          value={normalize(value)}
          onPointerDown={(e) => captureSnap(e.currentTarget)}
          onFocus={(e) => captureSnap(e.currentTarget)}
          onChange={(e) => {
            const next = e.currentTarget.value
            if (next === snapRef.current) return
            onChange(next)
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <svg
            className="h-4 w-4 text-white mix-blend-difference"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
          </svg>
        </span>
      </div>
    </div>
  )
}

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const pad = (n: number) => String(n).padStart(2, '0')

function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function fromISO(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null
  }
  return date
}

function formatShort(iso: string): string {
  const d = fromISO(iso)
  if (!d) return iso
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

function parseTyped(input: string): string | null {
  const t = input.trim()
  let match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t)
  let y = 0
  let m = 0
  let d = 0
  if (match) {
    d = Number(match[1])
    m = Number(match[2])
    y = Number(match[3])
  } else {
    match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(t)
    if (!match) return null
    y = Number(match[1])
    m = Number(match[2])
    d = Number(match[3])
  }
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null
  }
  return toISO(date)
}

export function DatePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (iso: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState('')
  const initial = fromISO(value) ?? new Date()
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  })

  const commit = () => {
    setFocused(false)
    if (draft.trim() === '') {
      setDraft('')
      return
    }
    const iso = parseTyped(draft)
    if (iso) {
      onChange(iso)
      const d = fromISO(iso)
      if (d) setView({ year: d.getFullYear(), month: d.getMonth() })
    }
    setDraft('')
  }

  const prevMonth = () =>
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }))
  const nextMonth = () =>
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }))

  const firstDay = new Date(view.year, view.month, 1)
  const dim = new Date(view.year, view.month + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7
  const today = todayISO()
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: dim }, (_, i) => new Date(view.year, view.month, i + 1)),
  ]

  const select = (d: Date) => {
    onChange(toISO(d))
    setOpen(false)
  }

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />}
      <div className="relative z-30">
        <input
          className={`${inputCls} pr-10`}
          value={focused ? draft : formatShort(value)}
          placeholder="dd/mm/aaaa"
          aria-label="Fecha"
          onFocus={() => {
            setDraft(formatShort(value))
            setFocused(true)
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
              e.currentTarget.blur()
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir calendario"
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-2.5 text-slate-400 outline-none transition focus-visible:text-brand hover:text-slate-600 dark:hover:text-slate-200"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M6.75 2A1.75 1.75 0 0 0 5 3.75v.54c-.914.19-1.685.65-2.25 1.277A3.25 3.25 0 0 0 2 8.13v6.12A3.75 3.75 0 0 0 5.75 18h8.5A3.75 3.75 0 0 0 18 14.25V8.13a3.25 3.25 0 0 0-.75-2.563A4.47 4.47 0 0 0 15 4.29v-.54A1.75 1.75 0 0 0 13.25 2h-6.5ZM14.5 6V3.75c0-.138-.112-.25-.25-.25h-8.5a.25.25 0 0 0-.25.25V6h9Zm3 1.5a1.76 1.76 0 0 1-.245.013H2.745c-.084 0-.167-.004-.245-.013V14.25a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25V7.5Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Mes anterior"
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M11.28 5.22a.75.75 0 0 0-1.06 0L5.47 9.97a.75.75 0 0 0 0 1.06l4.75 4.75a.75.75 0 1 0 1.06-1.06L7.06 10.5l4.22-4.22a.75.75 0 0 0 0-1.06Z" />
              </svg>
            </button>
            <span className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-200">
              {MONTH_NAMES[view.month]} {view.year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Mes siguiente"
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M8.72 5.22a.75.75 0 0 1 1.06 0l4.75 4.75a.75.75 0 0 1 0 1.06l-4.75 4.75a.75.75 0 0 1-1.06-1.06l4.22-4.22-4.22-4.22a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                {w}
              </span>
            ))}
            {cells.map((day, i) =>
              day ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => select(day)}
                  aria-label={formatShort(toISO(day))}
                  className={`flex h-8 items-center justify-center rounded-lg text-sm transition ${
                    toISO(day) === value
                      ? 'bg-brand font-semibold text-white'
                      : toISO(day) === today
                        ? 'font-semibold text-brand ring-1 ring-inset ring-brand-bright hover:bg-brand-soft dark:text-brand-bright dark:hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {day.getDate()}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              const iso = todayISO()
              const d = fromISO(iso)
              onChange(iso)
              if (d) setView({ year: d.getFullYear(), month: d.getMonth() })
              setOpen(false)
            }}
            className="mt-2 w-full rounded-lg px-2 py-1.5 text-sm font-medium text-brand transition hover:bg-brand-soft dark:text-brand-bright dark:hover:bg-slate-800"
          >
            Hoy
          </button>
        </div>
      )}
    </div>
  )
}