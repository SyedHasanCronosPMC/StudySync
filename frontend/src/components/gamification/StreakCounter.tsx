import React from 'react'
import { Flame, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  return (
    <Card className="border border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Flame className="w-10 h-10 text-primary" />
              {currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {currentStreak}
                </div>
              )}
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{currentStreak} days</div>
              <div className="text-sm text-muted-foreground">Current streak</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">{longestStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Best streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}