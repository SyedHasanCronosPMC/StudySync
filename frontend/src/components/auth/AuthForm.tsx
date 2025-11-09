import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Loader2 } from 'lucide-react'

interface AuthFormProps {
  onSuccess: () => void
  mode?: 'login' | 'signup'
}

export function AuthForm({ onSuccess, mode = 'login' }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onSuccess()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        })
        if (error) throw error
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation required
          setError('✉️ Success! Please check your email to confirm your account before signing in.')
          setIsLogin(true) // Switch to login mode after sign up
        } else if (data.session) {
          // User is authenticated (email confirmation disabled)
          onSuccess()
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-border">
          <CardHeader className="space-y-3">
            <div className="mb-4 flex justify-center">
              <div className="text-6xl">🧠</div>
            </div>
            <CardTitle className="text-center text-3xl text-foreground">
              StudySync
            </CardTitle>
            <CardDescription className="text-center text-base text-muted-foreground">
              Your AI accountability buddy for focused, consistent learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              {error && (
                <div
                  className={`text-sm rounded-md p-3 ${
                    error.includes('Success') || error.includes('✉️')
                      ? 'border border-primary/30 bg-accent text-primary-foreground'
                      : 'border border-destructive/30 bg-destructive/10 text-destructive'
                  }`}
                >
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Signing up...'}
                  </>
                ) : (
                  <>{isLogin ? 'Sign In' : 'Sign Up'}</>
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-primary hover:underline"
                  disabled={loading}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}