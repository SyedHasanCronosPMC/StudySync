import React from 'react'
import { formatDuration } from '@/lib/utils'

interface ProgressRingsProps {
  studyMinutes: number
  goalMinutes: number
  tasksCompleted: number
  focusScore: number
}

export function ProgressRings({ studyMinutes, goalMinutes, tasksCompleted, focusScore }: ProgressRingsProps) {
  const studyProgress = Math.min((studyMinutes / goalMinutes) * 100, 100)
  const taskProgress = Math.min((tasksCompleted / 5) * 100, 100) // Assume 5 tasks as goal
  const focusProgress = (focusScore / 10) * 100

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - studyProgress / 100)}`}
              className="text-primary transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{Math.round(studyProgress)}%</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-sm font-medium">Study Time</div>
          <div className="text-xs text-muted-foreground">
            {formatDuration(studyMinutes)} / {formatDuration(goalMinutes)}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - taskProgress / 100)}`}
              className="text-primary/70 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{tasksCompleted}</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-sm font-medium">Tasks Done</div>
          <div className="text-xs text-muted-foreground">Today</div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - focusProgress / 100)}`}
              className="text-primary/40 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{focusScore || 0}/10</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-sm font-medium">Focus Score</div>
          <div className="text-xs text-muted-foreground">Average</div>
        </div>
      </div>
    </div>
  )
}