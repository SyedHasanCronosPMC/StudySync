import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Flame, Clock, Target, TrendingUp } from 'lucide-react'
import type { HabitSummary } from '@/lib/supabase'

interface HabitSummaryProps {
  summary: HabitSummary
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function formatDateLabel(date?: string | null) {
  if (!date) return '—'
  const parsed = new Date(date + 'T00:00:00')
  if (Number.isNaN(parsed.valueOf())) return date
  return parsed.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function HabitSummaryCard({ summary }: HabitSummaryProps) {
  const { totals, window, daily } = summary
  const consistencyProgress = Math.min(100, Math.max(0, totals.consistencyRate))
  const bestDayLabel = formatDateLabel(totals.bestDay)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium text-foreground">This Week&apos;s Focus</CardTitle>
          <Clock className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-foreground">{formatMinutes(totals.minutes)}</p>
          <p className="text-sm text-muted-foreground">
            Across the last {window} days. Keep building the habit one session at a time.
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Consistency</span>
              <span>{consistencyProgress}%</span>
            </div>
            <Progress value={consistencyProgress} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium text-foreground">Streak & Energy</CardTitle>
          <Flame className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tasks completed</span>
            <span className="font-medium text-foreground">{totals.tasks}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Average focus</span>
            <span className="font-medium text-foreground">{totals.focus ?? '—'}/10</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Best day</span>
            <span className="font-medium text-foreground">{bestDayLabel}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium text-foreground">Daily breakdown</CardTitle>
          <TrendingUp className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          {daily.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet. Your first check-in will appear here.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {daily.map((day) => (
                <div key={day.check_in_date} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{formatDateLabel(day.check_in_date)}</span>
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>Minutes: {day.study_minutes ?? 0}</div>
                    <div>Tasks: {day.tasks_completed ?? 0}</div>
                    <div>Focus: {day.focus_score ?? '—'}/10</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

