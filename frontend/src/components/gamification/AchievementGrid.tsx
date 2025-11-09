import React from 'react'
import type { Achievement } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AchievementGridProps {
  achievements: Achievement[]
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  if (achievements.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="py-6 text-sm text-muted-foreground text-center">
          Unlock badges as you build streaks and log focused sessions.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <Card key={achievement.id} className="border border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <span className="text-xl">{achievement.badge_icon ?? '🎖️'}</span>
              {achievement.badge_name}
            </CardTitle>
            {achievement.milestone_value ? (
              <Badge variant="outline">Lv {achievement.milestone_value}</Badge>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-2">
            {achievement.badge_description ? (
              <p className="text-sm text-muted-foreground">{achievement.badge_description}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Earned {new Date(achievement.earned_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

