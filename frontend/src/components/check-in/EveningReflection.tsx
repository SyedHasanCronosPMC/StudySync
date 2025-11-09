import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Moon, Sparkles } from 'lucide-react'
import { buildFunctionHeaders } from '@/lib/api'

interface EveningReflectionProps {
  onComplete: (data: any) => void
  onSkip: () => void
}

export function EveningReflection({ onComplete, onSkip }: EveningReflectionProps) {
  const [energy, setEnergy] = useState(5)
  const [wins, setWins] = useState('')
  const [challenges, setChallenges] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const headers = await buildFunctionHeaders()

      const { data, error } = await supabase.functions.invoke('check-in', {
        headers,
        body: {
          type: 'evening',
          responses: {
            energy,
            wins,
            challenges,
          },
        },
      })

      if (error) throw error

      setAiResponse(data.message)

      setTimeout(() => {
        onComplete(data)
      }, 3000)
    } catch (error) {
      console.error('Error submitting reflection:', error)
    } finally {
      setLoading(false)
    }
  }

  if (aiResponse) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <CardTitle>Reflection</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{aiResponse}</p>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Rest well, you've earned it 🌟</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-primary" />
            <CardTitle>Evening Reflection 🌙</CardTitle>
          </div>
          <CardDescription>Take a moment to reflect on your day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>How's your energy now? (1-10)</Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-2xl font-semibold text-primary w-8">{energy}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wins">What went well today? (Even small wins count!)</Label>
            <Textarea
              id="wins"
              placeholder="I showed up, I tried, I..."
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">What was challenging?</Label>
            <Textarea
              id="challenges"
              placeholder="No judgment, just awareness..."
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onSkip} className="w-full">
              Skip for now
            </Button>
            <Button onClick={handleSubmit} className="w-full" disabled={loading || !wins}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reflecting...
                </>
              ) : (
                'Complete Reflection'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}