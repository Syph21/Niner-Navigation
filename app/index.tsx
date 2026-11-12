import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { useSupabase } from '../lib/supabase-context'
import { useRouter } from 'expo-router'

export default function Index() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      // Prevent splash screen from hiding automatically while we check auth
      await SplashScreen.preventAutoHideAsync()
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        router.replace('/(tabs)/map')
      } else {
        router.replace('/login')
      }
    })().finally(() => {
      setLoading(false)
      // Allow splash to hide now that auth check is done
      SplashScreen.hideAsync().catch(() => {})
    })
  }, [])

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#A49665" />
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#005035',
    justifyContent: 'center',
    alignItems: 'center',
  },
})