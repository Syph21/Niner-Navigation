import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { Alert, StyleSheet, ScrollView, TouchableOpacity, View, Text } from 'react-native'
import { useStore } from '../../lib/store'
import { useSupabase } from '../../lib/supabase-context'
import { NINER_GREEN, GOLD, WHITE, SOFT_GRAY, DEEP_GREEN_DARK } from '../../lib/theme'

export default function ServicesScreen() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useStore()
  const [layers, setLayers] = useState({ dining: true, parking: true, busStops: true, blueLight: true, studySpaces: true, restrooms: true, evCharging: false, bikeRacks: false })
  const [services, setServices] = useState({ dining: [], parking: [], busStops: [], blueLight: [], studySpaces: [], restrooms: [], evCharging: [], bikeRacks: [] })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from('points_of_interest').select('*')
        if (error) throw error
        if (data) {
          const categorized = { dining: [], parking: [], busStops: [], blueLight: [], studySpaces: [], restrooms: [], evCharging: [], bikeRacks: [] }
          data.forEach((poi) => {
            if (poi.type === 'dining') categorized.dining.push(poi)
            else if (poi.type === 'parking_deck') categorized.parking.push(poi)
            else if (poi.type === 'bus_stop') categorized.busStops.push(poi)
            else if (poi.type === 'blue_light') categorized.blueLight.push(poi)
            else if (poi.type === 'study_space') categorized.studySpaces.push(poi)
            else if (poi.type === 'restroom') categorized.restrooms.push(poi)
            else if (poi.type === 'ev_charging') categorized.evCharging.push(poi)
            else if (poi.type === 'bike_rack') categorized.bikeRacks.push(poi)
          })
          setServices(categorized)
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load services')
      } finally { setIsLoading(false) }
    }
    fetchServices()
  }, [])

  const toggleLayer = (type) => setLayers(l => ({ ...l, [type]: !l[type] }))

  // Layer options with proper labels
  const LAYER_OPTIONS = [
    { key: 'dining', label: 'Dining' },
    { key: 'parking', label: 'Parking Decks' },
    { key: 'busStops', label: 'Bus Stops' },
    { key: 'blueLight', label: 'Blue-Light Phones' },
    { key: 'studySpaces', label: 'Study Spaces' },
    { key: 'restrooms', label: 'Restrooms' },
    { key: 'evCharging', label: 'EV Charging' },
    { key: 'bikeRacks', label: 'Bike Racks' },
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.layerToggle}>
        {LAYER_OPTIONS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.layerButton, layers[key] && styles.layerActive]}
            onPress={() => toggleLayer(key)}
          >
            <Text style={styles.layerText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {Object.keys(services).map((type) =>
        layers[type] && services[type].length > 0 && (
          <View key={type} style={styles.serviceSection}>
            <Text style={styles.sectionTitle}>
              {type === 'blueLight' ? 'Blue-Light Phones' : type === 'busStops' ? 'Bus Stops' : type.toUpperCase()}
            </Text>{services[type].map((s) => (
              <View key={s.id} style={styles.serviceItem}>
                <Text style={styles.serviceText}>{s.name}</Text>
              </View>
            ))}
          </View>
        )
      )}

      {isLoading ? null : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NINER_GREEN },
  layerToggle: { marginVertical: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  layerButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  layerActive: { backgroundColor: GOLD, borderColor: GOLD },
  layerText: { color: WHITE, fontSize: 14 },
  serviceSection: { marginTop: 20 },
  sectionTitle: { color: GOLD, fontSize: 16, marginBottom: 8 },
  serviceItem: { padding: 8, backgroundColor: DEEP_GREEN_DARK, borderRadius: 8, marginBottom: 4 },
  serviceText: { color: WHITE, fontSize: 14 },
})