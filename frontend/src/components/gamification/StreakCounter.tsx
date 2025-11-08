import React from 'react'
import { Flame, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Flame className="w-10 h-10 text-orange-400" />
              {currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {currentStreak}
                </div>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{currentStreak} days</div>
              <div className="text-sm text-orange-300">Current streak</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-400">
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