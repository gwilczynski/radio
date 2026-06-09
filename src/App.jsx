import { useRef, useState, useEffect } from 'react'
import './App.css'
import { stations } from './data/stations.js'
import lunaremLogo from './assets/lunarem_radio_light.svg'

function WaveAnimation() {
  return (
    <div className="wave" aria-hidden="true">
      <span /><span /><span /><span />
    </div>
  )
}

function IconPlay() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function IconPause() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.14 12.94a7.43 7.43 0 0 0 .05-.94 7.43 7.43 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.66 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.43 7.43 0 0 0-.05.94c0 .32.02.63.05.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96c.49.39 1.03.7 1.62.94l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
    </svg>
  )
}


function StationCard({ station, isActive, isPlaying, onSelect }) {
  return (
    <div
      className={`station-card${isActive ? ' active' : ''}`}
      onClick={() => onSelect(station)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(station)}
      aria-label={`Play ${station.name}`}
    >
      <div className="station-thumb">
        <img src={station.logoUrl} alt={station.name} loading="lazy" decoding="async" />
        {isPlaying && (
          <div className="station-thumb__overlay">
            <WaveAnimation />
          </div>
        )}
      </div>
      <div className="station-info">
        <p className="station-name">{station.name}</p>
      </div>
    </div>
  )
}

const THEMES = ['a', 'b', 'c', 'd']

function ThemeSwitcher({ theme, onChange }) {
  return (
    <div className="theme-switcher" role="group" aria-label="Color theme">
      {THEMES.map(t => (
        <button
          key={t}
          type="button"
          className={`theme-switcher__swatch theme-switcher__swatch--${t}`}
          aria-label={`Theme ${t.toUpperCase()}`}
          aria-pressed={theme === t}
          onClick={() => onChange(t)}
        />
      ))}
    </div>
  )
}

function SettingsPopover({ theme, onThemeChange }) {
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
}

function MiniPlayer({ station, isPlaying, onPlayPause, visible }) {
  if (!station) return null

  return (
    <div className={`mini-player${visible ? ' mini-player--visible' : ' mini-player--hidden'}`}>
      <div className="mini-player__thumb">
        <img src={station.logoUrl} alt={station.name} loading="lazy" decoding="async" />
      </div>
      <div className="mini-player__meta">
        <p className="mini-player__name">{station.name}</p>
        <p className="mini-player__status">{isPlaying ? 'Live' : 'Paused'}</p>
      </div>
      {isPlaying && <WaveAnimation />}
      <div className="mini-player__controls">
        <button
          className="fab"
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <IconPause /> : <IconPlay />}
        </button>
      </div>
    </div>
  )
}

const MAX_RETRIES = 5
const MAX_BACKOFF_MS = 30000

export default function App() {
  const [currentStation, setCurrentStation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem('theme')
    return THEMES.includes(stored) ? stored : 'b'
  })
  const audioRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const retryCountRef = useRef(0)
  const isPlayingRef = useRef(false)
  const currentStationRef = useRef(null)
  const handlersRef = useRef({ handleNext: () => {}, handlePrev: () => {} })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    currentStationRef.current = currentStation
  }, [currentStation])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function retry() {
      if (!isPlayingRef.current || retryCountRef.current >= MAX_RETRIES) return
      retryCountRef.current += 1
      audio.load()
      audio.play().catch(() => {})
    }

    function schedule(baseMs) {
      if (!isPlayingRef.current || retryCountRef.current >= MAX_RETRIES) return
      clearTimeout(retryTimeoutRef.current)
      const delay = Math.min(baseMs * 2 ** retryCountRef.current, MAX_BACKOFF_MS)
      retryTimeoutRef.current = setTimeout(retry, delay)
    }

    const handleError = () => schedule(2000)
    const handleStalled = () => schedule(3000)
    const handlePlaying = () => { retryCountRef.current = 0 }
    const handleOnline = () => schedule(1000)
    const handleNativePlay = () => setIsPlaying(true)
    const handleNativePause = () => setIsPlaying(false)

    audio.addEventListener('error', handleError)
    audio.addEventListener('stalled', handleStalled)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('play', handleNativePlay)
    audio.addEventListener('pause', handleNativePause)
    window.addEventListener('online', handleOnline)
    return () => {
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('stalled', handleStalled)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('play', handleNativePlay)
      audio.removeEventListener('pause', handleNativePause)
      window.removeEventListener('online', handleOnline)
      clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!currentStation || !audioRef.current) return
    retryCountRef.current = 0
    audioRef.current.src = currentStation.streamUrl
    audioRef.current.load()
    audioRef.current.play().catch(() => {})
  }, [currentStation])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
      clearTimeout(retryTimeoutRef.current)
      retryCountRef.current = 0
    }
  }, [isPlaying])

  function handleSelectStation(station) {
    if (station.id === currentStation?.id) {
      setIsPlaying(p => !p)
    } else {
      setCurrentStation(station)
      setIsPlaying(true)
    }
  }

  function handlePlayPause() {
    setIsPlaying(p => !p)
  }

  function handleNext() {
    const cur = currentStationRef.current
    const i = cur ? stations.findIndex(s => s.id === cur.id) : -1
    const next = stations[(i + 1 + stations.length) % stations.length]
    handleSelectStation(next)
  }

  function handlePrev() {
    const cur = currentStationRef.current
    const i = cur ? stations.findIndex(s => s.id === cur.id) : 0
    const prev = stations[(i - 1 + stations.length) % stations.length]
    handleSelectStation(prev)
  }

  useEffect(() => {
    handlersRef.current = { handleNext, handlePrev }
  })

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    ms.setActionHandler('play', () => setIsPlaying(true))
    ms.setActionHandler('pause', () => setIsPlaying(false))
    ms.setActionHandler('previoustrack', () => handlersRef.current.handlePrev())
    ms.setActionHandler('nexttrack', () => handlersRef.current.handleNext())
    return () => {
      ms.setActionHandler('play', null)
      ms.setActionHandler('pause', null)
      ms.setActionHandler('previoustrack', null)
      ms.setActionHandler('nexttrack', null)
    }
  }, [])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    if (currentStation) {
      ms.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: 'Lunarem Radio',
        artwork: [{ src: currentStation.logoUrl }],
      })
      ms.playbackState = isPlaying ? 'playing' : 'paused'
    } else {
      ms.metadata = null
      ms.playbackState = 'none'
    }
  }, [currentStation, isPlaying])

  return (
    <>
      <audio ref={audioRef} preload="none" />

      <header className="app-bar">
        <img src={lunaremLogo} alt="Lunarem Radio" className="app-bar__logo" />
        <h1 className="app-bar__title">Lunarem Radio</h1>
        <SettingsPopover theme={theme} onThemeChange={setTheme} />
      </header>

      <main className="app-main">
        <div className="station-grid">
          {stations.map(station => (
            <StationCard
              key={station.id}
              station={station}
              isActive={currentStation?.id === station.id}
              isPlaying={currentStation?.id === station.id && isPlaying}
              onSelect={handleSelectStation}
            />
          ))}
        </div>
      </main>

      <MiniPlayer
        station={currentStation}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        visible={!!currentStation}
      />
    </>
  )
}
