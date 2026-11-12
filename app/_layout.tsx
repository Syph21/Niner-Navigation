import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useSegments, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { Stack } from 'expo-router'
import { useSupabase } from '../lib/supabase-context'

export default function RootLayout() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [session, setSession] = useState(null)
  const segments = useSegments()

  useEffect(() => {
    ;(async () => {
      await SplashScreen.preventAutoHideAsync()

      const { supabase } = await import('../lib/supabase/client')
      const { data } = await supabase.auth.getSession()
      setSession(data?.session)

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, newSession) => {
        setSession(newSession)
      })

      const delay = setTimeout(() => {
        setIsReady(true)
        SplashScreen.hideAsync().catch(() => {})
      }, 500)

      return () => {
        clearTimeout(delay)
        subscription.unsubscribe()
      }
    })()
  }, [router])

  useEffect(() => {
    if (!isReady) return

    const segment = Array.isArray(segments) ? segments[0] : segments

    if (session) {
      if (segment === 'login') {
        router.replace('/(tabs)/map')
      }
    } else {
      if (
        segment !== 'login' &&
        segment !== 'index' &&
        !segment.startsWith('(tabs)')
      ) {
        router.replace('/login')
      }
    }
  }, [isReady, session, router, segments])

  if (!isReady) {
    return (
      <>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{ headerShown: false }}
          id="root"
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="building-detail" />
        </Stack>
      </>
    )
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} id="root">
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="building-detail" />
      </Stack>
    </>
  )
}