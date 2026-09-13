import type { ColorThemeId } from '@/types'

export const COLOR_THEMES: { id: ColorThemeId; label: string }[] = [
  { id: 'banca', label: 'Banca' },
  { id: 'oceano', label: 'Océano' },
  { id: 'uva', label: 'Uva' },
  { id: 'atardecer', label: 'Atardecer' },
]

export const DEFAULT_COLOR_THEME: ColorThemeId = 'banca'

const COLOR_THEME_IDS = new Set<ColorThemeId>(COLOR_THEMES.map((t) => t.id))

export function isColorTheme(value: unknown): value is ColorThemeId {
  return typeof value === 'string' && COLOR_THEME_IDS.has(value as ColorThemeId)
}