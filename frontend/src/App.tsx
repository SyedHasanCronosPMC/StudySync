import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useStore } from './lib/store'
import { AuthForm } from './components/auth/AuthForm'
import { OnboardingWizard } from './components/auth/OnboardingWizard'
import Dashboard from './pages/Dashboard'
import PomodoroTimer from './pages/PomodoroTimer'
import StudyRooms from './pages/StudyRooms'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import './index.css'

function App() {
  const { user, profile, setUser, setProfile } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    // Profile will be loaded by the auth state change listener
  }

  const handleOnboardingComplete = () => {
    if (user) {
      loadProfile(user.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🧠</div>
          <p className="text-muted-foreground">Loading StudySync...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return <AuthForm onSuccess={handleAuthSuccess} />
  }

  // Need onboarding
  if (profile && !profile.onboarding_completed) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  // Main app
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pomodoro" element={<PomodoroTimer />} />
        <Route path="/study-rooms" element={<StudyRooms />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App