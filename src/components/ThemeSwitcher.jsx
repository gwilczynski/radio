import { THEMES } from '../constants/themes.js'

export default function ThemeSwitcher({ theme, onChange }) {
  return (
    <div className="theme-switcher" role="group" aria-label="Color theme">
      {THEMES.map(t => (
        <button
          key={t.id}
          type="button"
          className="theme-switcher__option"
          aria-pressed={theme === t.id}
          onClick={() => onChange(t.id)}
        >
          <span className={`theme-switcher__swatch theme-switcher__swatch--${t.id}`} aria-hidden="true" />
          <span className="theme-switcher__label">{t.name}</span>
        </button>
      ))}
    </div>
  )
}
