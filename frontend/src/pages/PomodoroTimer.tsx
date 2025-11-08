import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Pause, RotateCcw, Coffee } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function PomodoroTimer() {
  const navigate = useNavigate()
  const { profile } = useStore()
  const [minutes, setMinutes] = useState(profile?.preferred_study_duration || 25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)

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

  const handleTimerComplete = () => {
    setIsActive(false)
    if (isBreak) {
      // Break completed, start work session
      setIsBreak(false)
      setMinutes(profile?.preferred_study_duration || 25)
      setSeconds(0)
    } else {
      // Work session completed
      setCompletedSessions(completedSessions + 1)
      setIsBreak(true)
      setMinutes(profile?.break_duration || 5)
      setSeconds(0)
    }
    // Play a sound or show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(isBreak ? 'Break complete!' : 'Session complete!', {
        body: isBreak ? 'Time to get back to work' : 'Take a well-deserved break',
        icon: '/vite.svg'
      })
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
    setMinutes(profile?.preferred_study_duration || 25)
    setSeconds(0)
  }

  const progress = isBreak
    ? ((((profile?.break_duration || 5) * 60 - (minutes * 60 + seconds)) / ((profile?.break_duration || 5) * 60)) * 100)
    : ((((profile?.preferred_study_duration || 25) * 60 - (minutes * 60 + seconds)) / ((profile?.preferred_study_duration || 25) * 60)) * 100)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {isBreak ? (
                <span className="flex items-center justify-center gap-2 text-green-400">
                  <Coffee className="w-6 h-6" />
                  Break Time
                </span>
              ) : (
                <span className="text-purple-400">Focus Session</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Timer Display */}
            <div className="relative flex items-center justify-center">
              <svg className="w-64 h-64 transform -rotate-90">
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
                  className={isBreak ? 'text-green-500' : 'text-purple-500'}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {isBreak ? 'Recharge your energy' : 'Stay focused'}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={toggleTimer} className={isBreak ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}>
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {minutes === (profile?.preferred_study_duration || 25) && seconds === 0 ? 'Start' : 'Resume'}
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" onClick={resetTimer}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{completedSessions}</div>
                <div className="text-sm text-muted-foreground">Sessions Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{completedSessions * (profile?.preferred_study_duration || 25)}</div>
                <div className="text-sm text-muted-foreground">Minutes Focused</div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-secondary rounded-lg p-4">
              <h4 className="font-medium mb-2 text-sm">Focus Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Put your phone in another room</li>
                <li>• Have water nearby</li>
                <li>• One task at a time</li>
                <li>• It's okay to take breaks when you need them</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}