import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import { WHITE, NEAR_BLACK, GOLD } from '../lib/theme'

// Default OSM tile URL
const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Map styles
const mapStyle = {
  width: '100%',
  height: 300,
  borderRadius: 16,
  marginBottom: 16,
}

// Campus marker icon
const campusMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon@2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  markerColor: 'green', // Will use NINER_GREEN customization instead
})

// Custom marker with Niner Green color
const ninerMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon@2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  markerColor: 'green',
})

// Override the marker color for Niner Green
// Leaflet's markerColor accepts: 'green', 'red', 'orange', 'blue', 'purple', 'dark-red'
// We'll use 'green' and customize the visual via the icon

// Map controller component that uses useMap() - rendered as child of MapContainer
function MapController({ centerLat, centerLng, zoom, onBuildingPress, buildings }) {
  const map = useMap()

  useEffect(() => {
    if (map) {
      map.attributionControl.setPosition('bottomright')
    }
  }, [map])

  // Handle building marker clicks
  const handleMarkerClick = (building) => {
    if (onBuildingPress) onBuildingPress(building)
  }

  return null // UI handled by parent CampusMapWeb
}

export default function CampusMapWeb({
  centerLat,
  centerLng,
  zoom = 15,
  buildings = [],
  onBuildingPress,
}: {
  centerLat: number
  centerLng: number
  zoom?: number
  buildings: any[]
  onBuildingPress?: (building: any) => void
}) {
  const mapStyle = {
    height: 400,
    width: '100%',
    borderRadius: 16,
    marginBottom: 16,
  }

  // Map controller using useMap - rendered as child inside MapContainer
  const map = useMap()

  useEffect(() => {
    if (map) {
      map.attributionControl.setPosition('bottomright')
    }
  }, [map])

  // Handle building marker clicks
  const handleMarkerClick = (building) => {
    if (onBuildingPress) onBuildingPress(building)
  }

  return (
    <>
      <TileLayer
        url={OSM_URL}
        attribution={OSM_ATTRIBUTION}
        maxZoom={19}
        minZoom={1}
      />

      {buildings.map((building) => {
        const { lat, lng, name, abbreviation } = building
        return (
          <Marker key={building.id} position={[lat, lng]}>
            <Popup>
              <div style={popupStyle} onClick={() => handleMarkerClick(building)}>
                <div style={popupTextStyle}>{name}</div>
                {abbreviation && (
                  <div style={popupAbbreviationStyle}>{abbreviation}</div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Center marker */}
      <Marker position={[centerLat, centerLng]} icon={ninerMarkerIcon}>
        <Popup>
          <div style={popupStyle}>
            <div style={popupTextStyle}>You are here</div>
          </div>
        </Popup>
      </Marker>
    </>
  )
}

const popupStyle = {
  backgroundColor: WHITE,
  borderRadius: 8,
  padding: 12,
  minWidth: 150,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  cursor: 'pointer',
}

const popupTextStyle = {
  color: NEAR_BLACK,
  fontSize: 14,
  marginBottom: 4,
}

const popupAbbreviationStyle = {
  color: GOLD,
  fontSize: 12,
  fontStyle: 'italic',
}