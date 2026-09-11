import type { ReactNode } from 'react';

import type { View } from '@/types';
import { useStore } from '@/store/useStore';
import { computeCashTotal } from '@/lib/money';
import { formatEUR } from '@/lib/money';
import { useTheme } from '@/hooks/useTheme';

const NAV: { view: View; label: string; icon: string }[] = [
	{ view: 'dashboard', label: 'Resumen', icon: '📊' },
	{ view: 'accounts', label: 'Cuentas', icon: '🏦' },
	{ view: 'movements', label: 'Movimientos', icon: '🔄' },
	{ view: 'categories', label: 'Categorías', icon: '🏷️' },
	{ view: 'tools', label: 'Importar / Exportar', icon: '💾' },
];

export function Layout({
	view,
	onChangeView,
	children,
}: {
	view: View;
	onChangeView: (v: View) => void;
	children: ReactNode;
}) {
	const accounts = useStore((s) => s.accounts);
	const { theme, setTheme } = useTheme();

	const total = accounts.reduce(
		(sum, a) =>
			sum + (a.kind === 'cash' ? computeCashTotal(a.cash ?? {}) : a.balance),
		0,
	);

	const cycleTheme = () => {
		if (theme === 'system') setTheme('dark');
		else if (theme === 'dark') setTheme('light');
		else setTheme('system');
	};

	const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🖥️';

	return (
		<div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
			<header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-2">
						<span className="text-2xl">💰</span>
						<div>
							<p className="font-bold leading-tight">Mis Finanzas</p>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Patrimonio: {formatEUR(total)}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={cycleTheme}
						title={`Tema: ${theme}`}
						className="rounded-lg border border-slate-200 p-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
					>
						{themeIcon}
					</button>
				</div>
				<nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
					{NAV.map((item) => (
						<button
							key={item.view}
							type="button"
							onClick={() => onChangeView(item.view)}
							className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
								view === item.view
									? 'bg-indigo-600 text-white shadow-sm'
									: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
							}`}
						>
							<span aria-hidden>{item.icon}</span>
							{item.label}
						</button>
					))}
				</nav>
			</header>
			<main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
			<footer className="mx-auto max-w-5xl px-4 pb-8 text-center text-xs text-slate-400 dark:text-slate-500"></footer>
		</div>
	);
}
