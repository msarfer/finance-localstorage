import { useId, useState } from 'react';

import type { CashCounts } from '@/types';
import { BILLS, COINS, BILL_LABELS, COIN_LABELS } from '@/data/constants';
import {
	computeCashTotal,
	countsFromValue,
	formatEUR,
	parseCentsInput,
} from '@/lib/money';
import { Button, inputCls } from '@/components/ui';

const MAX_COUNT = 999;

function DenominationRow({
	label,
	denom,
	count,
	onChange,
}: {
	label: string;
	denom: number;
	count: number;
	onChange: (next: number) => void;
}) {
	const [draft, setDraft] = useState('');
	const [focused, setFocused] = useState(false);

	const noun = denom >= 500 ? 'un billete' : 'una moneda';

	const clamp = (n: number) => Math.min(Math.max(0, n), MAX_COUNT);

	const bump = (delta: number) => {
		const base = focused && draft !== '' ? parseInt(draft, 10) || 0 : count;
		const next = clamp(base + delta);
		onChange(next);
		setDraft(String(next));
	};

	const commit = () => {
		const parsed = parseInt(draft, 10);
		const next = Number.isFinite(parsed) && parsed > 0 ? clamp(parsed) : 0;
		onChange(next);
		setFocused(false);
	};

	const display = focused ? draft : String(count);

	const btnCls =
		'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700';

	return (
		<li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
			<div className="flex min-w-0 flex-col">
				<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
					{label}
				</span>
				{count > 0 && (
					<span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
						{count} ud. · {formatEUR(denom * count)}
					</span>
				)}
			</div>
			<div className="flex items-center gap-1.5">
				<button
					type="button"
					onClick={() => bump(-1)}
					disabled={count === 0}
					aria-label={`Quitar ${noun} de ${label}`}
					className={btnCls}
				>
					<svg
						className="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M5 10a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 10Z" />
					</svg>
				</button>
				<input
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					aria-label={`Cantidad de ${noun} de ${label}`}
					value={display}
					onChange={(e) => {
						setDraft(e.target.value.replace(/\D/g, ''));
						setFocused(true);
					}}
					onFocus={() => {
						setDraft(String(count));
						setFocused(true);
					}}
					onBlur={commit}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							commit();
							e.currentTarget.blur();
						} else if (e.key === 'ArrowUp') {
							e.preventDefault();
							bump(1);
						} else if (e.key === 'ArrowDown') {
							e.preventDefault();
							bump(-1);
						}
					}}
					className="h-9 w-12 shrink-0 rounded-md border border-slate-300 bg-white text-center text-sm font-semibold tabular-nums text-slate-800 outline-none transition focus:border-brand-bright focus:ring-2 focus:ring-brand-bright/30 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
				/>
				<button
					type="button"
					onClick={() => bump(1)}
					aria-label={`Añadir ${noun} de ${label}`}
					className={btnCls}
				>
					<svg
						className="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M10 5a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 10 5Z" />
					</svg>
				</button>
			</div>
		</li>
	);
}

