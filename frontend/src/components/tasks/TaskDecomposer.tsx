import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loader2, Sparkles } from 'lucide-react'

interface TaskDecomposerProps {
  onTaskCreated?: (tasks: any) => void
}

export function TaskDecomposer({ onTaskCreated }: TaskDecomposerProps) {
  const { user, profile } = useStore()
  const [taskInput, setTaskInput] = useState('')
  const [isDecomposing, setIsDecomposing] = useState(false)
  const [decomposedTasks, setDecomposedTasks] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleDecompose = async () => {
    if (!taskInput.trim()) return

    setIsDecomposing(true)
    setError(null)

    try {
      const { data, error } = await supabase.functions.invoke('decompose-task', {
        body: {
          user_id: user.id,
          task_input: taskInput,
          user_profile: {
            conditions: [
              profile?.has_adhd && 'ADHD',
              profile?.has_dyslexia && 'dyslexia',
              profile?.has_anxiety && 'anxiety',
              profile?.has_autism && 'autism',
            ].filter(Boolean),
            preferred_duration: profile?.preferred_study_duration || 25,
          },
        },
      })

      if (error) throw error

      setDecomposedTasks(data.subtasks)
      if (onTaskCreated) onTaskCreated(data)
      setTaskInput('')
    } catch (error: any) {
      console.error('Error decomposing task:', error)
      setError(error.message || 'Failed to decompose task')
    } finally {
      setIsDecomposing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="e.g., Study for math exam"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleDecompose()}
          className="bg-secondary border-border"
          disabled={isDecomposing}
        />
        <Button
          onClick={handleDecompose}
          disabled={isDecomposing || !taskInput.trim()}
          className="shrink-0"
        >
          {isDecomposing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md p-3">
          {error}
        </div>
      )}

      {decomposedTasks.length > 0 && (
        <Card className="bg-secondary border-border p-4 space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            I've broken this down into manageable chunks for you:
          </p>
          {decomposedTasks.map((task, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-background rounded-md hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-400 font-semibold">{idx + 1}.</span>
                <span className="text-foreground">{task.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">{task.duration_minutes} min</span>
            </div>
          ))}
          <Button className="w-full mt-3 bg-green-600 hover:bg-green-700" onClick={() => setDecomposedTasks([])}>
            Start with Task #1
          </Button>
        </Card>
      )}
    </div>
  )
}