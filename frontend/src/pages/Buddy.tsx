import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { callAppFunction } from '@/lib/api'
import type { BuddyOverview } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Loader2, UserPlus, Sparkles, HeartHandshake, CheckCircle2 } from 'lucide-react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageBreadcrumbs } from '@/components/layout/PageBreadcrumbs'

export default function Buddy() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<BuddyOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<'request' | 'cancel' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOverview()
  }, [])

  const loadOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await callAppFunction<BuddyOverview>('buddy.overview')
      setOverview(data)
    } catch (err) {
      console.error('Error loading buddy overview:', err)
      setError('Unable to load buddy status right now.')
    } finally {
      setLoading(false)
    }
  }

  const requestBuddy = async () => {
    setActionLoading('request')
    setError(null)
    try {
      const data = await callAppFunction<BuddyOverview>('buddy.request')
      setOverview(data)
    } catch (err: any) {
      console.error('Error requesting buddy:', err)
      setError(err?.message ?? 'Unable to start matching right now.')
    } finally {
      setActionLoading(null)
    }
  }

  const cancelBuddy = async () => {
    setActionLoading('cancel')
    setError(null)
    try {
      const data = await callAppFunction<BuddyOverview>('buddy.cancel')
      setOverview(data)
    } catch (err) {
      console.error('Error cancelling buddy request:', err)
      setError('Unable to update buddy status.')
    } finally {
      setActionLoading(null)
    }
  }

  const active = overview?.active ?? null
  const pending = overview?.pending ?? null

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 py-8">
          <PageContainer className="flex max-w-4xl flex-col gap-6">
            <PageBreadcrumbs
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Buddy Program' },
              ]}
              className="text-xs sm:text-sm"
            />
            <Card className="border border-border bg-card">
              <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking buddy status...
              </CardContent>
            </Card>
          </PageContainer>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-8">
        <PageContainer className="flex max-w-4xl flex-col gap-6">
          <PageBreadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Buddy Program' },
            ]}
            className="text-xs sm:text-sm"
          />
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Button>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Accountability Buddy</h1>
            <p className="text-muted-foreground">
              Pair with another learner who shows up. We match based on study goals, availability, and streak energy.
            </p>
          </div>

          {error && (
            <Card className="border border-destructive/40 bg-destructive/10">
              <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          {active ? (
            <ActiveBuddyCard buddy={active} onEnd={cancelBuddy} loading={actionLoading === 'cancel'} />
          ) : pending ? (
            <PendingBuddyCard onCancel={cancelBuddy} loading={actionLoading === 'cancel'} />
          ) : (
            <CallToActionCard onRequest={requestBuddy} loading={actionLoading === 'request'} />
          )}

          <HistoryCard history={overview?.history ?? []} />
        </PageContainer>
      </main>
      <SiteFooter />
    </div>
  )
}

function CallToActionCard({ onRequest, loading }: { onRequest: () => void; loading: boolean }) {
  return (
    <Card className="border border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Ready for a study buddy?
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          We&apos;ll match you with another learner who prefers similar session lengths and check-in habits. You both
          receive gentle nudges to show up.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Text-based accountability prompts twice a day</p>
          <p>• Weekly check-ins to celebrate streaks</p>
          <p>• Option to pause or swap anytime</p>
        </div>
        <Button onClick={onRequest} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Find me a buddy'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function PendingBuddyCard({ onCancel, loading }: { onCancel: () => void; loading: boolean }) {
  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Matching in progress
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          We&apos;re pairing you with someone whose study rhythm fits yours. You&apos;ll get a notification here once the
          match is confirmed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <p>This usually takes less than a minute during peak study times.</p>
          <p>If you change your mind, you can cancel and relaunch later.</p>
        </div>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel'}
        </Button>
      </CardContent>
    </Card>
  )
}

function ActiveBuddyCard({
  buddy,
  onEnd,
  loading,
}: {
  buddy: BuddyOverview['active']
  onEnd: () => void
  loading: boolean
}) {
  if (!buddy) return null

  const profile = buddy.buddy_profile

  return (
    <Card className="border border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.display_name ?? ''} /> : null}
            <AvatarFallback>{profile?.display_name?.slice(0, 2).toUpperCase() ?? 'BB'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              {profile?.display_name ?? 'Your new buddy'}
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Active
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Matched {new Date(buddy.matched_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </CardDescription>
          </div>
        </div>
        <Button variant="outline" onClick={onEnd} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'End partnership'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {profile?.current_streak ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HeartHandshake className="h-4 w-4 text-primary" />
            <span>{profile.current_streak}-day streak – great accountability energy.</span>
          </div>
        ) : null}
        {buddy.match_reasons && buddy.match_reasons.length > 0 ? (
          <div className="text-sm">
            <p className="font-medium text-foreground">Match details</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              {buddy.match_reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground">
          You&apos;ll both receive gentle nudges after each check-in. Celebrate wins together and share what worked.
        </p>
      </CardContent>
    </Card>
  )
}

function HistoryCard({ history }: { history: BuddyOverview['history'] }) {
  if (!history || history.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Past buddies</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Once you wrap a partnership it appears here with a quick recap.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">No previous partnerships yet.</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Past buddies</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          A quick look back at previous accountability partners.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map((entry) => {
          const profile = entry.buddy_profile
          return (
            <div key={entry.id} className="rounded-lg border border-border bg-background px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.display_name ?? ''} /> : null}
                    <AvatarFallback>{profile?.display_name?.slice(0, 2).toUpperCase() ?? 'BB'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{profile?.display_name ?? 'Study Buddy'}</p>
                    <p className="text-xs text-muted-foreground">
                      Matched {new Date(entry.matched_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{entry.status}</Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

