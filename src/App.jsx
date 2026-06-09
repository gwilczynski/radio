import { useRef, useState, useEffect } from 'react'
import './App.css'
import nsLogo from './assets/ns.webp'
import lunaremLogo from './assets/lunarem_radio_light.svg'

const station = {
  name: 'Radio Nowy Świat',
  logoUrl: nsLogo,
  streamUrl: 'https://stream.rcs.revma.com/ypqt40u0x1zuv',
}

function WaveAnimation() {
  return (
    <div className="wave" aria-hidden="true">
      <span /><span /><span /><span />
    </div>
  )
}

function IconPlay() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function IconPause() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

export default function App() {
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
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      if (!audio.src) {
        audio.src = station.streamUrl
        audio.load()
      }
      audio.play().catch(() => {})
    } else {
      audio.pause()
      clearTimeout(retryTimeoutRef.current)
    }
  }, [isPlaying])

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
        <div className="player">
          <div className={`player__art${isPlaying ? ' player__art--playing' : ''}`}>
            <img src={station.logoUrl} alt={station.name} />
            {isPlaying && (
              <div className="player__art-overlay">
                <WaveAnimation />
              </div>
            )}
          </div>

          <div className="player__meta">
            <p className="player__name">{station.name}</p>
            <p className="player__status">{isPlaying ? 'Live stream' : 'Paused'}</p>
          </div>

          <button
            className="fab fab--large"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
        </div>
      </main>
    </>
  )
}
