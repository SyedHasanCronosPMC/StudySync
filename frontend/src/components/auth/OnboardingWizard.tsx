import React, { useState } from 'react'
import { callAppFunction } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Loader2, Brain, Heart, Sparkles, Target } from 'lucide-react'

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: '',
    has_adhd: false,
    has_dyslexia: false,
    has_anxiety: false,
    has_autism: false,
    preferred_study_duration: 25,
    daily_goal_minutes: 60,
    best_study_times: ['morning'],
  })

  const handleComplete = async () => {
    setLoading(true)
    try {
      await callAppFunction('profile.update', {
        ...formData,
        onboarding_completed: true,
      })
      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="text-7xl mb-4">👋</div>
            </div>
            <h2 className="text-2xl font-bold text-center text-foreground">
              Welcome to StudySync!
            </h2>
            <p className="text-muted-foreground text-center">
              Let's personalize your experience. This will only take a minute.
            </p>
            <div className="space-y-2">
              <Label htmlFor="name">What should we call you?</Label>
              <Input
                id="name"
                placeholder="Your name or nickname"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>
            <Button onClick={() => setStep(2)} className="w-full" disabled={!formData.display_name}>
              Continue
            </Button>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Brain className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">
              Tell us about your learning style
            </h2>
            <p className="text-muted-foreground text-center">
              This helps us personalize your experience. Select all that apply:
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label htmlFor="adhd" className="text-base font-medium">ADHD</Label>
                  <p className="text-sm text-muted-foreground">Task breakdown, timers, gentle reminders</p>
                </div>
                <Switch
                  id="adhd"
                  checked={formData.has_adhd}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_adhd: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label htmlFor="dyslexia" className="text-base font-medium">Dyslexia</Label>
                  <p className="text-sm text-muted-foreground">Clear fonts, reduced text density</p>
                </div>
                <Switch
                  id="dyslexia"
                  checked={formData.has_dyslexia}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_dyslexia: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label htmlFor="anxiety" className="text-base font-medium">Anxiety</Label>
                  <p className="text-sm text-muted-foreground">Calming design, no pressure, positive focus</p>
                </div>
                <Switch
                  id="anxiety"
                  checked={formData.has_anxiety}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_anxiety: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label htmlFor="autism" className="text-base font-medium">Autism</Label>
                  <p className="text-sm text-muted-foreground">Clear structure, predictable routines</p>
                </div>
                <Switch
                  id="autism"
                  checked={formData.has_autism}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_autism: checked })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="w-full">
                Continue
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Target className="w-16 h-16 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center">
              Set your study preferences
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred study session length</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.preferred_study_duration}
                  onChange={(e) => setFormData({ ...formData, preferred_study_duration: parseInt(e.target.value) })}
                >
                  <option value={15}>15 minutes</option>
                  <option value={25}>25 minutes (Pomodoro)</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Daily study goal</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.daily_goal_minutes}
                  onChange={(e) => setFormData({ ...formData, daily_goal_minutes: parseInt(e.target.value) })}
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Best time to study</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.best_study_times[0]}
                  onChange={(e) => setFormData({ ...formData, best_study_times: [e.target.value] })}
                >
                  <option value="morning">Morning (6 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                  <option value="evening">Evening (6 PM - 10 PM)</option>
                  <option value="night">Night (10 PM - 2 AM)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                Back
              </Button>
              <Button onClick={handleComplete} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Let's Go!
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border border-border">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-muted-foreground">Step {step} of 3</div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full ${s <= step ? 'bg-primary' : 'bg-secondary'}`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>
    </div>
  )
}