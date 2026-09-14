import { useEffect } from 'react'

function lockPortrait() {
  try {
    if ('orientation' in screen && screen.orientation?.lock) {
      void screen.orientation.lock('portrait').catch(() => {})
    }
  } catch {
    /* sin soporte */
  }
}

export function usePortraitLock() {
  useEffect(() => {
    const so = 'orientation' in screen ? screen.orientation : null
    if (!so?.lock) return

    const retry = () => window.setTimeout(lockPortrait, 0)

    lockPortrait()
    so.addEventListener('change', retry)
    window.addEventListener('orientationchange', retry)
    window.addEventListener('focus', retry)

    return () => {
      so.removeEventListener('change', retry)
      window.removeEventListener('orientationchange', retry)
      window.removeEventListener('focus', retry)
    }
  }, [])
}