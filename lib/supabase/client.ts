import AsyncStorage from '@react-native-async-storage/async-storage'

const single = async () => ({ data: null, error: null })

export const supabase = {
  from: <T = any>(table: string) => ({
    select: (columns: string) => ({
      eq: (col1: string, val1: any) => ({
        eq: (col2: string, val2: any) => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => {
            const { data, error } = await single()
            return { data: data ? data : null, error }
          }
        }),
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => {
          const { data, error } = await single()
          return { data: data ? data : null, error }
        }
      }),
      // Direct select returns { data, error } when awaited
      data: [] as T[],
      error: null as Error | null,
      single: async () => {
        const { data, error } = await single()
        return { data: data ? data : null, error }
      },
      maybeSingle: async () => {
        const { data, error } = await single()
        return { data: data ? data : null, error }
      }
    }),
    insert: (data: any) => ({
      single: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null })
    }),
  }),
  auth: {
    signInWithOtp: async (options: any) => ({ data: null, error: null }),
    verifyOtp: async (options: any) => ({ data: null, error: null }),
    getSession: async () => {
      // Try to get session from async storage
      const stored = await AsyncStorage.getItem('@supabase_auth')
      if (stored) {
        try {
          const { session, expires_at } = JSON.parse(stored)
          return { data: { session }, error: null }
        } catch (e) {
          return { data: null, error: null }
        }
      }
      // Fallback: try the default getSession
      return single()
    },
    signOut: async () => {
      await AsyncStorage.removeItem('@supabase_auth')
      // Call default signOut logic
      return { data: null, error: null }
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Stub implementation - in a real app, this would subscribe to auth changes
      // For this project, the layout guard handles auth state checking on render
      return { data: { subscription: { unsubscribe: () => {} } }, error: null }
    }
  }
}
