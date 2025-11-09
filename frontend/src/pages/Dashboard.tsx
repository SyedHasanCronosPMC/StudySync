import React, { useState, useEffect } from 'react'
import type { UserProfile, DailyCheckIn } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { callAppFunction } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Target, Users, Clock, TrendingUp, Settings as SettingsIcon } from 'lucide-react'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { ProgressRings } from '@/components/gamification/ProgressRings'
import { TaskDecomposer } from '@/components/tasks/TaskDecomposer'
import { MorningCheckIn } from '@/components/check-in/MorningCheckIn'
import { EveningReflection } from '@/components/check-in/EveningReflection'
import { getMotivationalMessage, getDayGreeting, shouldShowMorningCheckIn, shouldShowEveningCheckIn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, profile, setProfile, logout } = useStore()
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

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const { profile: profileData, todayCheckIn } = await callAppFunction<{
        profile: UserProfile
        todayCheckIn: DailyCheckIn | null
      }>('dashboard.load')

      setProfile(profileData)

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Check-in Modals */}
      {showMorningCheckIn && <MorningCheckIn onComplete={handleMorningCheckInComplete} />}
      {showEveningCheckIn && (
        <EveningReflection
          onComplete={handleEveningReflectionComplete}
          onSkip={() => setShowEveningCheckIn(false)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              {getDayGreeting()}, {profile?.display_name || 'Friend'}! 🌟
            </h1>
            <p className="text-muted-foreground mt-2">{getMotivationalMessage(profile, todayStats)}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
              <SettingsIcon className="w-5 h-5" />
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="mb-8">
          <StreakCounter
            currentStreak={profile?.current_streak || 0}
            longestStreak={profile?.longest_streak || 0}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Brain className="w-5 h-5" />
                Quick Focus
              </CardTitle>
              <CardDescription>Start a 25-minute study session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/pomodoro')}>
                <Clock className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Target className="w-5 h-5" />
                Break Down Task
              </CardTitle>
              <CardDescription>AI helps split big tasks into chunks</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskDecomposer onTaskCreated={(tasks) => console.log('Created:', tasks)} />
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="w-5 h-5" />
                Study Together
              </CardTitle>
              <CardDescription>Join others studying right now</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/study-rooms')}>
                <Users className="w-4 h-4 mr-2" />
                Browse Rooms
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's Progress */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
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
            <p className="text-sm text-muted-foreground mt-2">— Your StudySync companion</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}