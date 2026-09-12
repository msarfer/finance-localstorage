import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

import { useStore } from '@/store/useStore';
import { computeCashTotal } from '@/lib/money';
import { formatEUR } from '@/lib/money';
import { useTheme } from '@/hooks/useTheme';

const NAV: { path: string; label: string; icon: string }[] = [
	{ path: '/', label: 'Resumen', icon: '📊' },
	{ path: '/accounts', label: 'Cuentas', icon: '🏦' },
	{ path: '/movements', label: 'Movimientos', icon: '🔄' },
	{ path: '/categories', label: 'Categorías', icon: '🏷️' },
	{ path: '/tools', label: 'Importar / Exportar', icon: '💾' },
];

function isActive(path: string, current: string): boolean {
	return path === '/'
		? current === '/'
		: current === path || current.startsWith(path + '/');
}

export function Layout({ children }: { children: ReactNode }) {
	const accounts = useStore((s) => s.accounts);
	const { theme, setTheme } = useTheme();
	const [location] = useLocation();

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
						<Link
							key={item.path}
							href={item.path}
							className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
								isActive(item.path, location)
									? 'bg-brand text-white shadow-sm'
									: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
							}`}
						>
							<span aria-hidden>{item.icon}</span>
							{item.label}
						</Link>
					))}
				</nav>
			</header>
			<main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
			<footer className="mx-auto max-w-5xl px-4 pb-8 text-center text-xs text-slate-400 dark:text-slate-500"></footer>
		</div>
	);
}