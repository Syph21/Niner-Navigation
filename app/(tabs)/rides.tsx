import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useSupabase } from '../../lib/supabase-context'
import { useRouter, useSegments } from 'expo-router'
import { NINER_GREEN, GOLD, WHITE, INACTIVE_GRAY, DEEP_GREEN_DARK } from '../../lib/theme'

const buildings = [
  { id: '1', name: 'University City Station', abbr: 'UCS', lat: 35.3062, lng: -80.7358 },
  { id: '2', name: 'College Downs', abbr: 'CD', lat: 35.3085, lng: -80.7341 },
  { id: '3', name: 'Light Rail Stop', abbr: 'LRT', lat: 35.3051, lng: -80.7365 },
  { id: '4', name: 'Central Campus', abbr: 'CC', lat: 35.3078, lng: -80.7348 },
  { id: '5', name: 'Owens Art Center', abbr: 'OAC', lat: 35.3092, lng: -80.7331 },
  { id: '6', name: 'Atkins Library', abbr: 'AL', lat: 35.3068, lng: -80.7355 },
]

export default function RidesScreen() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [view, setView] = useState<'rider' | 'driver'>('rider')
  const [pickupLat, setPickupLat] = useState(null)
  const [pickupLng, setPickupLng] = useState(null)
  const [pickupLabel, setPickupLabel] = useState('')
  const [dropoffLabel, setDropoffLabel] = useState('')
  const [seats, setSeats] = useState(1)
  const [isOnline, setIsOnline] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [requestId, setRequestId] = useState<string | null>(null)
  const [location, setLocation] = useState({ latitude: 35.3071, longitude: -80.7352 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setIsLoading(false)
      } catch (err) {
        setError('Failed to load session')
        setIsLoading(false)
      }
    })()
  }, [])

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    if (pickupLat && pickupLng) {
      const mockDrivers = [
        { id: 'driver-1', lat: 35.3065, lng: -80.7350, isOnline: true },
        { id: 'driver-2', lat: 35.3080, lng: -80.7335, isOnline: true },
        { id: 'driver-3', lat: 35.3075, lng: -80.7360, isOnline: false },
      ]
      const nearby = mockDrivers
        .filter(d => d.isOnline)
        .map(d => ({ ...d, distance: calculateDistance(pickupLat, pickupLng, d.lat, d.lng) }))
        .filter(d => d.distance <= 3)
        .sort((a, b) => a.distance - b.distance)
      setDrivers(nearby)
    }
  }, [pickupLat, pickupLng])

  const requestRide = async () => {
    if (!session) {
      Alert.alert('Login required', 'Please log in with your @charlotte.edu email')
      return
    }
    if (!pickupLat || !pickupLng) {
      Alert.alert('Missing location', 'Please set a pickup location')
      return
    }
    if (!dropoffLabel) {
      Alert.alert('Missing drop-off', 'Please select a drop-off location')
      return
    }
    setIsLoading(true)
    try {
      const { data } = await supabase
        .from('ride_requests')
        .insert({
          rider_id: session.user.id,
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          pickup_label: pickupLabel,
          dropoff_lat: location.latitude,
          dropoff_lng: location.longitude,
          dropoff_label: dropoffLabel,
          seats,
          status: 'pending',
        })
        .select()
        .single()
      setRequestId(data.id)
      Alert.alert('Ride requested!', 'Your ride request has been submitted.')
      setIsLoading(false)
    } catch (err) {
      setError('Failed to request ride')
      setIsLoading(false)
    }
  }

  const cancelRide = async () => {
    if (!requestId) return
    setIsLoading(true)
    try {
      await supabase.from('ride_requests').update({ status: 'cancelled' }).eq('id', requestId)
      setRequestId(null)
      setDrivers([])
      Alert.alert('Ride cancelled')
      setIsLoading(false)
    } catch (err) {
      setError('Failed to cancel ride')
      setIsLoading(false)
    }
  }

  const acceptRide = async (driverId) => {
    await supabase.from('ride_requests').update({ status: 'accepted', driver_id: driverId }).eq('id', requestId)
    Alert.alert('Driver Accepted', 'Your driver has accepted the ride.')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
      style={styles.container}
    >
      <View style={styles.content}>
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={NINER_GREEN} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {error && (
          <View style={styles.error}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!(isLoading || error) && (
          <View style={styles.mainContent}>
            {view === 'rider' && (
              <View style={styles.screen}>
                {session && (
                  <View style={styles.status}>
                    <Text style={styles.statusText}>Logged in as: {session.user.email?.split('@')[0] || 'Student'}</Text>
                  </View>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Pickup Location</Text>
                  <ScrollView style={styles.buildingList}>
                    {buildings.map(b => (
                      <TouchableOpacity key={b.id} style={styles.buildingItem} onPress={() => {
                        setPickupLat(b.lat); setPickupLng(b.lng); setPickupLabel(b.name)
                      }}>
                        <Text style={styles.buildingText}>{b.name}{b.abbr && ' ( ' + b.abbr + ' )'}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={styles.pickupInputLabel}>Custom: {pickupLabel || 'Select above'}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Drop-off Location</Text>
                  <ScrollView style={styles.buildingList}>
                    {buildings.map(b => (
                      <TouchableOpacity key={b.id} style={styles.buildingItem} onPress={() => setDropoffLabel(b.name)}>
                        <Text style={styles.buildingText}>{b.name}{b.abbr && ' ( ' + b.abbr + ' )'}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={styles.pickupInputLabel}>Selected: {dropoffLabel || 'Select above'}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Seats</Text>
                  <View style={styles.seatOptions}>
                    {[1, 2, 3].map(s => (
                      <TouchableOpacity key={s} style={[{ padding: 4, backgroundColor: seats === s ? NINER_GREEN : WHITE }, styles.seatOption]} onPress={() => setSeats(s)}>
                        <Text style={styles.seatText}>{s} seat{s > 1 ? 's' : ''}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.requestButton} onPress={requestRide} disabled={!pickupLabel || !dropoffLabel || !session}>
                  <Text style={styles.requestButtonText}>Request Ride</Text>
                </TouchableOpacity>

                {requestId && (
                  <View style={styles.activeRequest}>
                    <Text style={styles.activeRequestText}>Ride submitted (ID: {requestId.slice(0, 8)}...)</Text>
                    <TouchableOpacity style={styles.cancelButton} onPress={cancelRide}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {view === 'driver' && (
              <View style={styles.screen}>
                <View style={styles.driverToggle}>
                  <TouchableOpacity style={[{ padding: 8, backgroundColor: isOnline ? DEEP_GREEN_DARK : NINER_GREEN }, styles.toggleItem]} onPress={() => setIsOnline(!isOnline)}>
                    <Text style={[{ color: WHITE, fontWeight: '600' }]}>{isOnline ? 'Go Offline' : 'Go Online'}</Text>
                  </TouchableOpacity>
                </View>

                {session && (
                  <View style={styles.status}>
                    <Text style={styles.statusText}>Driver Status: {isOnline ? 'Online' : 'Offline'}</Text>
                  </View>
                )}

                {requestId && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Closest Riders</Text>
                    {drivers.length > 0 ? (
                      drivers.map((d) => (
                        <View key={d.id} style={styles.driverItem}>
                          <Text style={styles.driverText}>Driver {d.distance.toFixed(1)} km away</Text>
                          <TouchableOpacity style={styles.driverAccept} onPress={() => acceptRide(d.id)}>
                            <Text style={styles.driverAcceptText}>Accept</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDrivers}>No nearby riders</Text>
                    )}
                  </View>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Location</Text>
                  <Text style={styles.locationText}>
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  mainContent: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: { marginTop: 16, color: NINER_GREEN, fontSize: 18 },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,80,53,0.2)',
    borderRadius: 12,
  },
  errorText: { color: NINER_GREEN, fontSize: 18, marginBottom: 16 },
  retryButton: {
    backgroundColor: NINER_GREEN,
    padding: 8,
    borderRadius: 6,
  },
  retryText: { color: WHITE },
  screen: { flex: 1, padding: 16 },
  section: { padding: 16, backgroundColor: WHITE, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: NINER_GREEN, marginBottom: 8 },
  status: { padding: 12, backgroundColor: WHITE, borderRadius: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  statusText: { color: NINER_GREEN, fontWeight: '500', marginRight: 8 },
  buildingList: { marginTop: 8, maxHeight: 200 },
  buildingItem: { padding: 12, borderRadius: 8, marginBottom: 4, backgroundColor: WHITE },
  buildingText: { fontSize: 14, color: NINER_GREEN },
  pickupInputLabel: { marginTop: 4, fontSize: 12, color: INACTIVE_GRAY },
  seatOptions: { flexDirection: 'row', marginTop: 8 },
  seatOption: { padding: 8, borderRadius: 8, backgroundColor: WHITE, marginRight: 4 },
  seatText: { color: NINER_GREEN, fontWeight: '600' },
  requestButton: { padding: 12, backgroundColor: NINER_GREEN, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  requestButtonText: { color: WHITE, fontWeight: '600', fontSize: 16 },
  activeRequest: { padding: 12, backgroundColor: '#FFF3E0', borderRadius: 8, marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  activeRequestText: { flex: 1, color: NINER_GREEN, fontWeight: '500' },
  cancelButton: { marginLeft: 8 },
  cancelButtonText: { color: NINER_GREEN },
  driverToggle: { padding: 16, backgroundColor: WHITE, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleItem: { padding: 12, borderRadius: 8, alignItems: 'center' },
  driverAccept: { padding: 8, backgroundColor: NINER_GREEN, borderRadius: 8, marginTop: 4 },
  driverAcceptText: { color: WHITE, fontWeight: '500', marginHorizontal: 8 },
  noDrivers: { marginTop: 8, color: INACTIVE_GRAY },
  locationText: { color: NINER_GREEN, fontSize: 12 },
})
