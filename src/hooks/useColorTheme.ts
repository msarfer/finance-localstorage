import { useEffect } from 'react'

import type { ColorThemeId } from '@/types'
import { useStore } from '@/store/useStore'

export function useColorTheme() {
  const colorTheme = useStore((s) => s.settings.colorTheme)
  const updateSettings = useStore((s) => s.updateSettings)

  useEffect(() => {
    document.documentElement.dataset.theme = colorTheme
  }, [colorTheme])

  const setColorTheme = (t: ColorThemeId) => updateSettings({ colorTheme: t })

  return { colorTheme, setColorTheme }
}