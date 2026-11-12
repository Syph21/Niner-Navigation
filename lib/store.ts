import { create } from 'zustand'
import { supabase } from './supabase/client'

interface UserProfile {
  id: string
  displayName: string | null
  major: string | null
  classYear: number | null
  accessibilityNeeds: boolean
}

interface AuthState {
  user: {
    id: string
    email: string | null
    profile: UserProfile | null
  } | null
  isLoading: boolean
  setUser: (user: any) => void
  signIn: (email: string) => void
  signOut: () => void
  fetchProfile: () => void
}

export type { UserProfile, AuthState }

export const useStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  signIn: (email) => {
  },
  signOut: () => {
    set({ user: null })
  },
  fetchProfile: () => {
  }
}))
