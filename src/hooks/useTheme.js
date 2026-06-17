import { useEffect, useState } from 'react'
import { DEFAULT_THEME, THEME_IDS } from '../constants/themes.js'

// Theme id state, persisted to localStorage and mirrored onto the
// <html data-theme> attribute that the CSS token system keys off.
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('theme')
    return THEME_IDS.includes(stored) ? stored : DEFAULT_THEME
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return [theme, setTheme]
}
