import { useMemo, useState } from 'react';

import type { Movement, MovementType } from '@/types';
import { useStore } from '@/store/useStore';
import { currentMonthISO, monthOf } from '@/lib/reports';
import { monthLabel } from '@/lib/display';
import { formatEUR } from '@/lib/money';
import { Button, Card, Chip, ConfirmDialog, EmptyState, inputCls, PageHeader, SearchBox, SectionLabel, Segmented } from '@/components/ui';
import { MovementFormModal } from './MovementFormModal';
import { MovementListItem } from './MovementListItem';
import { Icon } from '@/components/icons';
import type { IconName } from '@/components/icons';

function MenuItem({
	icon,
	label,
	onClick,
	onClose,
	disabled = false,
	hint,
}: {
	icon: IconName;
	label: string;
	onClick: () => void;
	onClose: () => void;
	disabled?: boolean;
	hint?: string;
}) {
	return (
		<>
			<button
				type="button"
				disabled={disabled}
				onClick={() => {
					onClick();
					onClose();
				}}
				className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
			>
				<Icon name={icon} className="h-4 w-4 text-slate-400 dark:text-slate-500" />
				{label}
			</button>
			{disabled && hint && (
				<p className="px-4 pb-2 text-xs text-slate-400 dark:text-slate-500">
					{hint}
				</p>
			)}
		</>
	);
}

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
		<div className="space-y-6">
			<PageHeader
				title="Movimientos"
				subtitle={`${filtered.length} movimiento${filtered.length === 1 ? '' : 's'}`}
				action={
					<div className="relative">
						<Button
							icon="plus"
							onClick={() => setMoveMenuOpen((o) => !o)}
							disabled={accounts.length === 0}
							title={
								accounts.length === 0
									? 'Crea una cuenta para añadir movimientos'
									: undefined
							}
						>
							Nuevo movimiento
						</Button>
						{moveMenuOpen && (
							<div
								className="fixed inset-0 z-20"
								onClick={() => setMoveMenuOpen(false)}
							/>
						)}
						{moveMenuOpen && (
							<div className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-(--radius-panel) border border-slate-200 bg-white text-left shadow-xl dark:border-slate-700 dark:bg-slate-900">
								<div className="px-4 pt-4 pb-1">
									<SectionLabel>Ordinarios</SectionLabel>
								</div>
								<MenuItem
									icon="trend-down"
									label="Gasto"
									onClick={() => newMovement('expense')}
									onClose={() => setMoveMenuOpen(false)}
								/>
								<MenuItem
									icon="trend-up"
									label="Ingreso"
									onClick={() => newMovement('income')}
									onClose={() => setMoveMenuOpen(false)}
								/>
								<MenuItem
									icon="swap"
									label="Transferencia online"
									onClick={() => newMovement('transfer')}
									onClose={() => setMoveMenuOpen(false)}
									disabled={onlineTransferDisabled}
									hint="Necesitas al menos dos cuentas online"
								/>
								<div className="my-1 border-t border-slate-100 dark:border-slate-800" />
								<div className="px-4 pt-1 pb-1">
									<SectionLabel>Banco ↔ Efectivo</SectionLabel>
								</div>
								<MenuItem
									icon="wallet"
									label="Sacar dinero"
									onClick={() => newCashflow('toCash')}
									onClose={() => setMoveMenuOpen(false)}
									disabled={cashMenuDisabled}
									hint="Necesitas una cuenta online y una de efectivo"
								/>
								<MenuItem
									icon="wallet"
									label="Ingresar dinero"
									onClick={() => newCashflow('toBank')}
									onClose={() => setMoveMenuOpen(false)}
									disabled={cashMenuDisabled}
									hint="Necesitas una cuenta online y una de efectivo"
								/>
							</div>
						)}
					</div>
				}
			/>

			<Card className="p-4">
				<div className="grid gap-3 sm:grid-cols-2">
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
				</div>
				<div className="mt-3 flex flex-wrap items-center gap-3">
					<select
						className={`${inputCls} sm:hidden`}
						value={filterType}
						onChange={(e) =>
							setFilterType(e.target.value as 'all' | MovementType)
						}
					>
						<option value="all">Todos</option>
						<option value="income">Ingresos</option>
						<option value="expense">Gastos</option>
						<option value="transfer">Transferencias</option>
						<option value="cashflow">Banco ↔ Efectivo</option>
					</select>
					<div className="hidden sm:block">
						<Segmented<'all' | MovementType>
							value={filterType}
							onChange={setFilterType}
							options={[
								{ value: 'all', label: 'Todos' },
								{ value: 'income', label: 'Ingresos' },
								{ value: 'expense', label: 'Gastos' },
								{ value: 'transfer', label: 'Transferencias' },
								{ value: 'cashflow', label: 'Banco ↔ Efectivo' },
							]}
						/>
					</div>
					<div className="min-w-0 flex-1 sm:max-w-xs">
						<SearchBox
							value={search}
							onChange={setSearch}
							placeholder="Buscar concepto, categoría…"
						/>
					</div>
				</div>
				<div className="mt-3 flex items-center gap-2">
					<Chip tone="income">Ingresos: + {formatEUR(monthlyTotals.income)}</Chip>
					<Chip tone="expense">Gastos: - {formatEUR(monthlyTotals.expense)}</Chip>
				</div>
			</Card>

			{filtered.length === 0 ? (
				<EmptyState
					icon="inbox"
					title="Sin movimientos"
					subtitle="Ajusta los filtros o registra un nuevo movimiento"
				/>
			) : (
				<Card>
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
				</Card>
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