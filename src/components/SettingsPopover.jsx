import { memo, useEffect, useRef, useState } from 'react'
import IconSettings from './icons/IconSettings.jsx'
import ThemeSwitcher from './ThemeSwitcher.jsx'

const SettingsPopover = memo(function SettingsPopover({ theme, onThemeChange }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleDocClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleDocClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleDocClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="settings" ref={containerRef}>
      <button
        type="button"
        className="settings__trigger"
        aria-label="Settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <IconSettings />
      </button>
      {open && (
        <div className="settings__popover" role="dialog" aria-label="Settings">
          <p className="settings__label">Theme</p>
          <ThemeSwitcher theme={theme} onChange={onThemeChange} />
        </div>
      )}
    </div>
  )
})

export default SettingsPopover
