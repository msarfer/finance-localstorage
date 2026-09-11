import { useEffect } from 'react'

import { useStore } from '../store/useStore'

function systemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme() {
  const theme = useStore((s) => s.settings.theme)
  const updateSettings = useStore((s) => s.updateSettings)

  const setTheme = (t: 'light' | 'dark' | 'system') => updateSettings({ theme: t })

  useEffect(() => {
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && systemDark())
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])

  return { theme, setTheme }
}