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
        <img src={station.logoUrl} alt={station.name} />
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

function IconSkipPrev() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
    </svg>
  )
}

function IconSkipNext() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
    </svg>
  )
}

function MiniPlayer({ station, isPlaying, onPlayPause, visible, onPrev, onNext }) {
  if (!station) return null

  return (
    <div className={`mini-player${visible ? ' mini-player--visible' : ' mini-player--hidden'}`}>
      <div className="mini-player__thumb">
        <img src={station.logoUrl} alt={station.name} />
      </div>
      <div className="mini-player__meta">
        <p className="mini-player__name">{station.name}</p>
        <p className="mini-player__status">{isPlaying ? 'Live' : 'Paused'}</p>
      </div>
      {isPlaying && <WaveAnimation />}
      <div className="mini-player__controls">
        <button className="mini-player-nav-btn" onClick={onPrev} aria-label="Previous station">
          <IconSkipPrev />
        </button>
        <button
          className="fab"
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <IconPause /> : <IconPlay />}
        </button>
        <button className="mini-player-nav-btn" onClick={onNext} aria-label="Next station">
          <IconSkipNext />
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [currentStation, setCurrentStation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
const audioRef = useRef(null)

  useEffect(() => {
    if (!currentStation || !audioRef.current) return
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

  useEffect(() => {
    if (!currentStation) return
    function handleKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft' || e.key === 'MediaTrackPrevious') {
        const idx = stations.findIndex(s => s.id === currentStation.id)
        setCurrentStation(stations[(idx - 1 + stations.length) % stations.length])
        setIsPlaying(true)
      } else if (e.key === 'ArrowRight' || e.key === 'MediaTrackNext') {
        const idx = stations.findIndex(s => s.id === currentStation.id)
        setCurrentStation(stations[(idx + 1) % stations.length])
        setIsPlaying(true)
      } else if (e.key === ' ' || e.key === 'MediaPlayPause') {
        e.preventDefault()
        setIsPlaying(p => !p)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStation])

  function handlePrevStation() {
    const idx = stations.findIndex(s => s.id === currentStation?.id)
    const prev = stations[(idx - 1 + stations.length) % stations.length]
    setCurrentStation(prev)
    setIsPlaying(true)
  }

  function handleNextStation() {
    const idx = stations.findIndex(s => s.id === currentStation?.id)
    const next = stations[(idx + 1) % stations.length]
    setCurrentStation(next)
    setIsPlaying(true)
  }

  return (
    <>
      <audio ref={audioRef} />

      <header className="app-bar">
        <img src={lunaremLogo} alt="Lunarem Radio" className="app-bar__logo" />
        <h1 className="app-bar__title">Lunarem Radio</h1>
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
        onPrev={handlePrevStation}
        onNext={handleNextStation}
      />
    </>
  )
}
