import './App.css'
import { stations } from './data/stations.js'
import { useTheme } from './hooks/useTheme.js'
import { useAudioPlayer } from './hooks/useAudioPlayer.js'
import { useMediaSession } from './hooks/useMediaSession.js'
import AppBar from './components/AppBar.jsx'
import StationGrid from './components/StationGrid.jsx'
import MiniPlayer from './components/MiniPlayer.jsx'

export default function App() {
  const [theme, setTheme] = useTheme()
  const {
    currentStation,
    isPlaying,
    audioRef,
    selectStation,
    togglePlayPause,
    play,
    pause,
    playNext,
    playPrev,
  } = useAudioPlayer(stations)

  useMediaSession({
    station: currentStation,
    isPlaying,
    onPlay: play,
    onPause: pause,
    onNext: playNext,
    onPrev: playPrev,
  })

  return (
    <>
      <audio ref={audioRef} preload="none" />

      <AppBar theme={theme} onThemeChange={setTheme} />

      <main className="app-main">
        <StationGrid
          stations={stations}
          currentStation={currentStation}
          isPlaying={isPlaying}
          onSelect={selectStation}
        />
      </main>

      <MiniPlayer
        station={currentStation}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        visible={!!currentStation}
      />
    </>
  )
}
