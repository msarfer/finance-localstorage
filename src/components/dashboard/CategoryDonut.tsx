import { formatEUR } from '@/lib/money'

export interface DonutSlice {
	label: string
	amount: number
	pct: number
	color: string
}

const R = 56
const STROKE = 26
const C = 2 * Math.PI * R
const MIN_ARC = 4

function buildArcs(slices: DonutSlice[]) {
	let cum = 0
	return slices.map((s) => {
		const raw = (s.amount / (slices.reduce((a, b) => a + b.amount, 0) || 1)) * C
		const arc = Math.max(MIN_ARC, raw)
		const offset = -cum
		cum += arc
		return { ...s, arc, offset }
	})
}

export function CategoryDonut({ slices, total }: { slices: DonutSlice[]; total: number }) {
	const arcs = buildArcs(slices)
	const label = formatEUR(Math.round(total))
	const fontSize = Math.min(20, Math.max(10, Math.floor(78 / (0.58 * label.length))))

	return (
		<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
			<svg
				viewBox="0 0 160 160"
				className="h-40 w-40 shrink-0 sm:h-48 sm:w-48"
				role="img"
				aria-label={slices
					.map((s) => `${s.label}: ${formatEUR(s.amount)}, ${s.pct.toFixed(0)}%`)
					.join('. ')}
			>
				<circle
					cx="80"
					cy="80"
					r={R}
					fill="none"
					stroke="currentColor"
					strokeWidth={STROKE}
					className="text-slate-100 dark:text-slate-800"
				/>
				{arcs.map((a) => (
					<g key={a.label}>
						<title>{`${a.label}: ${formatEUR(a.amount)} (${a.pct.toFixed(0)}%)`}</title>
						<circle
							cx="80"
							cy="80"
							r={R}
							fill="none"
							stroke={a.color}
							strokeWidth={STROKE}
							strokeDasharray={`${a.arc} ${C - a.arc}`}
							strokeDashoffset={a.offset}
							transform="rotate(-90 80 80)"
						/>
					</g>
				))}
<text
					x="80"
					y="80"
					textAnchor="middle"
					dominantBaseline="central"
					className="fill-slate-900 dark:fill-white"
					style={{ fontSize: `${fontSize}px`, fontWeight: 600, fontFamily: 'var(--font-display)' }}
				>
					{label}
				</text>
			</svg>

			<ul className="min-w-0 flex-1 space-y-2">
				{slices.map((s) => (
					<li key={s.label} className="flex items-center justify-between gap-3 text-sm">
						<span className="flex min-w-0 items-center gap-2">
							<span
								className="h-2.5 w-2.5 shrink-0 rounded-full"
								style={{ backgroundColor: s.color }}
							/>
							<span className="truncate text-slate-700 dark:text-slate-200">
								{s.label}
							</span>
						</span>
						<span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
							{formatEUR(s.amount)} · {s.pct.toFixed(0)}%
						</span>
					</li>
				))}
			</ul>
		</div>
	)
}