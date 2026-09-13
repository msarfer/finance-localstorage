import { useState } from 'react';

import type { Category, CategoryType } from '@/types';
import { CATEGORY_COLORS } from '@/data/constants';
import { useStore } from '@/store/useStore';
import {
	Button,
	Card,
	ConfirmDialog,
	EmptyState,
	Field,
	IconButton,
	Modal,
	inputCls,
	ColorPalette,
	PageHeader,
} from '@/components/ui';
import { Icon } from '@/components/icons';

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
						<div className="relative w-20">
							<input
								className={`${inputCls} w-full text-center`}
								value={emoji}
								onChange={(e) => setEmoji(e.target.value)}
								aria-label="Emoji de la categoría"
							/>
							{!emoji && (
								<span className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500">
									<Icon name="smile" className="h-5 w-5" />
								</span>
							)}
						</div>
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
					<p
						role="alert"
						className="text-sm text-expense dark:text-expense-bright"
					>
						{error}
					</p>
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
		<div className="space-y-6">
			<PageHeader
				title="Categorías"
				subtitle={
					categories.length === 0
						? undefined
						: `${categories.length} categoría${categories.length === 1 ? '' : 's'}`
				}
				action={
					<Button
						icon="plus"
						onClick={() => {
							setEditing(null);
							setFormOpen(true);
						}}
					>
						Nueva categoría
					</Button>
				}
			/>

			{categories.length === 0 ? (
				<EmptyState
					icon="tag"
					title="No hay categorías todavía"
					subtitle="Crea tu primera categoría para organizar tus movimientos"
					action={
						<Button
							icon="plus"
							onClick={() => {
								setEditing(null);
								setFormOpen(true);
							}}
						>
							Nueva categoría
						</Button>
					}
				/>
			) : (
				<div className="grid gap-3 sm:grid-cols-2">
					{categories.map((c) => {
						const used = movements.filter((m) => m.categoryId === c.id).length;
						return (
							<Card key={c.id} className="flex items-center gap-3 px-4 py-3">
								<span
									className="flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-inner) text-base"
									style={{
										backgroundColor: `color-mix(in srgb, ${c.color} 15%, transparent)`,
									}}
								>
									{c.emoji ?? '🏷️'}
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
										{c.name}
									</p>
									<p className="text-xs text-slate-500 dark:text-slate-400">
										{typeLabel(c.type)} · {used} movimiento
										{used === 1 ? '' : 's'}
									</p>
								</div>
								<IconButton
									onClick={() => {
										setEditing(c);
										setFormOpen(true);
									}}
									title="Editar"
								/>
								<IconButton
									onClick={() => setDeleting(c)}
									title="Eliminar"
									icon="trash"
									className="hover:bg-expense-soft hover:text-expense dark:hover:bg-expense-soft-dark/40"
								/>
							</Card>
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
