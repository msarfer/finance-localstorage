import { useState } from 'react';

import type { Category, CategoryType } from '@/types';
import { CATEGORY_COLORS } from '@/data/constants';
import { useStore } from '@/store/useStore';
import {
	Button,
	Field,
	Modal,
	inputCls,
	ConfirmDialog,
	ColorPalette,
} from '@/components/ui';

function CategoryFormModal({
	initial,
	onClose,
}: {
	initial?: Category;
	onClose: () => void;
}) {
	const addCategory = useStore((s) => s.addCategory);
	const updateCategory = useStore((s) => s.updateCategory);

	const [name, setName] = useState(initial?.name ?? '');
	const [emoji, setEmoji] = useState(initial?.emoji ?? '');
	const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0]);
	const [type, setType] = useState<CategoryType>(initial?.type ?? 'expense');
	const [error, setError] = useState<string | null>(null);

	const submit = () => {
		if (!name.trim()) {
			setError('El nombre es obligatorio');
			return;
		}
		const payload = {
			name: name.trim(),
			emoji: emoji.trim() || undefined,
			color,
			type,
		};
		if (initial) updateCategory(initial.id, payload);
		else addCategory(payload);
		onClose();
	};

	return (
		<Modal
			title={initial ? 'Editar categoría' : 'Nueva categoría'}
			onClose={onClose}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancelar
					</Button>
					<Button onClick={submit}>
						{initial ? 'Guardar cambios' : 'Crear categoría'}
					</Button>
				</>
			}
		>
			<div className="space-y-4 p-2">
				<div className="grid grid-cols-[1fr_auto] gap-3">
					<Field label="Nombre">
						<input
							className={inputCls}
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Ej. Gimnasio"
						/>
					</Field>
					<Field label="Emoji">
						<input
							className={`${inputCls} w-20 text-center`}
							value={emoji}
							onChange={(e) => setEmoji(e.target.value)}
							placeholder="🏋️"
						/>
					</Field>
				</div>
				<Field label="Tipo">
					<select
						className={inputCls}
						value={type}
						onChange={(e) => setType(e.target.value as CategoryType)}
					>
						<option value="expense">Gasto</option>
						<option value="income">Ingreso</option>
						<option value="both">Ambos</option>
					</select>
				</Field>
				<Field label="Color">
					<ColorPalette
						value={color}
						onChange={setColor}
						colors={CATEGORY_COLORS}
					/>
				</Field>
				{error && (
					<p className="text-sm text-expense dark:text-expense-bright">{error}</p>
				)}
			</div>
		</Modal>
	);
}

export function CategoriesView() {
	const categories = useStore((s) => s.categories);
	const deleteCategory = useStore((s) => s.deleteCategory);
	const movements = useStore((s) => s.movements);

	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<Category | null>(null);
	const [deleting, setDeleting] = useState<Category | null>(null);

	const typeLabel = (t: CategoryType) =>
		t === 'income' ? 'Ingreso' : t === 'expense' ? 'Gasto' : 'Ambos';

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Categorías</h1>
				<Button
					onClick={() => {
						setEditing(null);
						setFormOpen(true);
					}}
				>
					+ Nueva categoría
				</Button>
			</div>

			{categories.length === 0 ? (
				<div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
					No hay categorías. Crea la primera.
				</div>
			) : (
				<div className="grid gap-2 sm:grid-cols-2">
					{categories.map((c) => {
						const used = movements.filter((m) => m.categoryId === c.id).length;
						return (
							<div
								key={c.id}
								className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
							>
								<span
									className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
									style={{ backgroundColor: `${c.color}22` }}
								>
									{c.emoji ?? '🏷️'}
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{c.name}</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{typeLabel(c.type)} · {used} movimiento
										{used === 1 ? '' : 's'}
									</p>
								</div>
								<button
									type="button"
									onClick={() => {
										setEditing(c);
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
									onClick={() => setDeleting(c)}
									className="rounded-md p-1.5 text-slate-400 hover:bg-expense-soft hover:text-expense dark:hover:bg-expense-soft-dark/40"
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
						);
					})}
				</div>
			)}

			{formOpen && (
				<CategoryFormModal
					key={editing?.id ?? 'new'}
					initial={editing ?? undefined}
					onClose={() => setFormOpen(false)}
				/>
			)}

			{deleting && (
				<ConfirmDialog
					title="Eliminar categoría"
					message={
						movements.some((m) => m.categoryId === deleting.id)
							? `La categoría "${deleting.name}" está en uso en movimientos y no se puede eliminar.`
							: `¿Eliminar la categoría "${deleting.name}"?`
					}
					confirmLabel="Eliminar"
					onCancel={() => setDeleting(null)}
					onConfirm={() => {
						deleteCategory(deleting.id);
						setDeleting(null);
					}}
				/>
			)}
		</div>
	);
}
