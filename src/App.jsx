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

function MiniPlayer({ station, isPlaying, onPlayPause, visible }) {
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

export default function App() {
  const [currentStation, setCurrentStation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const retryTimeoutRef = useRef(null)

  function retryPlayback() {
    const audio = audioRef.current
    if (!audio || !isPlaying) return
    audio.src = audio.src
    audio.load()
    audio.play().catch(() => {})
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function handleError() {
      if (!isPlaying) return
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = setTimeout(retryPlayback, 2000)
    }

    function handleStalled() {
      if (!isPlaying) return
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = setTimeout(retryPlayback, 3000)
    }

    audio.addEventListener('error', handleError)
    audio.addEventListener('stalled', handleStalled)
    return () => {
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('stalled', handleStalled)
      clearTimeout(retryTimeoutRef.current)
    }
  }, [isPlaying])

  useEffect(() => {
    function handleOnline() {
      if (isPlaying && audioRef.current) {
        setTimeout(retryPlayback, 1000)
      }
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [isPlaying])

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
      clearTimeout(retryTimeoutRef.current)
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
      />
    </>
  )
}
