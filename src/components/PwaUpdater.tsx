import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

import { Icon } from '@/components/icons';
import { Button } from '@/components/ui';

export function PwaUpdater() {
	const [needRefresh, setNeedRefresh] = useState(false);
	const [offlineReady, setOfflineReady] = useState(false);
	const updateSWRef = useRef<((reload?: boolean) => Promise<void>) | undefined>(
		undefined,
	);

	useEffect(() => {
		const updateSW = registerSW({
			immediate: true,
			onNeedRefresh: () => setNeedRefresh(true),
			onOfflineReady: () => {
				setOfflineReady(true);
				window.setTimeout(() => setOfflineReady(false), 5000);
			},
		});
		updateSWRef.current = updateSW;
	}, []);

	const dismiss = () => {
		setNeedRefresh(false);
		void updateSWRef.current?.(false);
	};

	const reload = async () => {
		setNeedRefresh(false);
		await updateSWRef.current?.(true);
	};

	if (!needRefresh && !offlineReady) return null;

	return (
		<div
			aria-live="polite"
			className="fixed inset-x-0 bottom-16 z-50 flex flex-col gap-2 px-4 lg:bottom-4 lg:inset-x-auto lg:right-4 lg:w-96 lg:px-0"
		>
			{needRefresh && (
				<div className="flex items-center gap-3 rounded-t-(--radius-panel) border-t border-slate-200 bg-white px-4 py-3 text-sm shadow-[0_-8px_24px_rgba(15,23,42,0.08)] animate-[fade-in_200ms_ease-out] lg:rounded-(--radius-panel) lg:border lg:shadow-xl dark:border-slate-800 dark:bg-slate-900">
					<Icon
						name="import"
						className="h-5 w-5 shrink-0 text-brand dark:text-brand-bright"
					/>
					<p className="flex-1 text-slate-700 dark:text-slate-200">
						Hay una nueva versión disponible
					</p>
					<Button onClick={dismiss} variant="ghost" className="px-2 text-xs">
						Después
					</Button>
					<Button onClick={() => void reload()} className="px-3 text-xs">
						Actualizar
					</Button>
				</div>
			)}
			{offlineReady && (
				<div
					role="status"
					className="flex items-center gap-3 rounded-(--radius-panel) bg-brand px-4 py-3 text-sm text-white shadow-xl animate-[fade-in_200ms_ease-out]"
				>
					<Icon name="check" className="h-5 w-5 shrink-0" />
					Ya puedes usarla sin conexión
				</div>
			)}
		</div>
	);
}
