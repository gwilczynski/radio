import { memo } from 'react'
import WaveAnimation from './WaveAnimation.jsx'
import IconPlay from './icons/IconPlay.jsx'
import IconPause from './icons/IconPause.jsx'

const MiniPlayer = memo(function MiniPlayer({ station, isPlaying, onPlayPause, visible }) {
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
})

export default MiniPlayer
