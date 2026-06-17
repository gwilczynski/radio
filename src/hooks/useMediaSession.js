import { useEffect } from 'react'

// Wires the OS media session (lock-screen / headphone controls) to the player:
// action handlers, track metadata, and playback state.
export function useMediaSession({ station, isPlaying, onPlay, onPause, onNext, onPrev }) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    ms.setActionHandler('play', onPlay)
    ms.setActionHandler('pause', onPause)
    ms.setActionHandler('previoustrack', onPrev)
    ms.setActionHandler('nexttrack', onNext)
    return () => {
      ms.setActionHandler('play', null)
      ms.setActionHandler('pause', null)
      ms.setActionHandler('previoustrack', null)
      ms.setActionHandler('nexttrack', null)
    }
  }, [onPlay, onPause, onNext, onPrev])

  useEffect(() => {
    if (!('mediaSession' in navigator) || !('MediaMetadata' in window)) return
    navigator.mediaSession.metadata = station
      ? new MediaMetadata({
          title: station.name,
          artist: 'Lunarem Radio',
          artwork: [{ src: station.logoUrl }],
        })
      : null
  }, [station])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = station
      ? (isPlaying ? 'playing' : 'paused')
      : 'none'
  }, [station, isPlaying])
}
