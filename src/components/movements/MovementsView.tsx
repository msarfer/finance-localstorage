import { useMemo, useState } from 'react';

import type { Movement, MovementType } from '@/types';
import { useStore } from '@/store/useStore';
import { currentMonthISO, monthOf } from '@/lib/reports';
import { monthLabel } from '@/lib/display';
import { formatEUR } from '@/lib/money';
import { Button, ConfirmDialog, EmptyState, inputCls } from '@/components/ui';
import { MovementFormModal } from './MovementFormModal';
import { MovementListItem } from './MovementListItem';

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
				<span className="text-income dark:text-income-bright">
					Ingresos: + {formatEUR(monthlyTotals.income)}
				</span>
				<span className="text-expense dark:text-expense-bright">
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
						{filtered.map((m) => (
							<MovementListItem
								key={m.id}
								movement={m}
								accountName={(id) =>
									id ? accountName.get(id) : undefined
								}
								categoryById={categoryById}
								onEdit={() => {
									setEditing(m);
									setPresetType(undefined);
									setPresetDirection(undefined);
									setFormOpen(true);
								}}
								onDelete={() => setDeleting(m)}
							/>
						))}
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
