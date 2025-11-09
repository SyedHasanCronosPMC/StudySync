import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Play, Pause, RotateCcw, Coffee, Award } from 'lucide-react'
import { useStore } from '@/lib/store'
import { callAppFunction } from '@/lib/api'
import type { Achievement, Task, UserProfile } from '@/lib/supabase'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageBreadcrumbs } from '@/components/layout/PageBreadcrumbs'

export default function PomodoroTimer() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const taskId = searchParams.get('taskId')
  const { profile, setProfile } = useStore()
  const focusDurationDefault = profile?.preferred_study_duration || 25
  const breakDurationDefault = profile?.break_duration || 5
  const [minutes, setMinutes] = useState(focusDurationDefault)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [sessionReview, setSessionReview] = useState<{ duration: number } | null>(null)
  const [focusRating, setFocusRating] = useState(7)
  const [tasksLogged, setTasksLogged] = useState(0)
  const [loggingSession, setLoggingSession] = useState(false)
  const [linkedTask, setLinkedTask] = useState<Task | null>(null)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            handleTimerComplete()
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, minutes, seconds])

  useEffect(() => {
    const controller = new AbortController()
    const fetchTask = async () => {
      if (!taskId) {
        setLinkedTask(null)
        return
      }
      setTaskError(null)
      try {
        const { task } = await callAppFunction<{ task: Task }>('tasks.get', { task_id: taskId })
        setLinkedTask(task)
      } catch (error: any) {
        console.error('Failed to load task:', error)
        setTaskError('Unable to load task details')
      }
    }
    fetchTask()
    return () => controller.abort()
  }, [taskId])

  const handleTimerComplete = () => {
    setIsActive(false)
    if (isBreak) {
      setIsBreak(false)
      setMinutes(focusDurationDefault)
      setSeconds(0)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break complete!', {
          body: 'Time to get back to work',
          icon: '/vite.svg',
        })
      }
    } else {
      setSessionReview({ duration: focusDurationDefault })
      setFocusRating(7)
      setTasksLogged(linkedTask ? 1 : 0)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Session complete!', {
          body: 'Log your focus and take a short break',
          icon: '/vite.svg',
        })
      }
    }
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
    if (!isActive && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsBreak(false)
    setMinutes(focusDurationDefault)
    setSeconds(0)
  }

  const progress = isBreak
    ? (((breakDurationDefault * 60 - (minutes * 60 + seconds)) / (breakDurationDefault * 60)) * 100)
    : (((focusDurationDefault * 60 - (minutes * 60 + seconds)) / (focusDurationDefault * 60)) * 100)

  const handleSessionSubmit = async () => {
    if (!sessionReview) return
    setLoggingSession(true)
    try {
      const { profile: updatedProfile, achievements: newlyUnlocked } = await callAppFunction<{
        profile: UserProfile
        achievements: Achievement[]
      }>('habit.logSession', {
        duration_minutes: sessionReview.duration,
        tasks_completed: tasksLogged,
        focus_score: focusRating,
        task_id: linkedTask?.id,
      })
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      if (newlyUnlocked && newlyUnlocked.length > 0) {
        setUnlockedAchievements(newlyUnlocked)
      }
      setCompletedSessions((prev) => prev + 1)
      setSessionReview(null)
      setIsBreak(true)
      setMinutes(breakDurationDefault)
      setSeconds(0)
    } catch (error) {
      console.error('Failed to log session:', error)
      alert('Unable to log this session. Please try again.')
    } finally {
      setLoggingSession(false)
    }
  }

  const handleSkipLogging = () => {
    setSessionReview(null)
    setIsBreak(true)
    setMinutes(breakDurationDefault)
    setSeconds(0)
  }

  const skipToBreak = () => {
    setIsActive(false)
    setIsBreak(true)
    setMinutes(breakDurationDefault)
    setSeconds(0)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-8">
        <PageContainer className="max-w-2xl">
          <PageBreadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Pomodoro Timer' },
            ]}
            className="mb-4 text-xs sm:text-sm"
          />
          <Button onClick={() => navigate('/dashboard')} className="mb-6 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {unlockedAchievements.length > 0 && (
            <Card className="mb-6 border border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Award className="h-5 w-5" />
                  New achievement unlocked!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unlockedAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="text-lg">{achievement.badge_icon ?? '🎖️'}</span>
                    <div>
                      <p className="font-medium">{achievement.badge_name}</p>
                      {achievement.badge_description ? (
                        <p className="text-xs text-muted-foreground">{achievement.badge_description}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {isBreak ? (
                  <span className="flex items-center justify-center gap-2 text-secondary-foreground">
                    <Coffee className="h-6 w-6" />
                    Break Time
                  </span>
                ) : (
                  <span className="text-primary">Focus Session</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {linkedTask && (
                <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{linkedTask.title}</p>
                      {linkedTask.description && <p className="text-xs text-muted-foreground">{linkedTask.description}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSearchParams((params) => {
                          params.delete('taskId')
                          return params
                        })
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Session progress will be logged to this task.</p>
                </div>
              )}
              {taskError && <p className="text-sm text-destructive">{taskError}</p>}
              {/* Timer Display */}
              <div className="relative flex items-center justify-center">
                <svg className="h-64 w-64 -rotate-90 transform">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                    className={isBreak ? 'text-secondary-foreground' : 'text-primary'}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {isBreak ? 'Recharge your energy' : 'Stay focused'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" onClick={toggleTimer}>
                  {isActive ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      {minutes === focusDurationDefault && seconds === 0 ? 'Start' : 'Resume'}
                    </>
                  )}
                </Button>
                <Button size="lg" variant="outline" onClick={resetTimer}>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reset
                </Button>
                {!isBreak && (
                  <Button size="lg" variant="outline" onClick={skipToBreak}>
                    <Coffee className="mr-2 h-5 w-5" />
                    Start Break
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
                <div className="text-center">
                  <div className="text-3xl font-semibold text-primary">{completedSessions}</div>
                  <div className="text-sm text-muted-foreground">Sessions Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-semibold text-secondary-foreground">
                    {completedSessions * focusDurationDefault}
                  </div>
                  <div className="text-sm text-muted-foreground">Minutes Focused</div>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-lg bg-secondary p-4">
                <h4 className="mb-2 text-sm font-medium">Focus Tips:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Put your phone in another room</li>
                  <li>• Have water nearby</li>
                  <li>• One task at a time</li>
                  <li>• It's okay to take breaks when you need them</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {sessionReview && (
            <Card className="mt-8 border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Log your focused work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">
                    How did it feel? Capture a quick reflection so future you can see the pattern.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="focus-rating" className="text-sm text-muted-foreground">
                      Focus rating (1-10)
                    </Label>
                    <Input
                      id="focus-rating"
                      type="number"
                      min={1}
                      max={10}
                      value={focusRating}
                      onChange={(event) => setFocusRating(Math.max(1, Math.min(10, Number(event.target.value))))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tasks-logged" className="text-sm text-muted-foreground">
                      Tasks completed this session
                    </Label>
                    <Input
                      id="tasks-logged"
                      type="number"
                      min={0}
                      max={10}
                      value={tasksLogged}
                      onChange={(event) => setTasksLogged(Math.max(0, Math.min(10, Number(event.target.value))))}
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button variant="outline" className="w-full" onClick={handleSkipLogging} disabled={loggingSession}>
                    {loggingSession ? 'Skipping...' : 'Skip logging'}
                  </Button>
                  <Button className="w-full" onClick={handleSessionSubmit} disabled={loggingSession}>
                    {loggingSession ? 'Saving...' : 'Save reflection'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </PageContainer>
      </main>

      {sessionReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <Card className="w-full max-w-md border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Great work!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You logged {sessionReview.duration} minutes of focused time. Finish up by noting how it felt.
              </p>
              <div>
                <Label className="text-sm text-muted-foreground">Reflection prompt</Label>
                <div className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  What helped you stay present? What mouthfuls of the task did you complete?
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Button variant="outline" onClick={handleSkipLogging} disabled={loggingSession}>
                  {loggingSession ? 'Skipping...' : 'Skip'}
                </Button>
                <Button onClick={handleSessionSubmit} disabled={loggingSession}>
                  {loggingSession ? 'Saving...' : 'Log session'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}