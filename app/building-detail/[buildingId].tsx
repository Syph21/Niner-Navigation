import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useStore } from '../../lib/store'
import { useSupabase } from '../../lib/supabase-context'
import { NINER_GREEN, GOLD, WHITE } from '../../lib/theme'

type Building = {
  id: string
  name: string
  abbreviation?: string | null
  address?: string | null
}

export default function BuildingDetail() {
  const params = useLocalSearchParams<{ buildingId: string }>()
  const buildingId = Array.isArray(params.buildingId) ? params.buildingId[0] : params.buildingId
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useStore()

  const [loading, setLoading] = useState(true)
  const [building, setBuilding] = useState<Building | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!user?.id || !buildingId) return
    const checkFavorite = async () => {
      const { data } = (await (supabase.from('favorites') as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('target_id', buildingId)
        .eq('target_type', 'building')
        .maybeSingle()) as { data: any; error: any }
      setIsFavorite(!!data)
    }
    checkFavorite()
  }, [user?.id, buildingId])

  useEffect(() => {
    if (!buildingId) return
    const fetchBuildingDetails = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', buildingId)
          .single()
        if (error) throw error
        setBuilding(data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load building details'
        Alert.alert('Error', message)
      } finally {
        setLoading(false)
      }
    }
    fetchBuildingDetails()
  }, [buildingId])

  const toggleFavorite = async () => {
    if (!user?.id || !buildingId) return
    try {
      if (isFavorite) {
        const { error } = (await (supabase.from('favorites') as any)
          .delete()
          .eq('user_id', user.id)
          .eq('target_id', buildingId)
          .eq('target_type', 'building')) as { error: any; data: any }
        if (error) throw error
        setIsFavorite(false)
      } else {
        const { error } = await (supabase.from('favorites') as any).insert({
          user_id: user.id,
          target_id: buildingId,
          target_type: 'building',
        })
        if (error) throw error
        setIsFavorite(true)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update favorites'
      Alert.alert('Error', message)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    )
  }

  if (!building) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Building not found</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => router.back()}>
          <Text style={styles.ctaText}>Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{building.name}</Text>
        {!!building.abbreviation && (
          <Text style={styles.headerAbbreviation}>{building.abbreviation}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.addressText}>{building.address || 'Address not available'}</Text>
      </View>

      <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
        <Text style={styles.favoriteText}>
          {isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.ctaButton} onPress={() => router.back()}>
        <Text style={styles.ctaText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NINER_GREEN },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { padding: 20 },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { fontSize: 28, color: WHITE, fontWeight: '600' },
  headerAbbreviation: { color: GOLD, fontSize: 16, marginTop: 4 },
  section: { marginVertical: 16 },
  sectionTitle: { fontSize: 16, color: GOLD, marginBottom: 8 },
  addressText: { color: WHITE, fontSize: 14 },
  favoriteButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  favoriteText: { color: WHITE, fontSize: 16 },
  ctaButton: {
    width: '100%',
    height: 50,
    backgroundColor: GOLD,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  ctaText: { color: NINER_GREEN, fontSize: 16, fontWeight: '600' },
  errorText: { color: WHITE, fontSize: 16, textAlign: 'center', marginVertical: 20 },
})