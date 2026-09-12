import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { todayISO } from '@/lib/money'
import { Icon } from '@/components/icons'
import type { IconName } from '@/components/icons'

/* ---------------------------------- Cards --------------------------------- */

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-(--radius-panel) border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------ Page elements ----------------------------- */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

export function SectionLabel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${className}`}
    >
      {children}
    </p>
  )
}

/* --------------------------------- Buttons -------------------------------- */

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  className = '',
  title,
  icon,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  title?: string
  icon?: IconName
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-(--radius-field) px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50'
  const styles: Record<string, string> = {
    primary: 'bg-brand text-white shadow-sm hover:bg-brand-bright',
    secondary:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
    danger: 'bg-expense text-white shadow-sm hover:bg-expense-bright',
    ghost:
      'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function IconButton({
  onClick,
  title,
  className = '',
  icon = 'pencil',
  autoFocus = false,
}: {
  onClick: () => void
  title: string
  className?: string
  icon?: IconName
  autoFocus?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      autoFocus={autoFocus}
      className={`rounded-(--radius-field) p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 ${className}`}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  )
}

/* -------------------------------- Form bits ------------------------------- */

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      {children}
    </div>
  )
}

export const inputCls =
  'w-full rounded-(--radius-field) border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-brand-bright focus:ring-2 focus:ring-brand-bright/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white'

export function Chip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'income' | 'expense' | 'brand' | 'amber'
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    income:
      'bg-income-soft text-income-strong dark:bg-income-soft-dark/60 dark:text-income-bright',
    expense:
      'bg-expense-soft text-expense-strong dark:bg-expense-soft-dark/60 dark:text-expense-bright',
    brand:
      'bg-brand-soft text-brand-strong dark:bg-brand-soft-dark/60 dark:text-brand-bright',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/* --------------------------------- Modal ---------------------------------- */

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
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-(--radius-panel) bg-white p-5 shadow-2xl sm:rounded-(--radius-panel) dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <IconButton onClick={onClose} title="Cerrar" icon="close" autoFocus />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          {children}
        </div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
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

/* ------------------------------ Empty + stats ------------------------------ */

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: IconName
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-(--radius-panel) border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-(--radius-panel) bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {subtitle && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
  icon?: IconName
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>{label}</SectionLabel>
        {icon && (
          <span className="text-slate-300 dark:text-slate-600">
            <Icon name={icon} className="h-4 w-4" />
          </span>
        )}
      </div>
      <p
        className="mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white"
        style={{ color: accent ?? undefined }}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
      )}
    </Card>
  )
}

/* ------------------------------ Color palette ------------------------------ */

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
              ? 'ring-2 ring-offset-2 ring-brand'
              : 'hover:ring-2 hover:ring-offset-1 hover:ring-slate-300'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
      <div
        title="Color personalizado"
        aria-label="Color personalizado"
        className={`relative h-8 w-8 cursor-pointer overflow-hidden rounded-full ring-1 transition ${
          isCustom ? 'ring-2 ring-offset-2 ring-brand' : 'ring-slate-300'
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
          <Icon name="pencil" className="h-4 w-4 text-white mix-blend-difference" />
        </span>
      </div>
    </div>
  )
}

/* -------------------------------- Date picker ------------------------------ */

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
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-2.5 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
        >
          <Icon name="calendar" />
        </button>
      </div>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-(--radius-panel) border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Mes anterior"
              className="rounded-(--radius-inner) p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-200">
              {MONTH_NAMES[view.month]} {view.year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Mes siguiente"
              className="rounded-(--radius-inner) p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Icon name="chevron-right" className="h-4 w-4" />
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
                  className={`flex h-8 items-center justify-center rounded-(--radius-inner) text-sm transition ${
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
            className="mt-2 w-full rounded-(--radius-inner) px-2 py-1.5 text-sm font-medium text-brand transition hover:bg-brand-soft dark:text-brand-bright dark:hover:bg-slate-800"
          >
            Hoy
          </button>
        </div>
      )}
    </div>
  )
}