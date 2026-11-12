export type CampusBuilding = {
  id: string
  name: string
  abbreviation?: string | null
  lat: number
  lng: number
}

export type CampusMapProps = {
  centerLat: number
  centerLng: number
  zoom?: number
  buildings?: CampusBuilding[]
  onBuildingPress?: (building: CampusBuilding) => void
}
