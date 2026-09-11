import type { Category } from '@/types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-nomina', name: 'Nómina / Sueldo', emoji: '💼', color: '#10b981', type: 'income' },
  { id: 'cat-otros-ingresos', name: 'Otros ingresos', emoji: '💰', color: '#0ea5e9', type: 'income' },
  { id: 'cat-supermercado', name: 'Supermercado', emoji: '🛒', color: '#f59e0b', type: 'expense' },
  { id: 'cat-restaurantes', name: 'Restaurantes y bares', emoji: '🍽️', color: '#ec4899', type: 'expense' },
  { id: 'cat-transporte', name: 'Transporte', emoji: '🚌', color: '#6366f1', type: 'expense' },
  { id: 'cat-vivienda', name: 'Vivienda', emoji: '🏠', color: '#8b5cf6', type: 'expense' },
  { id: 'cat-servicios', name: 'Servicios (luz, agua, internet)', emoji: '💡', color: '#f97316', type: 'expense' },
  { id: 'cat-salud', name: 'Salud', emoji: '🩺', color: '#ef4444', type: 'expense' },
  { id: 'cat-educacion', name: 'Educación', emoji: '📚', color: '#14b8a6', type: 'expense' },
  { id: 'cat-ocio', name: 'Ocio y suscripciones', emoji: '🎬', color: '#84cc16', type: 'expense' },
  { id: 'cat-ahorro', name: 'Ahorro / Inversión', emoji: '🏦', color: '#10b981', type: 'both' },
  { id: 'cat-otros-gastos', name: 'Otros gastos', emoji: '📦', color: '#64748b', type: 'expense' },
]