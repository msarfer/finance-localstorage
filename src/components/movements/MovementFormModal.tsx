import { useState } from 'react';

import type { CashCounts, Movement, MovementType } from '@/types';
import { useStore } from '@/store/useStore';
import {
	computeCashTotal,
	emptyCashCounts,
	formatEUR,
	parseCentsInput,
	todayISO,
} from '@/lib/money';
import { Button, Field, Modal, inputCls, DatePicker } from '@/components/ui';
import { CashBreakdownEditor } from '@/components/accounts/CashBreakdownEditor';

type CashflowDirection = 'toCash' | 'toBank';

function hasEnoughCash(
	current: CashCounts | undefined,
	spend: CashCounts,
): boolean {
	const c = current ?? emptyCashCounts();
	return Object.entries(spend).every(
		([denom, count]) => (c[Number(denom)] ?? 0) >= (count ?? 0),
	);
}

export function MovementFormModal({
	initial,
	onClose,
	presetAccountId,
	presetType,
	presetCashflowDirection,
}: {
	initial?: Movement;
	onClose: () => void;
	presetAccountId?: string;
	presetType?: MovementType;
	presetCashflowDirection?: CashflowDirection;
}) {
	const accounts = useStore((s) => s.accounts);
	const categories = useStore((s) => s.categories);
	const addMovement = useStore((s) => s.addMovement);
	const updateMovement = useStore((s) => s.updateMovement);

	const accountById = new Map(accounts.map((a) => [a.id, a]));
	const onlineAccounts = accounts.filter((a) => a.kind === 'online');
	const cashAccounts = accounts.filter((a) => a.kind === 'cash');

	const [type, setType] = useState<MovementType>(
		initial?.type ?? presetType ?? 'expense',
	);
	const [accountId, setAccountId] = useState<string>(
		initial?.accountId ?? presetAccountId ?? accounts[0]?.id ?? '',
	);
	const [fromAccountId, setFromAccountId] = useState<string>(
		initial?.fromAccountId ?? onlineAccounts[0]?.id ?? '',
	);
	const [toAccountId, setToAccountId] = useState<string>(
		initial?.toAccountId ??
			onlineAccounts[1]?.id ??
			onlineAccounts[0]?.id ??
			'',
	);
	const [amount, setAmount] = useState(
		initial ? (initial.amount / 100).toString().replace('.', ',') : '',
	);
	const [date, setDate] = useState(initial?.date ?? todayISO());
	const [concept, setConcept] = useState(initial?.concept ?? '');
	const [categoryId, setCategoryId] = useState<string>(
		initial?.categoryId ?? '',
	);
	const [cashBreakdown, setCashBreakdown] = useState<CashCounts>(
		initial?.cashBreakdown ?? emptyCashCounts(),
	);
	const [error, setError] = useState<string | null>(null);

	const [direction, setDirection] = useState<CashflowDirection>(() => {
		if (initial?.type === 'cashflow') {
			const from = accountById.get(initial.fromAccountId ?? '');
			return from?.kind === 'cash' ? 'toBank' : 'toCash';
		}
		return presetCashflowDirection ?? 'toCash';
	});

	const [cashflowIds, setCashflowIds] = useState<{
		bank: string;
		wallet: string;
	}>(() => {
		const from = accountById.get(initial?.fromAccountId ?? '');
		const to = accountById.get(initial?.toAccountId ?? '');
		return {
			bank:
				from?.kind === 'online'
					? from.id
					: to?.kind === 'online'
						? to.id
						: (onlineAccounts[0]?.id ?? ''),
			wallet:
				from?.kind === 'cash'
					? from.id
					: to?.kind === 'cash'
						? to.id
						: (cashAccounts[0]?.id ?? ''),
		};
	});

	const selectedAccount = accountById.get(accountId);
	const bankAccount = accountById.get(cashflowIds.bank);
	const walletAccount = accountById.get(cashflowIds.wallet);

	const cashflowFrom =
		direction === 'toCash' ? cashflowIds.bank : cashflowIds.wallet;
	const cashflowTo =
		direction === 'toCash' ? cashflowIds.wallet : cashflowIds.bank;

	const cashAffected =
		type === 'cashflow'
			? true
			: type === 'transfer'
				? false
				: selectedAccount?.kind === 'cash';

	const needToWithdraw =
		type === 'expense'
			? selectedAccount?.kind === 'cash'
			: type === 'cashflow' && direction === 'toBank';

	const validCategories = categories.filter(
		(c) => c.type === type || c.type === 'both',
	);

	const resetCash = () => setCashBreakdown(emptyCashCounts());

	const switchType = (t: MovementType) => {
		setType(t);
		setCategoryId('');
		resetCash();
		if (t === 'transfer') {
			if (!onlineAccounts.some((a) => a.id === fromAccountId)) {
				setFromAccountId(onlineAccounts[0]?.id ?? '');
			}
			if (!onlineAccounts.some((a) => a.id === toAccountId)) {
				setToAccountId(onlineAccounts[1]?.id ?? onlineAccounts[0]?.id ?? '');
			}
		}
	};

	const cashTotal = computeCashTotal(cashBreakdown);
	const cents = cashAffected ? cashTotal : parseCentsInput(amount);

	const submit = () => {
		if (!cashAffected && (cents === null || cents <= 0)) {
			setError('Introduce un importe válido mayor que 0');
			return;
		}
		if (cashAffected && cashTotal === 0) {
			setError('Define los billetes y monedas de esta operación');
			return;
		}
		const finalCents = cents ?? 0;

		if (type === 'transfer') {
			if (!fromAccountId || !toAccountId) {
				setError('Selecciona cuentas de origen y destino');
				return;
			}
			if (fromAccountId === toAccountId) {
				setError('La cuenta de origen y destino deben ser distintas');
				return;
			}
			const payload = {
				type: 'transfer' as const,
				amount: finalCents,
				date,
				concept: concept.trim() || undefined,
				fromAccountId,
				toAccountId,
			};
			if (initial) updateMovement(initial.id, payload);
			else addMovement(payload);
		} else if (type === 'cashflow') {
			if (!cashflowIds.bank || !cashflowIds.wallet) {
				setError(
					'Necesitas una cuenta online y una de efectivo para esta operación',
				);
				return;
			}
			if (direction === 'toBank') {
				if (
					walletAccount &&
					!hasEnoughCash(walletAccount.cash, cashBreakdown)
				) {
					setError(
						`No hay suficientes billetes/monedas en "${walletAccount.name}" para ingresar`,
					);
					return;
				}
			}
			const payload = {
				type: 'cashflow' as const,
				amount: finalCents,
				date,
				concept: concept.trim() || undefined,
				fromAccountId: cashflowFrom,
				toAccountId: cashflowTo,
				cashBreakdown,
			};
			if (initial) updateMovement(initial.id, payload);
			else addMovement(payload);
		} else {
			if (!accountId) {
				setError('Selecciona una cuenta');
				return;
			}
			if (
				needToWithdraw &&
				selectedAccount &&
				!hasEnoughCash(selectedAccount.cash, cashBreakdown)
			) {
				setError(
					`No hay suficientes billetes/monedas en "${selectedAccount.name}" para este gasto`,
				);
				return;
			}
			const payload = {
				type,
				amount: finalCents,
				date,
				concept: concept.trim() || undefined,
				accountId,
				categoryId: categoryId || undefined,
				cashBreakdown: cashAffected ? cashBreakdown : undefined,
			};
			if (initial) updateMovement(initial.id, payload);
			else addMovement(payload);
		}
		onClose();
	};

	const typeBtn = (
		t: MovementType,
		label: string,
		opts: { disabled?: boolean } = {},
	) => {
		const { disabled = false } = opts;
		return (
			<button
				type="button"
				disabled={disabled}
				onClick={() => switchType(t)}
				className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
					disabled && !(type === t)
						? 'cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500'
						: type === t
							? t === 'income'
								? 'border-income bg-income text-white'
								: t === 'expense'
									? 'border-expense bg-expense text-white'
									: 'border-brand bg-brand text-white'
							: 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
				}`}
			>
				{label}
			</button>
		);
	};

	const dirBtn = (d: CashflowDirection, label: string) => (
		<button
			type="button"
			onClick={() => setDirection(d)}
			className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
				direction === d
					? 'border-brand bg-brand text-white'
					: 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
			}`}
		>
			{label}
		</button>
	);

	const breakdownLabel =
		type === 'income'
			? `Billetes y monedas que entran en "${selectedAccount?.name}"`
			: type === 'expense'
				? `Billetes y monedas que salen de "${selectedAccount?.name}"`
				: direction === 'toCash'
					? `Billetes y monedas que sacas (de "${bankAccount?.name}" a "${walletAccount?.name}")`
					: `Billetes y monedas que ingresas (de "${walletAccount?.name}" a "${bankAccount?.name}")`;

	return (
		<Modal
			title={initial ? 'Editar movimiento' : 'Nuevo movimiento'}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancelar
					</Button>
					<Button onClick={submit}>
						{initial ? 'Guardar cambios' : 'Añadir movimiento'}
					</Button>
				</>
			}
		>
			<div className="space-y-4 p-2">
				<div className="grid grid-cols-4 gap-2">
					{typeBtn('expense', '💸 Gasto')}
					{typeBtn('income', '📥 Ingreso')}
					{typeBtn('transfer', '🔁 Online', {
						disabled: onlineAccounts.length < 2,
					})}
					{typeBtn('cashflow', '💱 Efectivo', {
						disabled: onlineAccounts.length === 0,
					})}
				</div>
				{onlineAccounts.length < 2 && (
					<p className="text-xs text-slate-400 dark:text-slate-500">
						{onlineAccounts.length === 0
							? 'Necesitas al menos una cuenta online para Banco ↔ Efectivo y dos para transferencias'
							: 'Necesitas al menos dos cuentas online para hacer transferencias'}
					</p>
				)}

				<Field label="Concepto">
					<input
						className={inputCls}
						value={concept}
						onChange={(e) => setConcept(e.target.value)}
						placeholder="Ej. Compra semanal"
					/>
				</Field>

				{type === 'transfer' && (
					<div className="grid grid-cols-2 gap-3">
						<Field label="Desde (origen)">
							<select
								className={inputCls}
								value={fromAccountId}
								onChange={(e) => setFromAccountId(e.target.value)}
							>
								{onlineAccounts.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name}
									</option>
								))}
							</select>
						</Field>
						<Field label="Hacia (destino)">
							<select
								className={inputCls}
								value={toAccountId}
								onChange={(e) => setToAccountId(e.target.value)}
							>
								{onlineAccounts.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name}
									</option>
								))}
							</select>
						</Field>
					</div>
				)}

				{type === 'cashflow' && (
					<>
						<div className="flex gap-2">
							{dirBtn('toCash', 'Sacar dinero')}
							{dirBtn('toBank', 'Ingresar dinero')}
						</div>
						<div className="grid grid-cols-2 gap-3">
							<Field label="Cuenta bancaria (online)">
								<select
									className={inputCls}
									value={cashflowIds.bank}
									onChange={(e) =>
										setCashflowIds((p) => ({ ...p, bank: e.target.value }))
									}
								>
									{onlineAccounts.map((a) => (
										<option key={a.id} value={a.id}>
											{a.name}
										</option>
									))}
								</select>
							</Field>
							<Field label="Cartera (efectivo)">
								<select
									className={inputCls}
									value={cashflowIds.wallet}
									onChange={(e) =>
										setCashflowIds((p) => ({ ...p, wallet: e.target.value }))
									}
								>
									{cashAccounts.map((a) => (
										<option key={a.id} value={a.id}>
											{a.name}
										</option>
									))}
								</select>
							</Field>
						</div>
					</>
				)}

				{type !== 'transfer' && type !== 'cashflow' && (
					<div className="grid grid-cols-2 gap-3">
						<Field label="Cuenta">
							<select
								className={inputCls}
								value={accountId}
								onChange={(e) => {
									setAccountId(e.target.value);
									resetCash();
								}}
							>
								{accounts.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name}
									</option>
								))}
							</select>
						</Field>
						<Field label="Categoría">
							<select
								className={inputCls}
								value={categoryId}
								onChange={(e) => setCategoryId(e.target.value)}
							>
								<option value="">Sin categoría</option>
								{validCategories.map((c) => (
									<option key={c.id} value={c.id}>
										{c.emoji ? `${c.emoji} ` : ''}
										{c.name}
									</option>
								))}
							</select>
						</Field>
					</div>
				)}

				<div className="grid grid-cols-2 gap-3">
					<Field
						label={
							cashAffected ? 'Importe (calculado del desglose)' : 'Importe (€)'
						}
					>
						{cashAffected ? (
							<div className="flex h-9.5 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
								{formatEUR(cashTotal)}
							</div>
						) : (
							<input
								className={inputCls}
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								inputMode="decimal"
								placeholder="0,00"
							/>
						)}
					</Field>
					<Field label="Fecha">
						<DatePicker value={date} onChange={setDate} />
					</Field>
				</div>

				{cashAffected && (
					<Field label={breakdownLabel}>
						<CashBreakdownEditor
							value={cashBreakdown}
							onChange={setCashBreakdown}
						/>
						<div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800">
							<span className="text-slate-600 dark:text-slate-300">
								El importe se calcula según los billetes y monedas
							</span>
							<span className="font-semibold text-slate-700 dark:text-slate-200">
								{formatEUR(cashTotal)}
							</span>
						</div>
					</Field>
				)}

				{error && (
					<p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense dark:bg-expense-soft-dark/40 dark:text-expense-bright">
						{error}
					</p>
				)}
			</div>
		</Modal>
	);
}
