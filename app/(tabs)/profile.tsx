import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../../lib/store'
import { useSupabase } from '../../lib/supabase-context'
import { NINER_GREEN, GOLD, WHITE } from '../../lib/theme'

type Units = 'metric' | 'imperial'

export default function ProfileScreen() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useStore()
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [units, setUnits] = useState<Units>('metric')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const { data, error } = (await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()) as { data: { accessibility_needs: boolean; dark_mode: boolean; units: string } | null; error: any }
        if (error) throw error
        if (data) {
          setAccessibilityNeeds(data.accessibility_needs)
          setDarkMode(data.dark_mode)
          setUnits(data.units === 'imperial' ? 'imperial' : 'metric')
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch profile'
        Alert.alert('Error', message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [user?.id])

  const updateProfile = async () => {
    if (!user?.id) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          accessibility_needs: accessibilityNeeds,
          dark_mode: darkMode,
          units,
        })
      if (error) throw error
      Alert.alert('Saved', 'Your settings have been updated')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      Alert.alert('Error', message)
    } finally {
      setIsSaving(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const confirmDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account and all data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Not available', 'Account deletion is not yet implemented')
          },
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Niner Navigation</Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.row}>
          <Text style={styles.switchLabel}>Toggle accessibility mode</Text>
          <Switch
            value={accessibilityNeeds}
            onValueChange={setAccessibilityNeeds}
            accessibilityLabel="Toggle accessibility mode"
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Dark Mode</Text>
        <View style={styles.row}>
          <Text style={styles.switchLabel}>Use dark theme</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ true: GOLD, false: 'rgba(255,255,255,0.3)' }}
            accessibilityLabel="Toggle dark mode"
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Units</Text>
        <View style={styles.row}>
          {(['metric', 'imperial'] as const).map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.unitButton, units === u && styles.unitButtonActive]}
              onPress={() => setUnits(u)}
            >
              <Text style={[styles.unitText, units === u && styles.unitTextActive]}>
                {u === 'metric' ? 'Metric' : 'Imperial'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={updateProfile}
        disabled={isSaving}
      >
        <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteAccountButton} onPress={confirmDelete}>
        <Text style={styles.deleteText}>Delete Account & Data</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NINER_GREEN },
  centered: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { fontSize: 28, color: WHITE, fontWeight: '600' },
  headerSubtitle: { color: GOLD, fontSize: 14, marginTop: 4 },
  settingsSection: { marginVertical: 16 },
  sectionTitle: { fontSize: 16, color: GOLD, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: WHITE, fontSize: 14 },
  unitButton: {
    width: '48%',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitButtonActive: { backgroundColor: GOLD },
  unitText: { color: WHITE, fontSize: 14 },
  unitTextActive: { color: NINER_GREEN, fontWeight: '600' },
  saveButton: {
    width: '100%',
    height: 50,
    backgroundColor: GOLD,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  saveText: { color: NINER_GREEN, fontSize: 16, fontWeight: '600' },
  logoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  logoutText: { color: WHITE, fontSize: 16 },
  deleteAccountButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  deleteText: { color: '#E0A800', fontSize: 16 },
})
