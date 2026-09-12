import { useRef, useState } from 'react'

import type { ImportResult } from '@/utils/validate'
import { buildExport, parseImport } from '@/utils/validate'
import { useStore } from '@/store/useStore'
import { formatEUR } from '@/lib/money'
import { Button, ConfirmDialog, Modal } from '@/components/ui'

function todayFilename(): string {
  return `mis-finanzas-${new Date().toISOString().slice(0, 10)}.json`
}

export function ToolsView() {
  const accounts = useStore((s) => s.accounts)
  const movements = useStore((s) => s.movements)
  const categories = useStore((s) => s.categories)
  const settings = useStore((s) => s.settings)
  const replaceAll = useStore((s) => s.replaceAll)
  const clearAll = useStore((s) => s.clearAll)

  const fileRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [reading, setReading] = useState(false)
  const [showClear, setShowClear] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  const handleExport = () => {
    const data = buildExport({ accounts, movements, categories, settings })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = todayFilename()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setDone('Exportación descargada correctamente')
    window.setTimeout(() => setDone(null), 3000)
  }

  const onFile = async (file: File) => {
    setReading(true)
    try {
      const text = await file.text()
      setResult(parseImport(text))
    } finally {
      setReading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const doImport = () => {
    if (result?.ok && result.state) {
      replaceAll(result.state)
      setDone('Datos importados correctamente')
    }
    setResult(null)
    window.setTimeout(() => setDone(null), 3000)
  }

  const summary = (r: ImportResult) => {
    if (!r.state) return null
    const assets = r.state.accounts.reduce((sum, a) => sum + a.balance, 0)
    return (
      <div className="rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800">
        <p className="font-medium text-slate-700 dark:text-slate-200">Resumen de la importación</p>
        <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
          <li>🏦 Cuentas: <strong>{r.state.accounts.length}</strong> · Patrimonio: <strong>{formatEUR(assets)}</strong></li>
          <li>🔄 Movimientos: <strong>{r.state.movements.length}</strong></li>
          <li>🏷️ Categorías: <strong>{r.state.categories.length}</strong></li>
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Copia de seguridad</h1>

      {done && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          ✓ {done}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Exportar datos</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Descarga un archivo JSON con todas tus cuentas, movimientos y categorías. Guárdalo en un sitio seguro.
        </p>
        <div className="mt-3">
          <Button onClick={handleExport}>⬇️ Descargar copia de seguridad</Button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Importar datos</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Selecciona un archivo JSON exportado. Se validará y se mostrará una vista previa antes de reemplazar los datos actuales.
        </p>
        <div className="mt-3">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
            }}
          />
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={reading}>
            {reading ? 'Leyendo archivo…' : '📂 Elegir archivo JSON'}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900 dark:bg-amber-950/20">
        <h2 className="font-semibold text-amber-800 dark:text-amber-300">Zona de peligro</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="danger" onClick={() => setShowClear(true)}>🗑️ Vaciar todos los datos</Button>
        </div>
      </section>

      {result && (
        <Modal
          title={result.ok ? 'Vista previa de la importación' : 'Error al importar'}
          onClose={() => setResult(null)}
          footer={
            result.ok ? (
              <>
                <Button variant="secondary" onClick={() => setResult(null)}>Cancelar</Button>
                <Button onClick={doImport}>Importar y reemplazar</Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setResult(null)}>Cerrar</Button>
            )
          }
        >
          <div className="space-y-3">
            {result.errors.length > 0 && (
              <div className="max-h-40 overflow-auto rounded-lg bg-expense-soft p-3 text-xs text-expense-strong dark:bg-expense-soft-dark/40 dark:text-expense-bright">
                {result.errors.map((e, i) => (
                  <p key={i}>⚠️ {e}</p>
                ))}
              </div>
            )}
            {result.ok && summary(result)}
            {result.ok && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Esta acción <strong>reemplazará</strong> todos los datos actuales del navegador.
              </p>
            )}
          </div>
        </Modal>
      )}

      {showClear && (
        <ConfirmDialog
          title="Vaciar todos los datos"
          message="Se eliminarán todas las cuentas y movimientos. Esta acción no se puede deshacer."
          confirmLabel="Vaciar"
          onCancel={() => setShowClear(false)}
          onConfirm={() => { clearAll(); setShowClear(false); setDone('Datos eliminados'); window.setTimeout(() => setDone(null), 3000) }}
        />
      )}
    </div>
  )
}