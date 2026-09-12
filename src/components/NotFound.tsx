import { Link } from 'wouter';

import { Icon } from '@/components/icons';

export function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-expense-soft text-expense dark:bg-expense-soft-dark/60 dark:text-expense-bright">
				<Icon name="alert" className="h-7 w-7" />
			</span>
			<p className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
				404
			</p>
			<p className="mt-2 text-slate-500 dark:text-slate-400">
				La página que buscas no existe.
			</p>
			<div className="mt-6 flex gap-2">
				<Link
					href="/"
					className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-bright"
				>
					Ir al resumen
				</Link>
				<Link
					href="/accounts"
					className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
				>
					Ver cuentas
				</Link>
			</div>
		</div>
	);
}