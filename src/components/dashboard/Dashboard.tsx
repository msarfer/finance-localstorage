import { useShallow } from 'zustand/react/shallow';
import { Link } from 'wouter';

import { useStore } from '@/store/useStore';
import { summarize, currentMonthISO, monthlyTrend } from '@/lib/reports';
import { formatEUR } from '@/lib/money';
import { monthLabel } from '@/lib/display';
import { useCountUp } from '@/hooks/useCountUp';
import {
	Card,
	Chip,
	EmptyState,
	PageHeader,
	SectionLabel,
} from '@/components/ui';
import { MovementListItem } from '@/components/movements/MovementListItem';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { Icon } from '@/components/icons';

export function Dashboard() {
	const state = useStore(
		useShallow((s) => ({
			accounts: s.accounts,
			movements: s.movements,
			categories: s.categories,
		})),
	);
	const categoryById = new Map(state.categories.map((c) => [c.id, c]));
	const accountName = new Map(state.accounts.map((a) => [a.id, a.name]));

	const month = currentMonthISO();
	const summary = summarize(state, month);
	const trend = monthlyTrend(state, 6);

	const animatedAssets = useCountUp(summary.totalAssets, 700);
	const animatedOnline = useCountUp(summary.totalOnline, 700);
	const animatedCash = useCountUp(summary.totalCash, 700);

	const incomeColor = 'var(--color-income)';
	const expenseColor = 'var(--color-expense)';
	const neutralColor = 'var(--color-brand-bright)';

	const income = summary.monthIncome;
	const expense = summary.monthExpense;
	const flow = income + expense;
	const incomePct = flow > 0 ? (income / flow) * 100 : 50;

	const monthBalancePositive = summary.monthBalance >= 0;

	return (
		<div className="space-y-6">
			<PageHeader title="Resumen" subtitle={monthLabel(month)} />

			<Card className="relative overflow-hidden p-6 sm:p-8">
				<div className="flex flex-wrap items-start justify-between gap-6">
					<div>
						<SectionLabel>Tu patrimonio</SectionLabel>
						<p className="mt-2 font-display text-4xl font-semibold tracking-tight tabular-nums text-slate-900 sm:text-5xl dark:text-white">
							{formatEUR(Math.round(animatedAssets))}
						</p>
						<p className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex flex-col">
							<span className="inline-flex items-center gap-1.5">
								<Icon name="bank" className="h-4 w-4" />
								{formatEUR(Math.round(animatedOnline))}
							</span>
							<span className="inline-flex items-center gap-1.5">
								<Icon name="wallet" className="h-4 w-4" />
								{formatEUR(Math.round(animatedCash))}
							</span>
						</p>
					</div>
				</div>
			</Card>

			<Card className="p-5">
				<div className="flex items-center justify-between">
					<SectionLabel>Balance del mes</SectionLabel>
					<Chip tone="neutral">{monthLabel(month)}</Chip>
				</div>
				<div className="mt-4 grid grid-cols-2 gap-6">
					<div>
						<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
							Ingresos
						</p>
						<p className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums text-income sm:text-3xl dark:text-income-bright">
							+ {formatEUR(income)}
						</p>
					</div>
					<div>
						<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
							Gastos
						</p>
						<p className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums text-expense sm:text-3xl dark:text-expense-bright">
							- {formatEUR(expense)}
						</p>
					</div>
				</div>
				<div className="mt-5 flex h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
					<div
						className="h-full rounded-l-full transition-all"
						style={{ width: `${incomePct}%`, backgroundColor: incomeColor }}
					/>
					<div
						className="h-full rounded-r-full transition-all"
						style={{
							width: `${100 - incomePct}%`,
							backgroundColor: expenseColor,
						}}
					/>
				</div>
				<p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
					Proporción de ingresos y gastos del mes
				</p>
				<div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
					<span className="text-sm font-medium text-slate-500 dark:text-slate-400">
						Neto del mes
					</span>
					<span
						className={`font-display text-3xl font-semibold tracking-tight tabular-nums ${
							monthBalancePositive
								? 'text-income dark:text-income-bright'
								: 'text-expense dark:text-expense-bright'
						}`}
					>
						{monthBalancePositive ? '+' : '−'}
						{formatEUR(Math.abs(summary.monthBalance))}
					</span>
				</div>
			</Card>

			<Card className="p-5">
				<div className="flex items-center justify-between">
					<SectionLabel>Gastos por categoría</SectionLabel>
					<Chip tone="expense">Este mes</Chip>
				</div>
				{summary.byCategory.length === 0 ? (
					<div className="mt-4">
						<EmptyState
							icon="tag"
							title="Sin gastos este mes"
							subtitle="Registra un gasto para verlo desglosado aquí"
						/>
					</div>
				) : (
					<div className="mt-4 space-y-4">
						{summary.byCategory.map(({ categoryId, amount, count }) => {
							const cat = categoryById.get(categoryId);
							const pct =
								summary.monthExpense > 0
									? (amount / summary.monthExpense) * 100
									: 0;
							return (
								<div key={categoryId}>
									<div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
										<span className="flex min-w-0 items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
											{cat?.emoji && <span aria-hidden>{cat.emoji}</span>}
											<span className="truncate">
												{cat?.name ?? 'Sin categoría'}
											</span>
										</span>
										<span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
											{formatEUR(amount)} · {pct.toFixed(0)}%
										</span>
									</div>
									<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
										<div
											className="h-full rounded-full"
											style={{
												width: `${pct}%`,
												backgroundColor: cat?.color ?? neutralColor,
											}}
										/>
									</div>
									{count > 1 && (
										<p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
											{count} movimientos
										</p>
									)}
								</div>
							);
						})}
					</div>
				)}
			</Card>

			<Card>
				<div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
					<SectionLabel>Últimos movimientos</SectionLabel>
					<Link
						href="/movements"
						className="inline-flex items-center gap-1 text-sm font-medium text-brand transition hover:text-brand-bright"
					>
						Ver todos
					</Link>
				</div>
				{summary.recent.length === 0 ? (
					<div className="p-5">
						<EmptyState
							icon="inbox"
							title="Sin movimientos"
							subtitle="Los movimientos que registres aparecerán aquí"
						/>
					</div>
				) : (
					<ul className="divide-y divide-slate-100 dark:divide-slate-800">
						{summary.recent.map((m) => (
							<MovementListItem
								key={m.id}
								movement={m}
								accountName={(id) => (id ? accountName.get(id) : undefined)}
								categoryById={categoryById}
							/>
						))}
					</ul>
				)}
			</Card>
			<Card className="p-5">
				<div className="flex items-center justify-between">
					<SectionLabel>Tendencia 6 meses</SectionLabel>
					<Chip tone="neutral">Ingreso vs gasto</Chip>
				</div>
				<TrendChart points={trend} />
			</Card>
		</div>
	);
}