export function CashBreakdownEditor({
	value,
	onChange,
}: {
	value: CashCounts;
	onChange: (next: CashCounts) => void;
}) {
	const fillId = useId();
	const [fillValue, setFillValue] = useState('');
	const [fillError, setFillError] = useState<string | null>(null);

	const setCount = (denom: number, next: number) => {
		const copy = { ...value };
		if (next <= 0) delete copy[denom];
		else copy[denom] = next;
		onChange(copy);
	};

	const total = computeCashTotal(value);
	const anyUnits = Object.keys(value).length > 0;

	const groupTotal = (list: readonly number[]) =>
		list.reduce((sum, d) => sum + (value[d] ?? 0) * d, 0);
	const groupCount = (list: readonly number[]) =>
		list.reduce((sum, d) => sum + (value[d] ?? 0), 0);
	const billsTotal = groupTotal(BILLS);
	const billsCount = groupCount(BILLS);
	const coinsTotal = groupTotal(COINS);
	const coinsCount = groupCount(COINS);

	const clearAll = () => onChange({});

	const applyFill = () => {
		const cents = parseCentsInput(fillValue);
		if (cents === null || cents <= 0) {
			setFillError('Introduce un importe válido en euros (p. ej. 153,40)');
			return;
		}
		onChange(countsFromValue(cents));
		setFillValue('');
		setFillError(null);
	};

	return (
		<div className="space-y-4">
			<div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
				<label
					htmlFor={fillId}
					className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
				>
					¿Prefieres indicar el total y que se reparta solo?
				</label>
				<div className="flex gap-2">
					<input
						id={fillId}
						className={inputCls}
						value={fillValue}
						onChange={(e) => {
							setFillValue(e.target.value);
							setFillError(null);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								applyFill();
							}
						}}
						inputMode="decimal"
						placeholder="0,00 €"
						aria-label="Importe total en euros para repartir"
					/>
					<Button
						variant="secondary"
						onClick={applyFill}
						disabled={!fillValue.trim()}
						className="shrink-0"
					>
						Rellenar
					</Button>
				</div>
				{fillError && (
					<p className="mt-1 text-xs text-expense dark:text-expense-bright">
						{fillError}
					</p>
				)}
			</div>

			<details className="group rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
				<summary className="flex cursor-pointer select-none list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
					<span className="flex items-center gap-2">
						<svg
							className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90 dark:text-slate-500"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M6.28 5.22a.75.75 0 0 1 0 1.06L2.06 10.5l4.22 4.22a.75.75 0 1 1-1.06 1.06L.72 10.53a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z" />
						</svg>
						Billetes
					</span>
					{billsCount > 0 && (
						<span className="text-xs font-normal tabular-nums text-slate-500 dark:text-slate-400">
							{billsCount} ud. · {formatEUR(billsTotal)}
						</span>
					)}
				</summary>
				<ul className="grid grid-cols-1 gap-2 px-3 pb-3 sm:grid-cols-2">
					{BILLS.map((d) => (
						<DenominationRow
							key={d}
							label={BILL_LABELS[d]}
							denom={d}
							count={value[d] ?? 0}
							onChange={(n) => setCount(d, n)}
						/>
					))}
				</ul>
			</details>

			<details className="group rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
				<summary className="flex cursor-pointer select-none list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 [&::-webkit-details-marker]:hidden">
					<span className="flex items-center gap-2">
						<svg
							className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90 dark:text-slate-500"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M6.28 5.22a.75.75 0 0 1 0 1.06L2.06 10.5l4.22 4.22a.75.75 0 1 1-1.06 1.06L.72 10.53a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z" />
						</svg>
						Monedas
					</span>
					{coinsCount > 0 && (
						<span className="text-xs font-normal tabular-nums text-slate-500 dark:text-slate-400">
							{coinsCount} ud. · {formatEUR(coinsTotal)}
						</span>
					)}
				</summary>
				<ul className="grid grid-cols-1 gap-2 px-3 pb-3 sm:grid-cols-2">
					{COINS.map((d) => (
						<DenominationRow
							key={d}
							label={COIN_LABELS[d]}
							denom={d}
							count={value[d] ?? 0}
							onChange={(n) => setCount(d, n)}
						/>
					))}
				</ul>
			</details>

			<div className="flex items-center justify-between gap-3 rounded-lg bg-brand-soft px-3 py-2.5 dark:bg-brand-soft-dark/40">
				<div className="flex items-center gap-3">
					<span className="text-sm font-medium text-brand-strong dark:text-brand-bright">
						Total
					</span>
					{anyUnits && (
						<button
							type="button"
							onClick={clearAll}
							className="text-xs font-medium text-brand underline-offset-2 hover:underline dark:text-brand-bright"
						>
							Vaciar
						</button>
					)}
				</div>
				<span
					aria-live="polite"
					className="text-base font-bold tabular-nums text-brand-strong dark:text-brand-bright"
				>
					{formatEUR(total)}
				</span>
			</div>
		</div>
	);
}
