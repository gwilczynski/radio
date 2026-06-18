import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_BACKOFF_MS = 30000

// Owns the single <audio> element (via the returned ref) and all playback
// state: which station is selected, whether it is playing, and the
// error/stall/reconnect recovery loop. Pass the station list so next/prev can
// cycle through it.
export function useAudioPlayer(stations) {
  const [currentStation, setCurrentStation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const retryCountRef = useRef(0)
  const isPlayingRef = useRef(false)
  const currentStationRef = useRef(null)
  // True while we are programmatically swapping the stream (src/load/play).
  // load() fires a native `pause` event we must ignore, or the UI flickers
  // Live→Paused→Live on station change.
  const transitioningRef = useRef(false)

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    currentStationRef.current = currentStation
  }, [currentStation])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Reload the stream and resume. Used for both error/stall recovery and
    // the "network/app is back" signals. The retry counter only drives the
    // backoff delay — it never stops us from trying while the user wants audio.
    function retry() {
      if (!isPlayingRef.current) return
      retryCountRef.current += 1
      transitioningRef.current = true   // load() fires a native `pause`; don't let
      audio.load()                      // handleNativePause mistake it for a real pause
      audio.play().catch(() => {})
    }

    function schedule(baseMs) {
      if (!isPlayingRef.current) return
      clearTimeout(retryTimeoutRef.current)
      const delay = Math.min(baseMs * 2 ** retryCountRef.current, MAX_BACKOFF_MS)
      retryTimeoutRef.current = setTimeout(retry, delay)
    }

    // Strong "connection should be available again" signals: retry promptly and
    // reset the backoff so we don't sit in a 30s wait after a brief AP switch.
    function reconnect() {
      if (!isPlayingRef.current) return
      retryCountRef.current = 0
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = setTimeout(retry, 500)
    }

    const handleError = () => {
      // A transition that errors before `playing` fires must still clear the
      // guard, or a genuine user pause during the failure would be swallowed.
      transitioningRef.current = false
      schedule(2000)
    }
    const handleStalled = () => schedule(3000)
    const handleWaiting = () => schedule(3000)
    const handlePlaying = () => {
      // Playback recovered on its own — cancel any pending retry so we don't
      // needlessly reload the stream mid-buffer, and reset the backoff.
      transitioningRef.current = false
      retryCountRef.current = 0
      clearTimeout(retryTimeoutRef.current)
    }
    const handleOnline = () => reconnect()
    const handleNativePlay = () => setIsPlaying(true)
    const handleNativePause = () => {
      // Ignore the `pause` event the load() algorithm fires during a
      // programmatic stream swap; real OS/headphone pauses happen outside one.
      if (transitioningRef.current) return
      setIsPlaying(false)
    }
    const handleVisibility = () => {
      // Mobile browsers suspend background audio; when the user returns and
      // playback is stuck (not actually progressing), kick a reconnect.
      if (document.visibilityState === 'visible' && isPlayingRef.current && audio.paused) {
        reconnect()
      }
    }

    audio.addEventListener('error', handleError)
    audio.addEventListener('stalled', handleStalled)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('play', handleNativePlay)
    audio.addEventListener('pause', handleNativePause)
    window.addEventListener('online', handleOnline)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('stalled', handleStalled)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('play', handleNativePlay)
      audio.removeEventListener('pause', handleNativePause)
      window.removeEventListener('online', handleOnline)
      document.removeEventListener('visibilitychange', handleVisibility)
      clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!currentStation || !audioRef.current) return
    retryCountRef.current = 0
    transitioningRef.current = true
    audioRef.current.src = currentStation.streamUrl
    audioRef.current.load()
    audioRef.current.play().catch(() => {})
  }, [currentStation])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      // The station-change effect already issued src+load+play for this swap;
      // skip the duplicate that would race its load() and log an AbortError.
      if (transitioningRef.current) return
      // Resuming a live stream: reload instead of resuming the stale buffer that
      // built up while paused, so we play current audio and don't stall when the
      // (likely dropped) connection's buffer drains.
      transitioningRef.current = true
      audioRef.current.load()
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
      clearTimeout(retryTimeoutRef.current)
      retryCountRef.current = 0
    }
  }, [isPlaying])

  const selectStation = useCallback(station => {
    if (station.id === currentStationRef.current?.id) {
      setIsPlaying(p => !p)
    } else {
      setCurrentStation(station)
      setIsPlaying(true)
    }
  }, [])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(p => !p)
  }, [])

  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])

  const playNext = useCallback(() => {
    const cur = currentStationRef.current
    const i = cur ? stations.findIndex(s => s.id === cur.id) : -1
    const next = stations[(i + 1 + stations.length) % stations.length]
    selectStation(next)
  }, [stations, selectStation])

  const playPrev = useCallback(() => {
    const cur = currentStationRef.current
    const i = cur ? stations.findIndex(s => s.id === cur.id) : 0
    const prev = stations[(i - 1 + stations.length) % stations.length]
    selectStation(prev)
  }, [stations, selectStation])

  return {
    currentStation,
    isPlaying,
    audioRef,
    selectStation,
    togglePlayPause,
    play,
    pause,
    playNext,
    playPrev,
  }
}
