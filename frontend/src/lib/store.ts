import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from './supabase'

interface AppState {
  user: any | null
  profile: UserProfile | null
  setUser: (user: any | null) => void
  setProfile: (profile: UserProfile | null) => void
  logout: () => void
}

export const useStore = create<AppState>()()
  persist(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      logout: () => set({ user: null, profile: null })
    }),
    {
      name: 'studysync-storage'
    }
  )
)