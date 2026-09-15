import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

import { useStore } from '@/store/useStore';
import { useUiStore } from '@/store/ui';
import { computeCashTotal, formatEUR } from '@/lib/money';
import { APP_VERSION } from '@/lib/version';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/icons';
import type { IconName } from '@/components/icons';
import { MovementFormModal } from '@/components/movements/MovementFormModal';

const NAV: { path: string; label: string; icon: IconName }[] = [
	{ path: '/', label: 'Resumen', icon: 'dashboard' },
	{ path: '/accounts', label: 'Cuentas', icon: 'bank' },
	{ path: '/movements', label: 'Movimientos', icon: 'swap' },
	{ path: '/categories', label: 'Categorías', icon: 'tag' },
	{ path: '/tools', label: 'Configuración', icon: 'gear' },
];

const MOBILE_NAV: { path: string; label: string; icon: IconName }[] = [
	{ path: '/', label: 'Resumen', icon: 'dashboard' },
	{ path: '/accounts', label: 'Cuentas', icon: 'bank' },
	{ path: '/movements', label: 'Movimientos', icon: 'swap' },
	{ path: '/categories', label: 'Categorías', icon: 'tag' },
];

const THEMES: { value: 'light' | 'dark' | 'system'; icon: IconName; title: string }[] = [
	{ value: 'light', icon: 'sun', title: 'Tema claro' },
	{ value: 'dark', icon: 'moon', title: 'Tema oscuro' },
	{ value: 'system', icon: 'monitor', title: 'Tema del sistema' },
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

	const movementFormOpen = useUiStore((s) => s.movementFormOpen);
	const closeMovementForm = useUiStore((s) => s.closeMovementForm);

	const total = accounts.reduce(
		(sum, a) =>
			sum + (a.kind === 'cash' ? computeCashTotal(a.cash ?? {}) : a.balance),
		0,
	);

	const brand = (
		<Link href="/" className="flex items-center gap-3">
			<img
				src={`${import.meta.env.BASE_URL}favicon.svg`}
				alt=""
				aria-hidden="true"
				className="h-9 w-9 shrink-0"
			/>
			<span>
				<span className="block font-display text-base font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
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
				aria-current={active ? 'page' : undefined}
				className={`relative flex items-center gap-3 rounded-(--radius-field) px-3 py-2 text-sm font-medium transition ${
					active
						? 'bg-brand-soft/70 text-brand-strong dark:bg-brand-soft-dark/60 dark:text-brand-bright'
						: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
				}`}
			>
				{active && (
					<span className="absolute left-0 h-5 w-1 rounded-full bg-brand dark:bg-brand-bright" />
				)}
				<Icon name={item.icon} className="h-5 w-5" />
				{item.label}
			</Link>
		);
	});

	const themeSegmented = (
		<div
			role="group"
			aria-label="Apariencia"
			className="flex items-center gap-0.5 rounded-(--radius-field) border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900"
		>
			{THEMES.map((t) => {
				const selected = theme === t.value;
				return (
					<button
						key={t.value}
						type="button"
						onClick={() => setTheme(t.value)}
						title={t.title}
						aria-pressed={selected}
						aria-label={t.title}
						className={`flex h-7 w-7 items-center justify-center rounded-(--radius-inner) transition ${
							selected
								? 'bg-brand text-white shadow-sm dark:bg-brand-bright'
								: 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200'
						}`}
					>
						<Icon name={t.icon} className="h-4 w-4" />
					</button>
				);
			})}
		</div>
	);

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
			{/* Sidebar desktop */}
			<aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white px-4 py-6 sm:px-5 lg:flex dark:border-slate-800 dark:bg-slate-900/60">
				<div className="px-1">{brand}</div>
				<nav className="mt-8 flex flex-1 flex-col gap-1">{navItems}</nav>
				<div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
					<div className="rounded-(--radius-panel) bg-brand p-4 text-white dark:bg-brand-strong">
						<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 dark:text-white/80">
							Tu Patrimonio
						</p>
						<p className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums">
							{formatEUR(total)}
						</p>
						<p className="mt-1 text-xs text-white/70 dark:text-white/80">
							{accounts.length}{' '}
							{accounts.length === 1 ? 'cuenta' : 'cuentas'}
						</p>
					</div>
					<div className="flex items-center justify-between px-1">
						<span className="text-xs text-slate-400 dark:text-slate-500">
							Apariencia
						</span>
						{themeSegmented}
					</div>
					<p className="px-1 text-center text-[11px] text-slate-400 dark:text-slate-500">
						v{APP_VERSION}
					</p>
				</div>
			</aside>

			{/* Header móvil */}
			<header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/90">
				<Link href="/" className="flex items-center gap-2.5">
					<img
						src={`${import.meta.env.BASE_URL}favicon.svg`}
						alt=""
						aria-hidden="true"
						className="h-9 w-9 shrink-0"
					/>
					<span className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
						Mis Finanzas
					</span>
					<span className="text-[10px] text-slate-400 dark:text-slate-500">
						v{APP_VERSION}
					</span>
				</Link>
				<div className="flex items-center gap-1">
					<Link
						href="/tools"
						aria-label="Configuración"
						title="Configuración"
						className="rounded-(--radius-field) p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
					>
						<Icon name="gear" className="h-5 w-5" />
					</Link>
					{accounts.length > 0 && (
						<button
							type="button"
							onClick={() => useUiStore.getState().openMovementForm()}
							title="Nuevo movimiento"
							aria-label="Nuevo movimiento"
							className="flex h-9 w-9 items-center justify-center rounded-(--radius-field) bg-brand text-white shadow-sm transition hover:bg-brand-bright active:scale-95"
						>
							<Icon name="plus" className="h-5 w-5" />
						</button>
					)}
				</div>
			</header>

			<main className="pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-10 lg:pl-64">
				<div
					key={location}
					className="mx-auto max-w-5xl px-4 py-6 animate-[view-enter_280ms_ease-out] sm:px-6 lg:px-8"
				>
					{children}
				</div>
			</main>

			{/* Bottom nav móvil */}
			<nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200/80 bg-white/95 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
				{MOBILE_NAV.map((item) => {
					const active = isActive(item.path, location);
					return (
						<Link
							key={item.path}
							href={item.path}
							aria-current={active ? 'page' : undefined}
							className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
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

			{movementFormOpen && (
				<MovementFormModal onClose={closeMovementForm} />
			)}
		</div>
	);
}