import { useMemo, useState } from 'react';

import type { Movement, MovementType } from '@/types';
import { useStore } from '@/store/useStore';
import { currentMonthISO, monthOf } from '@/lib/reports';
import { signedEUR, formatDate, monthLabel } from '@/lib/display';
import { formatEUR } from '@/lib/money';
import { Button, ConfirmDialog, EmptyState, inputCls } from '@/components/ui';
import { MovementFormModal } from './MovementFormModal';

export function MovementsView() {
	const accounts = useStore((s) => s.accounts);
	const movements = useStore((s) => s.movements);
	const categories = useStore((s) => s.categories);
	const deleteMovement = useStore((s) => s.deleteMovement);

	const [filterAccount, setFilterAccount] = useState('');
	const [filterType, setFilterType] = useState<'all' | MovementType>('all');
	const [search, setSearch] = useState('');
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<Movement | null>(null);
	const [presetType, setPresetType] = useState<MovementType | undefined>(
		undefined,
	);
	const [presetDirection, setPresetDirection] = useState<
		'toCash' | 'toBank' | undefined
	>(undefined);
	const [moveMenuOpen, setMoveMenuOpen] = useState(false);
	const [deleting, setDeleting] = useState<Movement | null>(null);

	const onlineAccounts = accounts.filter((a) => a.kind === 'online');
	const cashAccounts = accounts.filter((a) => a.kind === 'cash');
	const cashMenuDisabled =
		onlineAccounts.length === 0 || cashAccounts.length === 0;
	const onlineTransferDisabled = onlineAccounts.length < 2;

	const accountName = useMemo(
		() => new Map(accounts.map((a) => [a.id, a.name])),
		[accounts],
	);
	const categoryById = useMemo(
		() => new Map(categories.map((c) => [c.id, c])),
		[categories],
	);

	const months = useMemo(() => {
		const set = new Set(movements.map((m) => monthOf(m.date)));
		set.add(currentMonthISO());
		return Array.from(set).sort((a, b) => b.localeCompare(a));
	}, [movements]);
	const [filterMonth, setFilterMonth] = useState(
		months[0] ?? currentMonthISO(),
	);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return movements
			.filter((m) =>
				filterAccount
					? [m.accountId, m.fromAccountId, m.toAccountId].includes(
							filterAccount,
						)
					: true,
			)
			.filter((m) => (filterType === 'all' ? true : m.type === filterType))
			.filter((m) => (filterMonth ? monthOf(m.date) === filterMonth : true))
			.filter((m) =>
				q
					? (m.concept ?? '').toLowerCase().includes(q) ||
						(m.categoryId
							? (categoryById.get(m.categoryId)?.name ?? '')
									.toLowerCase()
									.includes(q)
							: false) ||
						(m.accountId
							? (accountName.get(m.accountId) ?? '').toLowerCase().includes(q)
							: false)
					: true,
			)
			.sort((a, b) =>
				a.date === b.date
					? b.createdAt - a.createdAt
					: b.date.localeCompare(a.date),
			);
	}, [
		movements,
		filterAccount,
		filterType,
		filterMonth,
		search,
		accountName,
		categoryById,
	]);

	const monthlyTotals = useMemo(() => {
		const income = filtered
			.filter((m) => m.type === 'income')
			.reduce((s, m) => s + m.amount, 0);
		const expense = filtered
			.filter((m) => m.type === 'expense')
			.reduce((s, m) => s + m.amount, 0);
		return { income, expense };
	}, [filtered]);

	const chip = (m: Movement) => {
		if (m.type === 'expense')
			return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
		if (m.type === 'income')
			return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
		return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';
	};

	const newMovement = (t: MovementType) => {
		setEditing(null);
		setPresetType(t);
		setPresetDirection(undefined);
		setFormOpen(true);
	};

	const newCashflow = (direction: 'toCash' | 'toBank') => {
		setEditing(null);
		setPresetType('cashflow');
		setPresetDirection(direction);
		setFormOpen(true);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<h1 className="text-xl font-bold">Movimientos</h1>
				<div className="flex gap-2">
					<div className="relative">
						<Button onClick={() => setMoveMenuOpen((o) => !o)}>
							+ Nuevo movimiento
						</Button>
						{moveMenuOpen && (
							<div
								className="fixed inset-0 z-20"
								onClick={() => setMoveMenuOpen(false)}
							/>
						)}
						{moveMenuOpen && (
							<div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-lg dark:border-slate-700 dark:bg-slate-900">
								<div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
									Ordinarios
								</div>
								<button
									type="button"
									onClick={() => {
										newMovement('expense');
										setMoveMenuOpen(false);
									}}
									className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
								>
									Gasto
								</button>
								<button
									type="button"
									onClick={() => {
										newMovement('income');
										setMoveMenuOpen(false);
									}}
									className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
								>
									Ingreso
								</button>
								<button
									type="button"
									disabled={onlineTransferDisabled}
									onClick={() => {
										newMovement('transfer');
										setMoveMenuOpen(false);
									}}
									className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
								>
									Transferencia online
								</button>
								{onlineTransferDisabled && (
									<p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
										Necesitas al menos dos cuentas online para hacer transferencias
									</p>
								)}
								<div className="my-1 border-t border-slate-100 dark:border-slate-800" />
								<div className="px-4 pt-1 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
									Banco ↔ Efectivo
								</div>
								<button
									type="button"
									disabled={cashMenuDisabled}
									onClick={() => {
										newCashflow('toCash');
										setMoveMenuOpen(false);
									}}
									className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
								>
									Sacar dinero
								</button>
								<button
									type="button"
									disabled={cashMenuDisabled}
									onClick={() => {
										newCashflow('toBank');
										setMoveMenuOpen(false);
									}}
									className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
								>
									Ingresar dinero
								</button>
								{cashMenuDisabled && (
									<p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
										Necesitas al menos una cuenta online y una de efectivo
									</p>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="grid gap-2 sm:grid-cols-4">
				<select
					className={inputCls}
					value={filterMonth}
					onChange={(e) => setFilterMonth(e.target.value)}
				>
					{months.map((m) => (
						<option key={m} value={m}>
							{monthLabel(m)}
						</option>
					))}
				</select>
				<select
					className={inputCls}
					value={filterAccount}
					onChange={(e) => setFilterAccount(e.target.value)}
				>
					<option value="">Todas las cuentas</option>
					{accounts.map((a) => (
						<option key={a.id} value={a.id}>
							{a.name}
						</option>
					))}
				</select>
				<select
					className={inputCls}
					value={filterType}
					onChange={(e) =>
						setFilterType(e.target.value as 'all' | MovementType)
					}
				>
					<option value="all">Todos los tipos</option>
					<option value="income">Ingresos</option>
					<option value="expense">Gastos</option>
					<option value="transfer">Transferencias online</option>
					<option value="cashflow">Banco ↔ Efectivo</option>
				</select>
				<input
					className={inputCls}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Buscar concepto, categoría..."
				/>
			</div>

			<div className="flex items-center gap-3 text-sm">
				<span className="text-emerald-600 dark:text-emerald-400">
					Ingresos: + {formatEUR(monthlyTotals.income)}
				</span>
				<span className="text-red-600 dark:text-red-400">
					Gastos: - {formatEUR(monthlyTotals.expense)}
				</span>
			</div>

			{filtered.length === 0 ? (
				<EmptyState
					icon="🧾"
					title="Sin movimientos"
					subtitle="Ajusta los filtros o registra un nuevo movimiento"
				/>
			) : (
				<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<ul className="divide-y divide-slate-100 dark:divide-slate-800">
						{filtered.map((m) => {
							const cat = m.categoryId
								? categoryById.get(m.categoryId)
								: undefined;
							const isPair = m.type === 'transfer' || m.type === 'cashflow';
							const originName = isPair
								? accountName.get(m.fromAccountId ?? '')
								: accountName.get(m.accountId ?? '');
							const destName = isPair
								? accountName.get(m.toAccountId ?? '')
								: undefined;
							return (
								<li key={m.id} className="flex items-center gap-3 px-4 py-3">
									<span
										className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${chip(m)}`}
									>
										{m.type === 'cashflow'
											? '💱'
											: (cat?.emoji ??
												(m.type === 'transfer'
													? '🔁'
													: m.type === 'income'
														? '📥'
														: '💸'))}
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
											{m.concept ||
												(m.type === 'transfer'
													? 'Transferencia online'
													: m.type === 'cashflow'
														? 'Sacar / Ingresar dinero'
														: (cat?.name ?? 'Movimiento'))}
										</p>
										<p className="truncate text-xs text-slate-500 dark:text-slate-400">
											{formatDate(m.date)} · {originName}
											{destName ? ` → ${destName}` : ''}
											{cat && m.type !== 'transfer' ? ` · ${cat.name}` : ''}
											{m.cashBreakdown ? ' · 💵 efectivo' : ''}
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										<span
											className={`text-sm font-semibold ${m.type === 'expense' ? 'text-red-600 dark:text-red-400' : m.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}
										>
											{signedEUR(m.amount, m.type)}
										</span>
										<button
											type="button"
											onClick={() => {
												setEditing(m);
												setPresetType(undefined);
												setPresetDirection(undefined);
												setFormOpen(true);
											}}
											className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
											title="Editar"
										>
											<svg
												className="h-4 w-4"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
											</svg>
										</button>
										<button
											type="button"
											onClick={() => setDeleting(m)}
											className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
											title="Eliminar"
										>
											<svg
												className="h-4 w-4"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4Z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			)}

			{formOpen && (
				<MovementFormModal
					key={editing?.id ?? 'new'}
					initial={editing ?? undefined}
					presetType={presetType}
					presetCashflowDirection={presetDirection}
					onClose={() => setFormOpen(false)}
				/>
			)}

			{deleting && (
				<ConfirmDialog
					title="Eliminar movimiento"
					message={`¿Seguro que quieres eliminar "${deleting.concept || 'este movimiento'}"?`}
					confirmLabel="Eliminar"
					onCancel={() => setDeleting(null)}
					onConfirm={() => {
						deleteMovement(deleting.id);
						setDeleting(null);
					}}
				/>
			)}
		</div>
	);
}
