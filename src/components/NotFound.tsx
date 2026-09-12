import { useLocation } from 'wouter';

import { Icon } from '@/components/icons';
import { Button } from '@/components/ui';

export function NotFound() {
	const [, navigate] = useLocation();

	return (
		<div className="flex flex-col items-center justify-center py-20 text-center">
			<span className="mb-4 flex h-14 w-14 items-center justify-center rounded-(--radius-panel) bg-expense-soft text-expense dark:bg-expense-soft-dark/60 dark:text-expense-bright">
				<Icon name="alert" className="h-7 w-7" />
			</span>
			<p className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
				404
			</p>
			<p className="mt-2 text-slate-500 dark:text-slate-400">
				La página que buscas no existe.
			</p>
			<div className="mt-6 flex gap-2">
				<Button onClick={() => navigate('/')} icon="dashboard">
					Ir al resumen
				</Button>
				<Button variant="secondary" onClick={() => navigate('/accounts')}>
					Ver cuentas
				</Button>
			</div>
		</div>
	);
}