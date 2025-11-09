import { supabase, type DailyCheckIn, type HabitSummary, type UserProfile } from './supabase'

async function getCurrentUserEmail(userId: string) {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user?.id === userId ? data.user?.email ?? null : null
}

export async function fetchOrCreateProfile(userId: string): Promise<UserProfile> {
  const { data: existing, error: fetchError, status } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (fetchError && status !== 406) {
    throw fetchError
  }

  if (existing) {
    return existing
  }

  const email = await getCurrentUserEmail(userId)
  const displayName = email ? email.split('@')[0] : 'Friend'

  const defaultProfile = {
    id: userId,
    display_name: displayName,
    onboarding_completed: false,
  }

  const { data: created, error: insertError } = await supabase
    .from('user_profiles')
    .insert(defaultProfile)
    .select('*')
    .single()

  if (insertError) {
    throw insertError
  }

  return created
}

export async function fetchTodayCheckIn(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error, status } = await supabase
    .from('daily_check_ins')
    .select('*')
    .eq('user_id', userId)
    .eq('check_in_date', today)
    .maybeSingle()

  if (error && status !== 406) {
    throw error
  }

  return data ?? null
}

export async function fetchHabitSummary(days: number, userId: string): Promise<HabitSummary> {
  const windowDays = Math.max(1, Math.min(30, Math.floor(Number(days ?? 7))))
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - (windowDays - 1))
  const fromIso = fromDate.toISOString().split('T')[0]

  const [{ data: profile, error: profileError }, { data: checkIns, error: checkInsError }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select(
        'current_streak, longest_streak, total_study_minutes, total_tasks_completed, experience_points, level, best_study_times, daily_goal_minutes',
      )
      .eq('id', userId)
      .single(),
    supabase
      .from('daily_check_ins')
      .select('check_in_date, study_minutes, tasks_completed, focus_score')
      .eq('user_id', userId)
      .gte('check_in_date', fromIso)
      .order('check_in_date', { ascending: true }),
  ])

  if (profileError) throw profileError
  if (checkInsError) throw checkInsError

  const dailyRecords = (checkIns ?? []) as DailyCheckIn[]
  const totalMinutes = dailyRecords.reduce((sum, day) => sum + (day.study_minutes ?? 0), 0)
  const totalTasks = dailyRecords.reduce((sum, day) => sum + (day.tasks_completed ?? 0), 0)
  const focusValues = dailyRecords
    .map((day) => day.focus_score)
    .filter((score): score is number => typeof score === 'number')
  const averageFocus =
    focusValues.length > 0 ? Math.round(focusValues.reduce((sum, score) => sum + score, 0) / focusValues.length) : null
  const activeDays = dailyRecords.filter((day) => (day.study_minutes ?? 0) > 0 || (day.tasks_completed ?? 0) > 0).length
  const consistencyRate = windowDays > 0 ? Math.round((activeDays / windowDays) * 100) : 0

  let bestDay: string | null = null
  let bestMinutes = -1
  for (const day of dailyRecords) {
    const minutes = day.study_minutes ?? 0
    if (minutes > bestMinutes) {
      bestMinutes = minutes
      bestDay = day.check_in_date
    }
  }

  const daily = Array.from({ length: windowDays }).map((_, index) => {
    const date = new Date(fromDate)
    date.setDate(fromDate.getDate() + index)
    const iso = date.toISOString().split('T')[0]
    const record =
      dailyRecords.find((day) => day.check_in_date === iso) ?? ({ check_in_date: iso } as Partial<DailyCheckIn>)

    return {
      check_in_date: iso,
      study_minutes: record.study_minutes ?? 0,
      tasks_completed: record.tasks_completed ?? 0,
      focus_score: record.focus_score ?? null,
    }
  })

  return {
    profile: profile as HabitSummary['profile'],
    window: windowDays,
    totals: {
      minutes: totalMinutes,
      tasks: totalTasks,
      focus: averageFocus,
      consistencyRate,
      bestDay,
    },
    daily,
  }
}

