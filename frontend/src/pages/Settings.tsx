import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { callAppFunction } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageBreadcrumbs } from '@/components/layout/PageBreadcrumbs'
import { ArrowLeft, Save, User, Brain, Palette, Lock } from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate()
  const { user, profile, setProfile, setUser } = useStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    has_adhd: profile?.has_adhd || false,
    has_dyslexia: profile?.has_dyslexia || false,
    has_anxiety: profile?.has_anxiety || false,
    has_autism: profile?.has_autism || false,
    preferred_study_duration: profile?.preferred_study_duration || 25,
    break_duration: profile?.break_duration || 5,
    daily_goal_minutes: profile?.daily_goal_minutes || 60,
    dark_mode: profile?.dark_mode ?? true,
    reduce_animations: profile?.reduce_animations || false,
    larger_text: profile?.larger_text || false,
    high_contrast: profile?.high_contrast || false,
    audio_instructions: profile?.audio_instructions || false,
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        has_adhd: profile.has_adhd,
        has_dyslexia: profile.has_dyslexia,
        has_anxiety: profile.has_anxiety,
        has_autism: profile.has_autism,
        preferred_study_duration: profile.preferred_study_duration,
        break_duration: profile.break_duration,
        daily_goal_minutes: profile.daily_goal_minutes,
        dark_mode: profile.dark_mode,
        reduce_animations: profile.reduce_animations,
        larger_text: profile.larger_text,
        high_contrast: profile.high_contrast,
        audio_instructions: profile.audio_instructions,
      })
    }
  }, [profile])

  useEffect(() => {
    // Apply accessibility settings
    const html = document.documentElement
    html.classList.toggle('reduce-motion', formData.reduce_animations)
    html.classList.toggle('larger-text', formData.larger_text)
    html.classList.toggle('high-contrast', formData.high_contrast)
  }, [formData.reduce_animations, formData.larger_text, formData.high_contrast])

  const handleSave = async () => {
    setLoading(true)
    try {
      const { profile: updatedProfile } = await callAppFunction('profile.update', formData)
      setProfile(updatedProfile)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!user?.email) {
      setPasswordError('You need to be signed in to update your password.')
      return
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordLoading(true)
    setPasswordError(null)

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      })

      if (signInError) {
        throw new Error('Current password is incorrect.')
      }

      if (signInData?.user) {
        setUser(signInData.user)
      }

      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      if (updateData?.user) {
        setUser(updateData.user)
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      alert('Password updated successfully!')
    } catch (error: any) {
      const message =
        typeof error?.message === 'string' ? error.message : 'Unable to update password right now.'
      setPasswordError(message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 py-8">
        <PageContainer className="space-y-6">
          <PageBreadcrumbs
            className="text-xs sm:text-sm"
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Settings' },
            ]}
          />
          <Button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="mb-2 text-3xl font-semibold text-foreground">
            Settings
          </h1>
          <p className="mb-8 text-muted-foreground">Personalize your StudySync experience</p>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile
                </CardTitle>
                <CardDescription>Your basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="How should we address you?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </CardContent>
            </Card>

            {/* Learning Profile */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Learning Profile
                </CardTitle>
                <CardDescription>Help us personalize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="adhd">ADHD</Label>
                    <p className="text-sm text-muted-foreground">Task breakdown, timers, gentle reminders</p>
                  </div>
                  <Switch
                    id="adhd"
                    checked={formData.has_adhd}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_adhd: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dyslexia">Dyslexia</Label>
                    <p className="text-sm text-muted-foreground">Clear fonts, reduced text density</p>
                  </div>
                  <Switch
                    id="dyslexia"
                    checked={formData.has_dyslexia}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_dyslexia: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="anxiety">Anxiety</Label>
                    <p className="text-sm text-muted-foreground">Calming design, no pressure</p>
                  </div>
                  <Switch
                    id="anxiety"
                    checked={formData.has_anxiety}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_anxiety: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autism">Autism</Label>
                    <p className="text-sm text-muted-foreground">Clear structure, predictable routines</p>
                  </div>
                  <Switch
                    id="autism"
                    checked={formData.has_autism}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_autism: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Study Preferences */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Study Preferences</CardTitle>
                <CardDescription>Customize your study sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Session Duration</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.preferred_study_duration}
                    onChange={(e) =>
                      setFormData({ ...formData, preferred_study_duration: parseInt(e.target.value) })
                    }
                  >
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={25}>25 minutes (Pomodoro)</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Break Duration</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.break_duration}
                    onChange={(e) => setFormData({ ...formData, break_duration: parseInt(e.target.value) })}
                  >
                    <option value={3}>3 minutes</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Daily Study Goal</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.daily_goal_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, daily_goal_minutes: parseInt(e.target.value) })
                    }
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                    <option value={240}>4 hours</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Accessibility
                </CardTitle>
                <CardDescription>Customize the interface for your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reduce-animations">Reduce Animations</Label>
                    <p className="text-sm text-muted-foreground">Minimize motion for better focus</p>
                  </div>
                  <Switch
                    id="reduce-animations"
                    checked={formData.reduce_animations}
                    onCheckedChange={(checked) => setFormData({ ...formData, reduce_animations: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="larger-text">Larger Text</Label>
                    <p className="text-sm text-muted-foreground">Increase font size for readability</p>
                  </div>
                  <Switch
                    id="larger-text"
                    checked={formData.larger_text}
                    onCheckedChange={(checked) => setFormData({ ...formData, larger_text: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <p className="text-sm text-muted-foreground">Stronger colors for better visibility</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={formData.high_contrast}
                    onCheckedChange={(checked) => setFormData({ ...formData, high_contrast: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audio-instructions">Audio Instructions</Label>
                    <p className="text-sm text-muted-foreground">Hear instructions in addition to reading</p>
                  </div>
                  <Switch
                    id="audio-instructions"
                    checked={formData.audio_instructions}
                    onCheckedChange={(checked) => setFormData({ ...formData, audio_instructions: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Password */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password
                </CardTitle>
                <CardDescription>Update your login password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                <Button onClick={handlePasswordChange} disabled={passwordLoading} className="w-full md:w-auto">
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={loading} className="w-full" size="lg">
              {loading ? 'Saving...' : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </PageContainer>
      </main>

      <SiteFooter />
    </div>
  )
}