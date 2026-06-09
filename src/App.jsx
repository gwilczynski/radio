import { useEffect, useRef, useState } from 'react'
import { stations } from './data/stations.js'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.29-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14Z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

function RadioIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3.24 6.34 18.5 2l.5 1.91-3.27.93H20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.5c0-.83.5-1.59 1.24-2.16Zm12.76 7.41a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0ZM5 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  )
}

function WaveAnimation({ active }) {
  return (
    <div className={`wave ${active ? 'wave--active' : ''}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}

function StationCard({ station, isCurrent, isPlaying, isLoading, onToggle }) {
  const playing = isCurrent && isPlaying
  const loading = isCurrent && isLoading
  return (
    <article className={`card ${playing ? 'card--playing' : ''}`}>
      <div className="card__art">
        <img src={station.logoUrl} alt="" className="card__logo" />
        <WaveAnimation active={playing} />
      </div>
      <div className="card__body">
        <h2 className="card__title">{station.name}</h2>
      </div>
      <button
        type="button"
        className={`fab ${playing ? 'fab--playing' : ''}`}
        onClick={() => onToggle(station)}
        aria-label={playing ? `Stop ${station.name}` : `Play ${station.name}`}
        aria-pressed={playing}
      >
        {loading ? <span className="spinner" aria-hidden="true" /> : playing ? <StopIcon /> : <PlayIcon />}
      </button>
    </article>
  )
}

function MiniPlayer({ station, isPlaying, isLoading, onToggle }) {
  if (!station) return null
  const label = isLoading ? 'Buffering…' : isPlaying ? 'Now playing' : 'Paused'
  return (
    <div className="mini-player">
      <div className="mini-player__art">
        <img src={station.logoUrl} alt="" className="mini-player__logo" />
      </div>
      <div className="mini-player__meta">
        <span className="mini-player__label">{label}</span>
        <span className="mini-player__title">{station.name}</span>
      </div>
      <button
        type="button"
        className="mini-player__btn"
        onClick={onToggle}
        aria-label={isPlaying ? 'Stop' : 'Play'}
      >
        {isLoading ? <span className="spinner" aria-hidden="true" /> : isPlaying ? <StopIcon /> : <PlayIcon />}
      </button>
    </div>
  )
}

export default function App() {
  const audioRef = useRef(null)
  const [currentId, setCurrentId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  if (audioRef.current === null && typeof Audio !== 'undefined') {
    audioRef.current = new Audio()
    audioRef.current.preload = 'none'
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlaying = () => {
      setIsPlaying(true)
      setIsLoading(false)
    }
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsLoading(true)
    const onError = () => {
      setError('Could not load this station.')
      setIsPlaying(false)
      setIsLoading(false)
    }
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('error', onError)
    }
  }, [])

  const stop = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    setIsPlaying(false)
    setIsLoading(false)
  }

  const play = (station) => {
    const audio = audioRef.current
    if (!audio) return
    setError(null)
    setCurrentId(station.id)
    setIsLoading(true)
    audio.src = station.streamUrl
    const promise = audio.play()
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        setError('Playback was blocked or stream is unavailable.')
        setIsLoading(false)
        setIsPlaying(false)
      })
    }
  }

  const toggle = (station) => {
    if (currentId === station.id && (isPlaying || isLoading)) {
      stop()
      return
    }
    play(station)
  }

  const current = stations.find((s) => s.id === currentId) || null

  const toggleCurrent = () => {
    if (!current) return
    toggle(current)
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <RadioIcon />
          <span>Radio</span>
        </div>
        <p className="app__subtitle">Pick a station and press play.</p>
      </header>

      {error && <div className="banner banner--error" role="alert">{error}</div>}

      <main className="grid">
        {stations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            isCurrent={currentId === station.id}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onToggle={toggle}
          />
        ))}
      </main>

      <MiniPlayer
        station={current}
        isPlaying={isPlaying}
        isLoading={isLoading}
        onToggle={toggleCurrent}
      />
    </div>
  )
}
