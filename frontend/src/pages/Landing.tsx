import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Target, Users, CheckCircle, Calendar, Clock, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" /> Calm focus in five minutes
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                Build a study rhythm that feels gentle—and actually sticks.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                StudySync blends quick rituals, adaptive AI nudges, and quiet buddy accountability so you can start, stay, and finish without the guilt spiral.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="px-8 text-base font-semibold" onClick={() => navigate('/signup')}>
                  Start free trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 text-base font-semibold"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Watch the flow
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                  <CheckCircle className="h-4 w-4 text-primary" /> Designed for ADHD & dyslexia
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                  <Clock className="h-4 w-4 text-primary" /> 15-minute onboarding
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                  <Users className="h-4 w-4 text-primary" /> 500+ learners held accountable
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60 text-primary-foreground shadow-2xl">
                <div className="absolute -top-16 -left-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" aria-hidden="true" />
                <div className="absolute -bottom-20 right-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
                <div className="relative space-y-6 p-8">
                  <div className="flex items-center justify-between rounded-2xl bg-black/10 px-4 py-3">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-primary-foreground/70">Tonight&apos;s pace</p>
                      <p className="text-lg font-semibold">Focus + Reflect</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">25:00</p>
                      <p className="text-xs text-primary-foreground/70">gentle timer</p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl bg-black/10 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/70">Micro-plan</h3>
                    <div className="space-y-2 text-sm">
                      <div className="rounded-lg bg-white/15 px-4 py-3">
                        <p className="font-semibold">1. Settle in (2 min)</p>
                        <p className="text-xs text-primary-foreground/70">Breathe + choose your win</p>
                      </div>
                      <div className="rounded-lg bg-white/10 px-4 py-3">
                        <p className="font-semibold">2. Focus sprint (20 min)</p>
                        <p className="text-xs text-primary-foreground/70">Stay on the single next step</p>
                      </div>
                      <div className="rounded-lg bg-white/15 px-4 py-3">
                        <p className="font-semibold">3. Gentle check-in (3 min)</p>
                        <p className="text-xs text-primary-foreground/70">Celebrate + set tomorrow&apos;s cue</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-2xl bg-black/5 p-5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/15 text-lg">🧘‍♀️</span>
                      <div>
                        <p className="font-semibold">Energy check</p>
                        <p className="text-xs text-primary-foreground/70">“Feeling scattered—give me a gentle start.”</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/15 text-lg">🤝</span>
                      <div>
                        <p className="font-semibold">Buddy pulse</p>
                        <p className="text-xs text-primary-foreground/70">Jess just logged a session—ready when you are.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ritual snapshot */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                <Sparkles className="h-4 w-4 text-primary" /> Gentle structure that guides you back
              </span>
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Daily rituals that make starting feel safe</h2>
              <p className="text-lg text-muted-foreground">
                Morning intentions, adaptive AI encouragement, and calming evening reflections ensure every session has a beginning, middle, and end—without the pressure spiral.
              </p>
              <ul className="grid gap-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-1 h-4 w-4 text-primary" /> Set one achievable focus with a 30-second prompt.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-1 h-4 w-4 text-primary" /> Get tone-matched encouragement that keeps momentum gentle.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-1 h-4 w-4 text-primary" /> Close the loop with a celebratory reflection and streak boost.
                </li>
              </ul>
              <Button variant="ghost" className="px-0" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                See the StudySync loop ➜
              </Button>
            </div>
            <div>
              <Card className="border-border bg-card p-6 shadow-sm">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Daily check-in</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">“What’s one win you want today?”</p>
                    <div className="mt-4 grid gap-2 text-sm">
                      {['Prep slides for Biology', 'Review Spanish verbs', 'Email project partner'].map((option) => (
                        <span key={option} className="rounded-lg border border-border bg-secondary px-3 py-2 text-secondary-foreground">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-accent px-4 py-6">
                    <p className="text-sm font-semibold text-foreground">AI encouragement</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      “Half an hour is enough to move things forward today. I’ll check back tonight—celebrate the effort.”
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="bg-card py-16">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Why most study tools fall short</h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Learners don’t just need more content—they need steady accountability, pacing support, and an environment that reduces pressure.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <Clock className="h-6 w-6 text-primary" />,
                  title: 'Time blindness',
                  description: 'Big tasks stay vague. StudySync breaks them into friendly bursts with clear estimates.',
                },
                {
                  icon: <Target className="h-6 w-6 text-primary" />,
                  title: 'No pacing partner',
                  description: 'Our daily nudges keep you coming back without guilt trips or rigid schedules.',
                },
                {
                  icon: <Heart className="h-6 w-6 text-primary" />,
                  title: 'Emotional load',
                  description: 'Check-ins adapt to your energy so low days get gentleness and high days get momentum.',
                },
              ].map((item) => (
                <Card key={item.title} className="flex h-full flex-col items-start gap-4 border-border bg-background p-6 text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">A three-part habit loop</h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Consistent study time built around calming rituals, AI structure, and supportive community rooms.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Calendar className="h-6 w-6 text-primary" />,
                title: 'Morning check-in',
                points: ['Set intention in under 60 seconds', 'AI adapts to mood + energy', 'Build streaks without pressure'],
              },
              {
                icon: <Brain className="h-6 w-6 text-primary" />,
                title: 'Task breakdown',
                points: ['Turn “study chemistry” into 3 steps', 'Executive function support by default', 'Export to your planner or timer'],
              },
              {
                icon: <Users className="h-6 w-6 text-primary" />,
                title: 'Focus rooms',
                points: ['Join peers quietly working', 'Timers and breaks built-in', 'Celebrate wins in 30-second recaps'],
              },
            ].map((card) => (
              <Card key={card.title} className="flex h-full flex-col gap-4 border-border bg-card p-6 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">{card.icon}</div>
                <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Differentiators */}
        <section className="bg-secondary py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Gentle, honest motivation</h2>
              <p className="mt-3 text-base text-muted-foreground md:text-lg">
                StudySync meets you where you are and nudges you forward with language that feels human.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'YC-inspired clarity',
                  description: 'Clean coral accents, lots of whitespace, typography that stays calm under pressure.',
                },
                {
                  title: 'Flexible sessions',
                  description: 'Pick 15, 30, or 45 minutes. We’ll remind you to break without the “try harder” tone.',
                },
                {
                  title: 'Energy-aware nudges',
                  description: 'Low energy? We suggest a tiny win. High energy? Capture momentum safely.',
                },
                {
                  title: 'Progress you can feel',
                  description: 'Daily rings, weekly insights, and personal trends you can share with mentors.',
                },
              ].map((feature) => (
                <Card key={feature.title} className="border-border bg-card p-5">
                  <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Learners who finally found consistency</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                quote: '“StudySync is the only tool that checks in without judgment. My 14-day streak feels achievable.”',
                name: 'Sarah, ADHD student',
              },
              {
                quote: '“Task breakdowns give me a starting line. I open the app when I feel stuck, not guilty.”',
                name: 'Marcus, dyslexia learner',
              },
              {
                quote: '“Study rooms make me feel supported even when I’m quiet. We all hit start together.”',
                name: 'Anya, remote undergrad',
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="flex h-full flex-col gap-4 border-border bg-card p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">{testimonial.quote}</p>
                <span className="text-sm font-semibold text-foreground">{testimonial.name}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-card py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Simple pricing for real habits</h2>
              <p className="mt-3 text-base text-muted-foreground md:text-lg">Free to start. Upgrade when daily check-ins become your thing.</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Card className="border-border bg-background p-6">
                <div className="mb-6 space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Starter</h3>
                  <p className="text-3xl font-bold text-foreground">$0</p>
                  <p className="text-sm text-muted-foreground">One check-in a day, core focus tools.</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Morning + evening prompts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    AI task suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Shared study rooms
                  </li>
                </ul>
                <Button variant="outline" className="mt-6 w-full" onClick={() => navigate('/signup')}>
                  Try for free
                </Button>
              </Card>
              <Card className="border border-primary bg-background p-6">
                <div className="mb-6 space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Focus</h3>
                  <p className="text-3xl font-bold text-foreground">$18</p>
                  <p className="text-sm text-muted-foreground">Unlimited check-ins, analytics, and buddy matching.</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Unlimited AI check-ins
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Weekly insight reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Private study circles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Buddy matching experiments
                  </li>
                </ul>
                <Button className="mt-6 w-full" onClick={() => navigate('/signup')}>
                  Start 7-day trial
                </Button>
              </Card>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">Students with .edu email save 20%. Cancel anytime.</p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}