import { useRef, useState, useEffect } from 'react'
import './App.css'
import { stations } from './data/stations'

function StationCard({ station, isActive, onSelect }) {
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
      </div>
      <div className="station-info">
        <p className="station-name">{station.name}</p>
      </div>
    </div>
  )
}

function PlayerBar({ station, isPlaying, onPlayPause, onVolumeChange, volume }) {
  if (!station) return null

  return (
    <div className="player-bar">
      <div className="player-thumb">
        <img src={station.logoUrl} alt={station.name} />
      </div>
      <div className="player-meta">
        <p className="player-station-name">{station.name}</p>
      </div>
      <div className="player-controls">
        <button
          className="btn-play-pause"
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span className="volume-icon">🔊</span>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={onVolumeChange}
          aria-label="Volume"
        />
      </div>
    </div>
  )
}

export default function App() {
  const [currentStation, setCurrentStation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const audioRef = useRef(null)

  // Change station: swap src, reload, play
  useEffect(() => {
    if (!currentStation || !audioRef.current) return
    audioRef.current.src = currentStation.streamUrl
    audioRef.current.load()
    audioRef.current.play().catch(() => {})
  }, [currentStation])

  // Toggle play/pause without reloading stream
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

  function handleVolumeChange(e) {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  return (
    <>
      <audio ref={audioRef} />

      <header className="app-header">
        <h1>Radio</h1>
      </header>

      <main className="app-main container-fluid">
        <div className="row g-3">
          {stations.map(station => (
            <div key={station.id} className="col-12 col-sm-6 col-md-4">
              <StationCard
                station={station}
                isActive={currentStation?.id === station.id}
                onSelect={handleSelectStation}
              />
            </div>
          ))}
        </div>
      </main>

      <PlayerBar
        station={currentStation}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onVolumeChange={handleVolumeChange}
        volume={volume}
      />
    </>
  )
}
