import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DailyCheckIn } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { callAppFunction } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Calendar, Clock, Target } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    loadProgressData()
  }, [profile?.id])

  const loadProgressData = async () => {
    try {
      // Get all check-ins
      const { checkIns } = await callAppFunction<{ checkIns: DailyCheckIn[] }>('progress.load')

      if (checkIns) {
        setRecentCheckIns(checkIns.slice(0, 7))

        // Calculate stats
        const totalMinutes = checkIns.reduce((sum, c) => sum + (c.study_minutes || 0), 0)
        const totalTasks = checkIns.reduce((sum, c) => sum + (c.tasks_completed || 0), 0)
        const weeklyMinutes = checkIns.slice(0, 7).reduce((sum, c) => sum + (c.study_minutes || 0), 0)
        const focusScores = checkIns.filter(c => c.focus_score).map(c => c.focus_score)
        const averageFocus = focusScores.length > 0
          ? focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length
          : 0

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your progress...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-semibold mb-2 text-foreground">
          Your Progress
        </h1>
        <p className="text-muted-foreground mb-8">Celebrate every step forward 🎉</p>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Total Study Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-primary">
                {formatDuration(stats.totalStudyMinutes)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Tasks Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-primary">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-secondary-foreground">
                {formatDuration(stats.weeklyMinutes)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Focus Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-primary">{stats.averageFocus}/10</div>
              <p className="text-xs text-muted-foreground mt-1">Average</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your check-ins from the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCheckIns.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No check-ins yet. Start your journey today!</p>
            ) : (
              <div className="space-y-4">
                {recentCheckIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {new Date(checkIn.check_in_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {checkIn.morning_intention && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Intention: {checkIn.morning_intention}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        {formatDuration(checkIn.study_minutes || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {checkIn.tasks_completed || 0} tasks
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="border border-primary/20 bg-primary/5 mt-8">
          <CardContent className="py-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Keep Going! 💪</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>• You've studied {formatDuration(stats.totalStudyMinutes)} total - that's amazing!</p>
              <p>• Every session counts, even the short ones</p>
              <p>• Your {profile?.current_streak || 0}-day streak shows real commitment</p>
              <p>• Remember: Progress, not perfection</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}