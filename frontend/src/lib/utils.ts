import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function getMotivationalMessage(
  profile: any | null,
  stats: { studyMinutes: number; tasksCompleted: number; focusScore: number }
): string {
  if (!profile) return "Let's make today count! 🌟"

  const messages = {
    morning_low_energy: "It's okay to start slow today. Small steps still move you forward. 🌱",
    morning_high_energy: "Your energy is great! Let's channel it into focused work. ⚡",
    has_streak: `${profile.current_streak} days strong! You're building amazing habits. 🔥",
    first_day: "Welcome to your journey! Remember, consistency beats perfection. 💜",
    made_progress: `You've already studied ${stats.studyMinutes} minutes today. Keep going! 🎯",
    evening: "Take a moment to reflect on today. You showed up, and that's what matters. ✨"
  }

  if (stats.studyMinutes > 0) return messages.made_progress
  if (profile.current_streak > 0) return messages.has_streak
  return messages.first_day
}

export function getDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function shouldShowMorningCheckIn(lastCheckIn: any): boolean {
  const now = new Date()
  const hour = now.getHours()
  const today = now.toISOString().split('T')[0]

  // Show morning check-in between 6 AM and 11 AM if not completed today
  if (hour >= 6 && hour <= 11) {
    if (!lastCheckIn) return true
    if (lastCheckIn.check_in_date !== today) return true
    if (!lastCheckIn.morning_completed_at) return true
  }
  return false
}

export function shouldShowEveningCheckIn(lastCheckIn: any): boolean {
  const now = new Date()
  const hour = now.getHours()
  const today = now.toISOString().split('T')[0]

  // Show evening check-in between 6 PM and 11 PM if not completed today
  if (hour >= 18 && hour <= 23) {
    if (!lastCheckIn) return false // Need morning check-in first
    if (lastCheckIn.check_in_date !== today) return false
    if (!lastCheckIn.evening_completed_at) return true
  }
  return false
}