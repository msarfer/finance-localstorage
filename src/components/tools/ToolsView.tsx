import { useRef, useState } from 'react';

import type { ImportResult } from '@/utils/validate';
import type { ColorThemeId } from '@/types';
import { buildExport, parseImport } from '@/utils/validate';
import { useStore } from '@/store/useStore';
import { formatEUR } from '@/lib/money';
import {
	Button,
	Card,
	ConfirmDialog,
	Modal,
	PageHeader,
	SectionLabel,
	inputCls,
} from '@/components/ui';
import { Icon } from '@/components/icons';
import { useColorTheme } from '@/hooks/useColorTheme';
import { COLOR_THEMES } from '@/theme';

function todayFilename(): string {
	return `mis-finanzas-${new Date().toISOString().slice(0, 10)}.json`;
}

export function ToolsView() {
	const accounts = useStore((s) => s.accounts);
	const movements = useStore((s) => s.movements);
	const categories = useStore((s) => s.categories);
	const settings = useStore((s) => s.settings);
	const replaceAll = useStore((s) => s.replaceAll);
	const clearAll = useStore((s) => s.clearAll);
	const { colorTheme, setColorTheme } = useColorTheme();

	const fileRef = useRef<HTMLInputElement>(null);
	const [result, setResult] = useState<ImportResult | null>(null);
	const [reading, setReading] = useState(false);
	const [showClear, setShowClear] = useState(false);
	const [done, setDone] = useState<string | null>(null);

	const handleExport = () => {
		const data = buildExport({ accounts, movements, categories, settings });
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = todayFilename();
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		setDone('Exportación descargada correctamente');
		window.setTimeout(() => setDone(null), 3000);
	};

	const onFile = async (file: File) => {
		setReading(true);
		try {
			const text = await file.text();
			setResult(parseImport(text));
		} finally {
			setReading(false);
			if (fileRef.current) fileRef.current.value = '';
		}
	};

	const doImport = () => {
		if (result?.ok && result.state) {
			replaceAll(result.state);
			setDone('Datos importados correctamente');
		}
		setResult(null);
		window.setTimeout(() => setDone(null), 3000);
	};

	const summary = (r: ImportResult) => {
		if (!r.state) return null;
		const assets = r.state.accounts.reduce((sum, a) => sum + a.balance, 0);
		return (
			<div className="rounded-(--radius-inner) bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
				<p className="font-medium text-slate-700 dark:text-slate-200">
					Resumen de la importación
				</p>
				<ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
					<li className="flex items-center gap-2">
						<Icon name="bank" className="h-4 w-4 text-slate-400" />
						Cuentas: <strong>{r.state.accounts.length}</strong> · Patrimonio:{' '}
						<strong className="tabular-nums">{formatEUR(assets)}</strong>
					</li>
					<li className="flex items-center gap-2">
						<Icon name="swap" className="h-4 w-4 text-slate-400" />
						Movimientos: <strong>{r.state.movements.length}</strong>
					</li>
					<li className="flex items-center gap-2">
						<Icon name="tag" className="h-4 w-4 text-slate-400" />
						Categorías: <strong>{r.state.categories.length}</strong>
					</li>
				</ul>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Configuración"
				subtitle="Apariencia, copia de seguridad y más"
			/>

			{done && (
				<div
					role="status"
					className="flex items-center gap-2 rounded-(--radius-inner) border border-income-soft bg-income-soft px-4 py-3 text-sm font-medium text-income-strong dark:border-income-soft-dark dark:bg-income-soft-dark/40 dark:text-income-bright"
				>
					<Icon name="check" className="h-4 w-4" />
					{done}
				</div>
			)}

			<Card className="p-6">
				<SectionLabel>Tema de color</SectionLabel>
				<h2 className="mt-2 text-lg font-semibold">Personaliza los acentos</h2>
				<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
					Elige una paleta predefinida.
				</p>
				<div className="mt-4 max-w-md">
					<select
						className={inputCls}
						value={colorTheme}
						onChange={(e) => setColorTheme(e.target.value as ColorThemeId)}
					>
						{COLOR_THEMES.map((t) => (
							<option key={t.id} value={t.id}>
								{t.label}
							</option>
						))}
					</select>
				</div>
			</Card>

			<Card className="p-6">
				<SectionLabel>Exportar datos</SectionLabel>
				<h2 className="mt-2 text-lg font-semibold">Descarga una copia</h2>
				<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
					Guarda todas tus cuentas, movimientos y categorías en un archivo JSON.
					Guárdalo en un sitio seguro.
				</p>
				<div className="mt-4">
					<Button icon="export" onClick={handleExport}>
						Descargar copia de seguridad
					</Button>
				</div>
			</Card>

			<Card className="p-6">
				<SectionLabel>Importar datos</SectionLabel>
				<h2 className="mt-2 text-lg font-semibold">Restaura una copia</h2>
				<p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
					Selecciona un archivo JSON exportado. Se validará y se mostrará una
					vista previa antes de reemplazar los datos actuales.
				</p>
				<div className="mt-4">
					<input
						ref={fileRef}
						type="file"
						accept="application/json,.json"
						className="hidden"
						onChange={(e) => {
							const f = e.target.files?.[0];
							if (f) onFile(f);
						}}
					/>
					<Button
						variant="secondary"
						icon="import"
						onClick={() => fileRef.current?.click()}
						disabled={reading}
					>
						{reading ? 'Leyendo archivo…' : 'Elegir archivo JSON'}
					</Button>
				</div>
			</Card>

			<Card className="border-amber-200/80 bg-amber-50/50 p-6 dark:border-amber-900 dark:bg-amber-950/20">
				<SectionLabel className="text-amber-700 dark:text-amber-400">
					Zona de peligro
				</SectionLabel>
				<h2 className="mt-2 text-lg font-semibold text-amber-900 dark:text-amber-200">
					Empezar de cero
				</h2>
				<p className="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80">
					Elimina todas las cuentas, movimientos y categorías. Esta acción no se
					puede deshacer.
				</p>
				<div className="mt-4">
					<Button
						variant="secondary"
						icon="trash"
						className="border-expense/30 text-expense hover:bg-expense-soft dark:border-expense/40 dark:text-expense-bright dark:hover:bg-expense-soft-dark/40"
						onClick={() => setShowClear(true)}
					>
						Vaciar todos los datos
					</Button>
				</div>
			</Card>

			{result && (
				<Modal
					title={
						result.ok ? 'Vista previa de la importación' : 'Error al importar'
					}
					onClose={() => setResult(null)}
					footer={
						result.ok ? (
							<>
								<Button variant="secondary" onClick={() => setResult(null)}>
									Cancelar
								</Button>
								<Button onClick={doImport}>Importar y reemplazar</Button>
							</>
						) : (
							<Button variant="secondary" onClick={() => setResult(null)}>
								Cerrar
							</Button>
						)
					}
				>
					<div className="space-y-3">
						{result.errors.length > 0 && (
							<div className="max-h-40 space-y-1 overflow-auto rounded-(--radius-inner) bg-expense-soft p-3 text-xs text-expense-strong dark:bg-expense-soft-dark/40 dark:text-expense-bright">
								{result.errors.map((e, i) => (
									<p key={i} className="flex items-start gap-1.5">
										<Icon
											name="alert"
											className="mt-0.5 h-3.5 w-3.5 shrink-0"
										/>
										{e}
									</p>
								))}
							</div>
						)}
						{result.ok && summary(result)}
						{result.ok && (
							<p className="text-sm text-slate-600 dark:text-slate-300">
								Esta acción <strong>reemplazará</strong> todos los datos
								actuales del navegador.
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
					onConfirm={() => {
						clearAll();
						setShowClear(false);
						setDone('Datos eliminados');
						window.setTimeout(() => setDone(null), 3000);
					}}
				/>
			)}
		</div>
	);
}
