import lunaremLogo from '../assets/lunarem_radio_light.svg'
import SettingsPopover from './SettingsPopover.jsx'

export default function AppBar({ theme, onThemeChange }) {
  return (
    <header className="app-bar">
      <img src={lunaremLogo} alt="Lunarem Radio" className="app-bar__logo" />
      <h1 className="app-bar__title">Lunarem Radio</h1>
      <SettingsPopover theme={theme} onThemeChange={onThemeChange} />
    </header>
  )
}
