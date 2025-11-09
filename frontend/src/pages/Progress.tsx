import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Achievement, DailyCheckIn, HabitSummary } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { callAppFunction } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Calendar, Clock, Target, Sparkles, Loader2 } from 'lucide-react'
import { HabitSummaryCard } from '@/components/analytics/HabitSummary'
import { WeeklyTrendChart } from '@/components/analytics/WeeklyTrendChart'
import { AchievementGrid } from '@/components/gamification/AchievementGrid'
import { formatDuration } from '@/lib/utils'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageBreadcrumbs } from '@/components/layout/PageBreadcrumbs'

export default function Progress() {
  const navigate = useNavigate()
  const { profile } = useStore()
  const [stats, setStats] = useState({
    totalStudyMinutes: 0,
    totalTasks: 0,
    weeklyMinutes: 0,
    averageFocus: 0,
  })
  const [recentCheckIns, setRecentCheckIns] = useState<DailyCheckIn[]>([])
  const [habitSummary, setHabitSummary] = useState<HabitSummary | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [digest, setDigest] = useState<string | null>(null)
  const [digestLoading, setDigestLoading] = useState(false)
  const [digestError, setDigestError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    loadProgressData()
  }, [profile?.id])

  const loadProgressData = async () => {
    try {
      const [{ checkIns }, summary, achievementData] = await Promise.all([
        callAppFunction<{ checkIns: DailyCheckIn[] }>('progress.load'),
        callAppFunction<HabitSummary>('habit.summary', { days: 14 }),
        callAppFunction<{ achievements: Achievement[] }>('achievements.list'),
      ])

      setHabitSummary(summary)
      setAchievements(achievementData.achievements ?? [])
      setDigest(null)
      setDigestError(null)

      if (checkIns) {
        setRecentCheckIns(checkIns.slice(0, 7))

        const totalMinutes = checkIns.reduce((sum, c) => sum + (c.study_minutes || 0), 0)
        const totalTasks = checkIns.reduce((sum, c) => sum + (c.tasks_completed || 0), 0)
        const weeklyMinutes = checkIns.slice(0, 7).reduce((sum, c) => sum + (c.study_minutes || 0), 0)
        const focusScores = checkIns.filter((c) => c.focus_score).map((c) => c.focus_score ?? 0)
        const averageFocus =
          focusScores.length > 0 ? focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length : 0

        setStats({
          totalStudyMinutes: totalMinutes,
          totalTasks,
          weeklyMinutes,
          averageFocus: Math.round(averageFocus * 10) / 10,
        })
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateDigest = async () => {
    setDigestLoading(true)
    setDigestError(null)
    try {
      const { recap } = await callAppFunction<{ recap: string }>('digest.generate', { days: 7 })
      setDigest(recap)
    } catch (error: any) {
      console.error('Error generating recap:', error)
      setDigestError(error?.message ?? 'Unable to generate recap right now.')
    } finally {
      setDigestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4">
          <p className="text-muted-foreground">Loading your progress...</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 py-8">
        <PageContainer>
          <PageBreadcrumbs
            className="mb-4 text-xs sm:text-sm"
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Progress' },
            ]}
          />
          <Button onClick={() => navigate('/dashboard')} className="mb-6 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="mb-2 text-3xl font-semibold text-foreground">Your Progress</h1>
          <p className="mb-8 text-muted-foreground">Celebrate every step forward 🎉</p>

          {habitSummary && (
            <div className="mb-8">
              <HabitSummaryCard summary={habitSummary} />
            </div>
          )}

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Total Study Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-primary">{formatDuration(stats.totalStudyMinutes)}</div>
                <p className="mt-1 text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Tasks Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-primary">{stats.totalTasks}</div>
                <p className="mt-1 text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Last 7 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-primary">{formatDuration(stats.weeklyMinutes)}</div>
                <p className="mt-1 text-xs text-muted-foreground">Study time</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Focus Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-primary">{stats.averageFocus}/10</div>
                <p className="mt-1 text-xs text-muted-foreground">Average</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your check-ins from the past week</CardDescription>
            </CardHeader>
            <CardContent>
              {recentCheckIns.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No check-ins yet. Start your journey today!</p>
              ) : (
                <div className="space-y-4">
                  {recentCheckIns.map((checkIn) => (
                    <div key={checkIn.id} className="flex items-center justify-between rounded-lg bg-secondary p-4">
                      <div>
                        <div className="font-medium">
                          {new Date(checkIn.check_in_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        {checkIn.morning_intention && (
                          <p className="mt-1 text-sm text-muted-foreground">Intention: {checkIn.morning_intention}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{formatDuration(checkIn.study_minutes || 0)}</div>
                        <div className="text-sm text-muted-foreground">{checkIn.tasks_completed || 0} tasks</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly activity trend
              </CardTitle>
              <CardDescription>
                Study minutes and task completions across the last {habitSummary?.window ?? 7} days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyTrendChart data={habitSummary?.daily ?? []} />
            </CardContent>
          </Card>

          <Card className="mt-8 border-border bg-card">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Badges unlock automatically as your habits solidify.</CardDescription>
            </CardHeader>
            <CardContent>
              <AchievementGrid achievements={achievements} />
            </CardContent>
          </Card>

          <Card className="mt-8 border-border bg-card">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Weekly AI recap
                </CardTitle>
                <CardDescription>Generate a gentle reflection from your accountability companion.</CardDescription>
              </div>
              <Button variant="outline" onClick={generateDigest} disabled={digestLoading}>
                {digestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  'Generate recap'
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {digestError ? (
                <p className="text-sm text-destructive">{digestError}</p>
              ) : digest ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">{digest}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Tap generate to receive a weekly highlight reel.</p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8 border-purple-800 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
            <CardContent className="py-8">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Keep Going! 💪</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• You've studied {formatDuration(stats.totalStudyMinutes)} total - that's amazing!</p>
                <p>• Every session counts, even the short ones</p>
                <p>• Your {profile?.current_streak || 0}-day streak shows real commitment</p>
                <p>• Remember: Progress, not perfection</p>
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </main>

      <SiteFooter />
    </div>
  )
}