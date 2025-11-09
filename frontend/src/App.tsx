import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, type UserProfile } from './lib/supabase'
import { useStore } from './lib/store'
import { callAppFunction } from './lib/api'
import { fetchOrCreateProfile } from './lib/fallback'
import { AuthForm } from './components/auth/AuthForm'
import { OnboardingWizard } from './components/auth/OnboardingWizard'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import PomodoroTimer from './pages/PomodoroTimer'
import StudyRooms from './pages/StudyRooms'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import Tasks from './pages/Tasks'
import Buddy from './pages/Buddy'
import './index.css'

function App() {
  const { user, profile, setUser, setProfile } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!isMounted) return

      setUser(session?.user ?? null)

      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }

    loadInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (event === 'TOKEN_REFRESHED') {
        return
      }

      setUser(session?.user ?? null)

      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { profile } = await callAppFunction<{ profile: UserProfile }>('profile.get')
      if (profile?.id !== userId) {
        throw new Error('Profile mismatch')
      }
      setProfile(profile)
    } catch (error) {
      console.error('Error loading profile:', error)
      try {
        const fallbackProfile = await fetchOrCreateProfile(userId)
        setProfile(fallbackProfile)
      } catch (fallbackError) {
        console.error('Profile fallback failed:', fallbackError)
      }
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

  return (
    <BrowserRouter>
      <Routes
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {/* Public routes - Landing page */}
        <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" replace />} />
        <Route path="/landing" element={<Landing />} />
        
        {/* Auth routes with mode */}
        <Route 
          path="/auth" 
          element={
            !user ? (
              <AuthForm onSuccess={handleAuthSuccess} mode="signup" />
            ) : profile && !profile.onboarding_completed ? (
              <OnboardingWizard onComplete={handleOnboardingComplete} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            !user ? (
              <AuthForm onSuccess={handleAuthSuccess} mode="signup" />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            !user ? (
              <AuthForm onSuccess={handleAuthSuccess} mode="login" />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* Protected routes - require authentication */}
        {user && (
          <>
            {profile && !profile.onboarding_completed ? (
              <Route path="*" element={<OnboardingWizard onComplete={handleOnboardingComplete} />} />
            ) : (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pomodoro" element={<PomodoroTimer />} />
                <Route path="/study-rooms" element={<StudyRooms />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/buddy" element={<Buddy />} />
                <Route path="/settings" element={<Settings />} />
              </>
            )}
          </>
        )}

        {/* Redirect authenticated users trying to access auth pages */}
        {user && <Route path="*" element={<Navigate to="/dashboard" replace />} />}
        
        {/* Redirect unauthenticated users to landing */}
        {!user && <Route path="*" element={<Navigate to="/" replace />} />}
      </Routes>
    </BrowserRouter>
  )
}

export default App