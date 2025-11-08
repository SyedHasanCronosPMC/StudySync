import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sun, Sparkles } from 'lucide-react'

interface MorningCheckInProps {
  onComplete: (data: any) => void
}

export function MorningCheckIn({ onComplete }: MorningCheckInProps) {
  const { user } = useStore()
  const [energy, setEnergy] = useState(5)
  const [mood, setMood] = useState('')
  const [intention, setIntention] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('check-in', {
        body: {
          user_id: user.id,
          type: 'morning',
          responses: {
            energy,
            mood,
            intention,
          },
        },
      })

      if (error) throw error

      setAiResponse(data.message)
      
      // Wait a moment to show AI response, then complete
      setTimeout(() => {
        onComplete(data)
      }, 3000)
    } catch (error) {
      console.error('Error submitting check-in:', error)
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
              <Sparkles className="w-6 h-6 text-purple-400" />
              <CardTitle>Your AI Companion Says...</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{aiResponse}</p>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Let's make today count! 💪</p>
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
            <Sun className="w-6 h-6 text-yellow-400" />
            <CardTitle>Good Morning! 🌞</CardTitle>
          </div>
          <CardDescription>Let's start your day with a quick check-in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>How's your energy level? (1-10)</Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-2xl font-bold text-purple-400 w-8">{energy}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {energy <= 3 && 'Low energy - that\'s okay, we\'ll start gentle'}
              {energy > 3 && energy <= 7 && 'Moderate energy - perfect for steady progress'}
              {energy > 7 && 'High energy - let\'s make the most of it!'}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">How are you feeling today?</Label>
            <Input
              id="mood"
              placeholder="e.g., excited, anxious, tired..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intention">What's one thing you want to accomplish today?</Label>
            <Textarea
              id="intention"
              placeholder="Keep it simple and achievable..."
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={loading || !mood || !intention}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting your personalized message...
              </>
            ) : (
              'Complete Check-in'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

import { Input } from '@/components/ui/input'