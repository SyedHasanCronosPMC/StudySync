import React, { useState, useEffect } from 'react'
import type { UserProfile, DailyCheckIn, HabitSummary } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { callAppFunction } from '@/lib/api'
import { fetchHabitSummary, fetchOrCreateProfile, fetchTodayCheckIn } from '@/lib/fallback'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Target, Users, Clock, TrendingUp, Settings as SettingsIcon, UserPlus } from 'lucide-react'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { HabitSummaryCard } from '@/components/analytics/HabitSummary'
import { ProgressRings } from '@/components/gamification/ProgressRings'
import { TaskDecomposer } from '@/components/tasks/TaskDecomposer'
import { MorningCheckIn } from '@/components/check-in/MorningCheckIn'
import { EveningReflection } from '@/components/check-in/EveningReflection'
import { getMotivationalMessage, getDayGreeting, shouldShowMorningCheckIn, shouldShowEveningCheckIn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageBreadcrumbs } from '@/components/layout/PageBreadcrumbs'

export default function Dashboard() {
  const { user, profile, setProfile } = useStore()
  const navigate = useNavigate()
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null)
  const [showMorningCheckIn, setShowMorningCheckIn] = useState(false)
  const [showEveningCheckIn, setShowEveningCheckIn] = useState(false)
  const [todayStats, setTodayStats] = useState({
    studyMinutes: 0,
    tasksCompleted: 0,
    focusScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const [habitSummary, setHabitSummary] = useState<HabitSummary | null>(null)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const [dashboardData, summaryData] = await Promise.all([
        callAppFunction<{
          profile: UserProfile
          todayCheckIn: DailyCheckIn | null
        }>('dashboard.load'),
        callAppFunction<HabitSummary>('habit.summary', { days: 7 }),
      ])

      const { profile: profileData, todayCheckIn } = dashboardData

      setProfile(profileData)
      setHabitSummary(summaryData)

      if (todayCheckIn) {
        setTodayCheckIn(todayCheckIn)
        setTodayStats({
          studyMinutes: todayCheckIn.study_minutes || 0,
          tasksCompleted: todayCheckIn.tasks_completed || 0,
          focusScore: todayCheckIn.focus_score || 0,
        })
      } else {
        setTodayCheckIn(null)
        setTodayStats({
          studyMinutes: 0,
          tasksCompleted: 0,
          focusScore: 0,
        })
      }

      setShowMorningCheckIn(shouldShowMorningCheckIn(todayCheckIn))
      setShowEveningCheckIn(shouldShowEveningCheckIn(todayCheckIn))
    } catch (error) {
      console.error('Error loading dashboard:', error)
      if (user) {
        try {
          const [fallbackProfile, fallbackCheckIn, fallbackSummary] = await Promise.all([
            fetchOrCreateProfile(user.id),
            fetchTodayCheckIn(user.id),
            fetchHabitSummary(7, user.id),
          ])

          setProfile(fallbackProfile)
          setHabitSummary(fallbackSummary)

          if (fallbackCheckIn) {
            setTodayCheckIn(fallbackCheckIn)
            setTodayStats({
              studyMinutes: fallbackCheckIn.study_minutes || 0,
              tasksCompleted: fallbackCheckIn.tasks_completed || 0,
              focusScore: fallbackCheckIn.focus_score || 0,
            })
          }

          setShowMorningCheckIn(shouldShowMorningCheckIn(fallbackCheckIn))
          setShowEveningCheckIn(shouldShowEveningCheckIn(fallbackCheckIn))
        } catch (fallbackError) {
          console.error('Dashboard fallback failed:', fallbackError)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMorningCheckInComplete = (data: any) => {
    setShowMorningCheckIn(false)
    loadDashboardData()
  }

  const handleEveningReflectionComplete = (data: any) => {
    setShowEveningCheckIn(false)
    loadDashboardData()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-4 text-6xl">🧠</div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {showMorningCheckIn && <MorningCheckIn onComplete={handleMorningCheckInComplete} />}
      {showEveningCheckIn && (
        <EveningReflection
          onComplete={handleEveningReflectionComplete}
          onSkip={() => setShowEveningCheckIn(false)}
        />
      )}

      <main className="flex-1 py-8">
        <PageContainer className="space-y-8">
          <PageBreadcrumbs items={[{ label: 'Dashboard' }]} className="text-xs sm:text-sm" />
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                {getDayGreeting()}, {profile?.display_name || 'Friend'}! 🌟
              </h1>
              <p className="mt-2 text-muted-foreground">{getMotivationalMessage(profile, todayStats)}</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Streak Counter */}
          <div className="mb-8">
            <StreakCounter
              currentStreak={profile?.current_streak || 0}
              longestStreak={profile?.longest_streak || 0}
            />
          </div>

          {habitSummary && (
            <div className="mb-8">
              <HabitSummaryCard summary={habitSummary} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="cursor-pointer border-border bg-card transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Brain className="h-5 w-5" />
                  Quick Focus
                </CardTitle>
                <CardDescription>Start a 25-minute study session</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate('/pomodoro')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Start Session
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  Plan Tasks
                </CardTitle>
                <CardDescription>Break down work and jump into your task list</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <TaskDecomposer onTaskCreated={loadDashboardData} />
                  <Button variant="outline" className="w-full" onClick={() => navigate('/tasks')}>
                    Open Task Workspace
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer border-border bg-card transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5" />
                  Study Together
                </CardTitle>
                <CardDescription>Join others studying right now</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate('/study-rooms')}>
                  <Users className="mr-2 h-4 w-4" />
                  Browse Rooms
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer border-border bg-card transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <UserPlus className="h-5 w-5" />
                  Find Buddy
                </CardTitle>
                <CardDescription>Match with an accountability partner</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate('/buddy')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Request Buddy
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Today's Progress */}
          <Card className="mb-8 border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="h-5 w-5" />
                    Today's Progress
                  </CardTitle>
                  <CardDescription>You're doing great! Every minute counts.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => navigate('/progress')}>
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ProgressRings
                studyMinutes={todayStats.studyMinutes}
                goalMinutes={profile?.daily_goal_minutes || 60}
                tasksCompleted={todayStats.tasksCompleted}
                focusScore={todayStats.focusScore}
              />
            </CardContent>
          </Card>

          {/* Motivational Quote */}
          <Card className="border border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <p className="text-lg italic text-foreground">
                "Progress, not perfection. Showing up is winning."
              </p>
              <p className="mt-2 text-sm text-muted-foreground">— Your StudySync companion</p>
            </CardContent>
          </Card>
        </PageContainer>
      </main>

      <SiteFooter />
    </div>
  )
}