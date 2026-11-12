import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { MapContainer } from 'react-leaflet'
import { NINER_GREEN, GOLD, WHITE, NEAR_BLACK, DEEP_GREEN_DARK } from '../../lib/theme'
import CampusMap from '../../components/CampusMap'

type SearchResult = { id: string; name: string }

const sampleBuildings = [
  { id: '1', name: 'Atkins Library', abbreviation: 'Atkins', lat: 35.2294, lng: -80.6778 },
  { id: '2', name: 'Fretwell Building', abbreviation: 'Fretwell', lat: 35.2289, lng: -80.6782 },
  { id: '3', name: 'Cone University Center', abbreviation: 'Cone', lat: 35.2282, lng: -80.6775 },
]

export default function MapScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setIsSearching(true)
    setSearchResults([])
    setIsSearching(false)
  }

  const openBuilding = (id: string) => router.push(`/building-detail/${id}`)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Niner Navigation</Text>
        <Text style={styles.headerSubtitle}>UNC Charlotte Campus Map</Text>
      </View>

      <View style={styles.searchBar}>
        <TouchableOpacity style={styles.searchInput} onPress={() => handleSearch(searchQuery)}>
          <Text style={styles.searchInputText}>Search buildings, abbreviations, or POIs...</Text>
        </TouchableOpacity>
      </View>

      <MapContainer>
        <CampusMap
          centerLat={35.2288}
          centerLng={-80.679}
          zoom={15}
          buildings={sampleBuildings}
          onBuildingPress={(building: { id: string }) => openBuilding(building.id)}
        />
      </MapContainer>

      {isSearching && <Text style={styles.loadingText}>Searching...</Text>}

      <View style={styles.resultsContainer}>
        {searchResults.length === 0 && !isSearching && (
          <Text style={styles.emptyState}>Start searching above</Text>
        )}
        {searchResults.map((result) => (
          <TouchableOpacity
            key={result.id}
            style={styles.resultItem}
            onPress={() => openBuilding(result.id)}
          >
            <Text style={styles.resultText}>{result.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.quickAccess}>
        <Text style={styles.quickAccessTitle}>Quick Access</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NINER_GREEN },
  content: { padding: 20 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 24, color: WHITE, fontWeight: '600' },
  headerSubtitle: { fontSize: 14, color: GOLD, marginTop: 4 },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInputText: { color: NEAR_BLACK, fontSize: 16, flex: 1 },
  loadingText: { color: GOLD, marginVertical: 16, textAlign: 'center' },
  resultsContainer: { marginTop: 16 },
  emptyState: { color: GOLD, textAlign: 'center', marginVertical: 32 },
  resultItem: { padding: 12, backgroundColor: WHITE, borderRadius: 12, marginBottom: 8 },
  resultText: { color: NEAR_BLACK, fontSize: 16 },
  quickAccess: {
    marginTop: 32,
    padding: 20,
    backgroundColor: DEEP_GREEN_DARK,
    borderRadius: 16,
  },
  quickAccessTitle: { color: WHITE, fontSize: 18, marginBottom: 12 },
})
