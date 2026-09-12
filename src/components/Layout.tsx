import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

import { useStore } from '@/store/useStore';
import { computeCashTotal } from '@/lib/money';
import { formatEUR } from '@/lib/money';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/icons';
import type { IconName } from '@/components/icons';

const NAV: { path: string; label: string; icon: IconName }[] = [
	{ path: '/', label: 'Resumen', icon: 'dashboard' },
	{ path: '/accounts', label: 'Cuentas', icon: 'bank' },
	{ path: '/movements', label: 'Movimientos', icon: 'swap' },
	{ path: '/categories', label: 'Categorías', icon: 'tag' },
	{ path: '/tools', label: 'Copia de seguridad', icon: 'backup' },
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

	const themeIcon: IconName =
		theme === 'dark' ? 'moon' : theme === 'light' ? 'sun' : 'monitor';

	const brand = (
		<Link href="/" className="flex items-center gap-3">
			<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
				<Icon name="wallet" className="h-5 w-5" />
			</span>
			<span>
				<span className="block text-[15px] font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
					Mis Finanzas
				</span>
				<span className="block text-xs text-slate-500 dark:text-slate-400">
					Tus cuentas en un vistazo
				</span>
			</span>
		</Link>
	);

	const navItems = NAV.map((item) => {
		const active = isActive(item.path, location);
		return (
			<Link
				key={item.path}
				href={item.path}
				className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
					active
						? 'bg-brand-soft text-brand dark:bg-brand-soft-dark dark:text-brand-bright'
						: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
				}`}
			>
				<Icon name={item.icon} className="h-5 w-5" />
				{item.label}
			</Link>
		);
	});

	const themeToggle = (
		<button
			type="button"
			onClick={cycleTheme}
			title={`Tema: ${theme === 'dark' ? 'oscuro' : theme === 'light' ? 'claro' : 'sistema'}`}
			className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
		>
			<Icon name={themeIcon} className="h-5 w-5" />
		</button>
	);

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
			<aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white px-4 py-6 sm:px-5 lg:flex dark:border-slate-800 dark:bg-slate-900/60">
				<div className="px-1">{brand}</div>
				<nav className="mt-8 flex flex-1 flex-col gap-1">{navItems}</nav>
				<div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
					<div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
						<p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
							Tu Patrimonio
						</p>
						<p className="mt-0.5 text-lg font-semibold tracking-tight tabular-nums text-slate-900 dark:text-white">
							{formatEUR(total)}
						</p>
					</div>
					<div className="flex items-center justify-between px-1">
						<span className="text-xs text-slate-400 dark:text-slate-500">
							Apariencia
						</span>
						{themeToggle}
					</div>
				</div>
			</aside>

			<header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/90">
				{brand}
				{themeToggle}
			</header>

			<main className="pb-24 lg:pb-10 lg:pl-64">
				<div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
					{children}
				</div>
			</main>

			<nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200/80 bg-white/95 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
				{NAV.map((item) => {
					const active = isActive(item.path, location);
					return (
						<Link
							key={item.path}
							href={item.path}
							className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
								active
									? 'text-brand dark:text-brand-bright'
									: 'text-slate-400 dark:text-slate-500'
							}`}
						>
							<Icon name={item.icon} className="h-5 w-5" />
							{item.label.split(' ')[0]}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
