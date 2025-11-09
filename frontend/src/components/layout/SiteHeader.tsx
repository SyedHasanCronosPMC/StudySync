import React from 'react'
import { useNavigate, NavLink, useLocation } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const authenticatedLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Progress', path: '/progress' },
  { label: 'Study Rooms', path: '/study-rooms' },
  { label: 'Buddy', path: '/buddy' },
  { label: 'Pomodoro', path: '/pomodoro' },
  { label: 'Settings', path: '/settings' },
]

export function SiteHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useStore()

  const showAuthLinks = Boolean(user)

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(showAuthLinks ? '/dashboard' : '/')}
          className="flex items-center gap-2 text-foreground"
        >
          <Brain className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold">StudySync</span>
        </button>
        {showAuthLinks ? (
          <nav className="hidden items-center gap-4 md:flex">
            {authenticatedLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        ) : (
          <nav className="hidden items-center gap-4 md:flex">
            <button
              type="button"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className={cn(
                'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                location.pathname === '/' && 'text-foreground',
              )}
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </button>
          </nav>
        )}
        <div className="flex items-center gap-3">
          {showAuthLinks ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/settings')}>
                Settings
              </Button>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/signup')}>Get Started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

