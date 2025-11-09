import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile, supabase } from './supabase'

interface AppState {
  user: any | null
  profile: UserProfile | null
  setUser: (user: any | null) => void
  setProfile: (profile: UserProfile | null) => void
  logout: () => Promise<void>
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      logout: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Sign-out failed:', error)
        }
        set({ user: null, profile: null })
      }
    }),
    {
      name: 'studysync-storage'
    }
  )
)