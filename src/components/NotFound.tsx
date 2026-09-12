import { Link } from 'wouter';

export function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<span className="text-5xl">🔍</span>
			<h1 className="mt-4 text-2xl font-bold">Página no encontrada</h1>
			<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
				La ruta a la que intentas acceder no existe.
			</p>
			<div className="mt-6 flex gap-2">
				<Link
					href="/"
					className="rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-bright"
				>
					Ir al resumen
				</Link>
				<Link
					href="/accounts"
					className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
				>
					Ver cuentas
				</Link>
			</div>
		</div>
	);
}