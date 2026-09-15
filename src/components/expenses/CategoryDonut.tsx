import { useEffect, useRef, useState } from 'react'

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

const hoverMQL =
	typeof window !== 'undefined' ? window.matchMedia('(hover: hover) and (pointer: fine)') : null

export function CategoryDonut({ slices }: { slices: DonutSlice[] }) {
	const arcs = buildArcs(slices)
	const total = slices.reduce((s, el) => s + el.amount, 0)
	const label = formatEUR(Math.round(total))
	const fontSize = Math.min(20, Math.max(10, Math.floor(78 / (0.58 * label.length))))

	const svgRef = useRef<SVGSVGElement>(null)
	const [hoverOk, setHoverOk] = useState(() => hoverMQL?.matches ?? false)
	const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null)

	useEffect(() => {
		if (!hoverMQL) return
		const onChange = () => { setHoverOk(hoverMQL.matches) }
		hoverMQL.addEventListener('change', onChange)
		return () => hoverMQL.removeEventListener('change', onChange)
	}, [])

	const updatePos = (e: React.MouseEvent) => {
		if (!svgRef.current || hover === null) return
		const rect = svgRef.current.getBoundingClientRect()
		setHover({ ...hover, x: e.clientX - rect.left, y: e.clientY - rect.top })
	}

	return (
		<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
			<div className="relative shrink-0">
				<svg
					ref={svgRef}
					viewBox="0 0 160 160"
					className="h-40 w-40 sm:h-48 sm:w-48"
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
					{arcs.map((a, i) => (
						<g
							key={a.label}
							onMouseEnter={() => { if (hoverOk) setHover({ i, x: 80, y: 80 }) }}
							onMouseMove={(e) => { if (hoverOk) updatePos(e) }}
							onMouseLeave={() => setHover(null)}
							className={hoverOk ? 'cursor-pointer' : ''}
						>
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
						pointerEvents="none"
						className="fill-slate-900 dark:fill-white"
						style={{ fontSize: `${fontSize}px`, fontWeight: 600, fontFamily: 'var(--font-display)' }}
					>
						{label}
					</text>
				</svg>

				{hover !== null && slices[hover.i] && (
					<div
						style={{
							left: hover.x,
							top: hover.y,
							transform: 'translate(-50%, -100%) translateY(-8px)',
							pointerEvents: 'none',
						}}
						className="absolute z-20 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-slate-700"
					>
						<span className="font-semibold">{slices[hover.i].label}</span>
						<span className="ml-2 tabular-nums">{formatEUR(slices[hover.i].amount)}</span>
					</div>
				)}
			</div>

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