import StationCard from './StationCard.jsx'

export default function StationGrid({ stations, currentStation, isPlaying, onSelect }) {
  return (
    <div className="station-grid">
      {stations.map(station => (
        <StationCard
          key={station.id}
          station={station}
          isActive={currentStation?.id === station.id}
          isPlaying={currentStation?.id === station.id && isPlaying}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
