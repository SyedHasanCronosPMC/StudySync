/// <reference path="../global.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

type HandlerContext = {
  supabase: any
  user: {
    id: string
    email?: string | null
    user_metadata?: Record<string, unknown>
  }
}

type Handler = (payload: any, ctx: HandlerContext) => Promise<any>

const PROFILE_FIELDS = [
  'display_name',
  'avatar_url',
  'has_adhd',
  'has_dyslexia',
  'has_anxiety',
  'has_autism',
  'preferred_study_duration',
  'break_duration',
  'daily_goal_minutes',
  'best_study_times',
  'dark_mode',
  'reduce_animations',
  'larger_text',
  'high_contrast',
  'audio_instructions',
  'onboarding_completed',
] as const

const VALID_TASK_STATUSES = new Set(['pending', 'in_progress', 'completed', 'skipped'])

const ACHIEVEMENTS = [
  {
    badge_type: 'streak',
    badge_name: 'Day One Starter',
    badge_description: 'Logged your first study day.',
    badge_icon: '🔥',
    milestone_value: 1,
    check: (profile: any) => (profile.current_streak ?? 0) >= 1,
  },
  {
    badge_type: 'streak',
    badge_name: 'Consistency Rising',
    badge_description: 'Maintained a 5-day streak.',
    badge_icon: '📆',
    milestone_value: 5,
    check: (profile: any) => (profile.current_streak ?? 0) >= 5,
  },
  {
    badge_type: 'focus',
    badge_name: 'Focus Apprentice',
    badge_description: 'Logged 300 minutes of focused study.',
    badge_icon: '⏱️',
    milestone_value: 300,
    check: (profile: any) => (profile.total_study_minutes ?? 0) >= 300,
  },
  {
    badge_type: 'focus',
    badge_name: 'Focus Master',
    badge_description: 'Logged 1000 minutes of focused study.',
    badge_icon: '🏆',
    milestone_value: 1000,
    check: (profile: any) => (profile.total_study_minutes ?? 0) >= 1000,
  },
  {
    badge_type: 'tasks',
    badge_name: 'Task Tackler',
    badge_description: 'Completed 20 tasks.',
    badge_icon: '✅',
    milestone_value: 20,
    check: (profile: any) => (profile.total_tasks_completed ?? 0) >= 20,
  },
]

async function ensureUserProfile(
  supabase: any,
  user: {
    id: string
    email?: string | null
    user_metadata?: Record<string, unknown>
  },
) {
  const { data: existing, error, status } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error && status !== 406) {
    throw error
  }

  if (existing) {
    return existing
  }

  const userMetadata = user.user_metadata as Record<string, unknown> | undefined
  const metadataDisplayName =
    typeof userMetadata?.['full_name'] === 'string'
      ? (userMetadata['full_name'] as string)
      : null

  const defaultProfile = {
    id: user.id,
    display_name: metadataDisplayName ??
      (user.email ? user.email.split('@')[0] : 'Friend'),
    onboarding_completed: false,
  }

  const { data: created, error: insertError } = await supabase
    .from('user_profiles')
    .insert(defaultProfile)
    .select()
    .single()

  if (insertError) {
    if ((insertError as { code?: string })?.code === '23505') {
      const { data: retryProfile, error: retryError, status: retryStatus } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (retryError && retryStatus !== 406) {
        throw retryError
      }

      if (retryProfile) {
        return retryProfile
      }
    }

    throw insertError
  }

  return created
}

async function evaluateAchievements(
  supabase: any,
  userId: string,
  profile: any,
) {
  const { data: existing, error } = await supabase
    .from('achievements')
    .select('badge_type, milestone_value')
    .eq('user_id', userId)

  if (error) throw error

  const owned = new Set((existing ?? []).map((row: any) => `${row.badge_type}:${row.milestone_value}`))
  const unlocked: any[] = []
  for (const achievement of ACHIEVEMENTS) {
    if (owned.has(`${achievement.badge_type}:${achievement.milestone_value}`)) {
      continue
    }
    if (achievement.check(profile)) {
      const insert = {
        user_id: userId,
        badge_type: achievement.badge_type,
        badge_name: achievement.badge_name,
        badge_description: achievement.badge_description,
        badge_icon: achievement.badge_icon,
        milestone_value: achievement.milestone_value,
      }
      const { data: created, error: insertError } = await supabase
        .from('achievements')
        .insert(insert)
        .select()
        .single()

      if (insertError) {
        if ((insertError as { code?: string })?.code === '23505') {
          continue
        }
        throw insertError
      }
      unlocked.push(created)
    }
  }
  return unlocked
}

async function getBuddyOverview(supabase: any, user: { id: string }) {
  const { data: rows, error } = await supabase
    .from('study_buddies')
    .select('id, user_id, buddy_id, status, matched_at, compatibility_score, match_reasons')
    .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`)
    .order('matched_at', { ascending: false })

  if (error) throw error

  const partnerIds = new Set<string>()
  for (const row of rows ?? []) {
    const buddyId = row.user_id === user.id ? row.buddy_id : row.user_id
    if (buddyId) partnerIds.add(buddyId)
  }

  let profiles: any[] = []
  if (partnerIds.size > 0) {
    const profileRes = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url, current_streak')
      .in('id', Array.from(partnerIds))

    if (profileRes.error) throw profileRes.error
    profiles = profileRes.data ?? []
  }

  const mapProfile = (buddyId: string | null) => {
    if (!buddyId) return null
    return profiles.find((profile: any) => profile.id === buddyId) ?? null
  }

  const makeEntry = (row: any) => {
    const buddyId = row.user_id === user.id ? row.buddy_id : row.user_id
    return {
      id: row.id,
      status: row.status,
      matched_at: row.matched_at,
      compatibility_score: row.compatibility_score,
      match_reasons: row.match_reasons ?? [],
      buddy_id: buddyId,
      buddy_profile: mapProfile(buddyId),
    }
  }

  const pendingRow = rows?.find((row: any) => row.status === 'pending' && row.user_id === user.id && !row.buddy_id) ?? null
  const activeRow = rows?.find((row: any) => row.status === 'active') ?? null
  const historyRows = (rows ?? []).filter((row: any) => row.status === 'ended' || row.status === 'paused')

  return {
    pending: pendingRow ? makeEntry(pendingRow) : null,
    active: activeRow ? makeEntry(activeRow) : null,
    history: historyRows.map(makeEntry),
  }
}

function parsePositiveInt(value: unknown, field: string) {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(`${field} must be a positive number`)
  }
  return Math.round(num)
}

function clampFocusScore(score: unknown) {
  if (score === null || score === undefined) return null
  const num = Number(score)
  if (!Number.isFinite(num)) return null
  const clamped = Math.max(1, Math.min(10, Math.round(num)))
  return clamped
}

function validateTaskStatus(status: unknown) {
  if (status === undefined || status === null) return null
  if (typeof status !== 'string') {
    throw new Error('status must be a string')
  }
  if (!VALID_TASK_STATUSES.has(status)) {
    throw new Error('Invalid task status')
  }
  return status
}

const handlers: Record<string, Handler> = {
  async 'profile.get'(_payload, { supabase, user }) {
    const profile = await ensureUserProfile(supabase, user)
    return { profile }
  },

  async 'profile.update'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const updates = Object.fromEntries(
      Object.entries(payload ?? {}).filter(([key]) =>
        PROFILE_FIELDS.includes(key as (typeof PROFILE_FIELDS)[number]),
      ),
    )

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields provided for update')
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    console.log(JSON.stringify({
      event: 'profile.updated',
      userId: user.id,
      fields: Object.keys(updates),
    }))

    return { profile }
  },

  async 'dashboard.load'(_payload, { supabase, user }) {
    const profile = await ensureUserProfile(supabase, user)

    const today = new Date().toISOString().split('T')[0]
    const { data: checkIn, error: checkInError, status } = await supabase
      .from('daily_check_ins')
      .select('*')
      .eq('user_id', user.id)
      .eq('check_in_date', today)
      .maybeSingle()

    if (checkInError && status !== 406) {
      throw checkInError
    }

    return {
      profile,
      todayCheckIn: checkIn ?? null,
    }
  },

  async 'progress.load'(_payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)
    
    const { data: checkIns, error } = await supabase
      .from('daily_check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
      .limit(30)

    if (error) throw error

    return {
      checkIns: checkIns ?? [],
    }
  },

  async 'tasks.list'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const statusFilter = validateTaskStatus(payload?.status)

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data: tasks, error } = await query
    if (error) throw error

    const order = { pending: 0, in_progress: 1, completed: 2, skipped: 3 } as Record<string, number>
    const sorted = (tasks ?? []).sort((a: any, b: any) => {
      const statusDiff = (order[a.status] ?? 99) - (order[b.status] ?? 99)
      if (statusDiff !== 0) return statusDiff
      return (a.position ?? 0) - (b.position ?? 0)
    })

    return { tasks: sorted }
  },

  async 'tasks.get'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const taskId = payload?.task_id ?? payload?.taskId
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('task_id is required')
    }

    const { data: task, error, status } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error && status !== 406) throw error
    if (!task) {
      throw new Error('Task not found')
    }

    return { task }
  },

  async 'tasks.create'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const title = (payload?.title ?? '').toString().trim()
    if (!title) {
      throw new Error('Title is required')
    }

    const estimatedMinutes = Number(payload?.estimated_minutes ?? 25)
    const position = Math.round(Number(payload?.position ?? Date.now()))
    const status = validateTaskStatus(payload?.status) ?? 'pending'

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        description: payload?.description ?? null,
        estimated_minutes: Number.isFinite(estimatedMinutes) && estimatedMinutes > 0 ? Math.round(estimatedMinutes) : 25,
        status,
        position,
      })
      .select()
      .single()

    if (error) throw error

    console.log(JSON.stringify({
      event: 'task.created.manual',
      userId: user.id,
      taskId: task.id,
    }))

    return { task }
  },

  async 'tasks.updateStatus'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const taskId = payload?.task_id ?? payload?.taskId
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('task_id is required')
    }

    const status = validateTaskStatus(payload?.status)
    if (!status) {
      throw new Error('status is required')
    }

    const updates: Record<string, unknown> = {
      status,
    }

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
    }

    if (payload?.actual_minutes !== undefined) {
      updates.actual_minutes = Math.max(0, Math.round(Number(payload.actual_minutes)))
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    console.log(JSON.stringify({
      event: 'task.status.updated',
      userId: user.id,
      taskId,
      status,
    }))

    return { task }
  },

  async 'tasks.reorder'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const updates = Array.isArray(payload?.updates) ? payload.updates : null
    if (!updates || updates.length === 0) {
      throw new Error('updates array is required')
    }

    const rows = updates.map((entry: any) => {
      if (!entry?.task_id || typeof entry.task_id !== 'string') {
        throw new Error('Each update requires task_id')
      }
      const status = validateTaskStatus(entry.status) ?? null
      return {
        id: entry.task_id,
        user_id: user.id,
        position: Math.round(Number(entry.position ?? 0)),
        ...(status ? { status } : {}),
      }
    })

    const { data, error } = await supabase
      .from('tasks')
      .upsert(rows, { onConflict: 'id' })
      .select()

    if (error) throw error

    console.log(JSON.stringify({
      event: 'task.reordered',
      userId: user.id,
      count: rows.length,
    }))

    return { tasks: data }
  },

  async 'habit.logSession'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const durationMinutes = parsePositiveInt(payload?.duration_minutes, 'duration_minutes')
    const tasksCompleted = Math.max(0, Math.round(Number(payload?.tasks_completed ?? 0)))
    const focusScore = clampFocusScore(payload?.focus_score)
    const timestamp = payload?.timestamp ? new Date(payload.timestamp) : new Date()
    if (Number.isNaN(timestamp.valueOf())) {
      throw new Error('Invalid timestamp')
    }
    const today = timestamp.toISOString().split('T')[0]
    const taskId = payload?.task_id ?? payload?.taskId

    const { data: existing, error: existingError, status } = await supabase
      .from('daily_check_ins')
      .select('study_minutes, tasks_completed, focus_score, check_in_date')
      .eq('user_id', user.id)
      .eq('check_in_date', today)
      .maybeSingle()

    if (existingError && status !== 406) {
      throw existingError
    }

    const updatedStudyMinutes = (existing?.study_minutes ?? 0) + durationMinutes
    const updatedTasksCompleted = (existing?.tasks_completed ?? 0) + tasksCompleted

    let updatedFocusScore = existing?.focus_score ?? null
    if (focusScore !== null) {
      if (existing?.focus_score) {
        updatedFocusScore = Math.round((existing.focus_score + focusScore) / 2)
      } else {
        updatedFocusScore = focusScore
      }
    }

    const { data: updatedDaily, error: upsertError } = await supabase
      .from('daily_check_ins')
      .upsert(
        {
          user_id: user.id,
          check_in_date: today,
          study_minutes: updatedStudyMinutes,
          tasks_completed: updatedTasksCompleted,
          focus_score: updatedFocusScore,
        },
        { onConflict: 'user_id,check_in_date' },
      )
      .select()
      .single()

    if (upsertError) throw upsertError

    let updatedTask: any = null

    if (taskId && typeof taskId === 'string') {
      const { data: task, error: taskError, status: taskStatus } = await supabase
        .from('tasks')
        .select('id, status, actual_minutes')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (taskError && taskStatus !== 406) {
        throw taskError
      }

      if (!task) {
        throw new Error('Task not found')
      }

      const taskUpdates: Record<string, unknown> = {
        actual_minutes: (task.actual_minutes ?? 0) + durationMinutes,
      }

      const desiredStatus = validateTaskStatus(payload?.task_status)
      if (desiredStatus) {
        taskUpdates.status = desiredStatus
        if (desiredStatus === 'completed') {
          taskUpdates.completed_at = new Date().toISOString()
        }
      } else if (tasksCompleted > 0) {
        taskUpdates.status = 'completed'
        taskUpdates.completed_at = new Date().toISOString()
      } else if (task.status === 'pending') {
        taskUpdates.status = 'in_progress'
      }

      const { data: updatedTaskRow, error: taskUpdateError } = await supabase
        .from('tasks')
        .update(taskUpdates)
        .eq('id', task.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (taskUpdateError) throw taskUpdateError
      updatedTask = updatedTaskRow
    }

    const { data: profileRow, error: profileError } = await supabase
      .from('user_profiles')
      .select('total_study_minutes, total_tasks_completed, experience_points, level, current_streak')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    const xpGain = durationMinutes * 2 + tasksCompleted * 5
    const newXp = (profileRow.experience_points ?? 0) + xpGain
    const newLevel = Math.max(1, Math.floor(newXp / 120) + 1)

    const { data: updatedProfile, error: profileUpdateError } = await supabase
      .from('user_profiles')
      .update({
        total_study_minutes: (profileRow.total_study_minutes ?? 0) + durationMinutes,
        total_tasks_completed: (profileRow.total_tasks_completed ?? 0) + tasksCompleted,
        experience_points: newXp,
        level: newLevel,
      })
      .eq('id', user.id)
      .select()
      .single()

    if (profileUpdateError) throw profileUpdateError

    const unlockedAchievements = await evaluateAchievements(supabase, user.id, {
      ...profileRow,
      total_study_minutes: (profileRow.total_study_minutes ?? 0) + durationMinutes,
      total_tasks_completed: (profileRow.total_tasks_completed ?? 0) + tasksCompleted,
      current_streak: updatedProfile.current_streak,
    })

    console.log(JSON.stringify({
      event: 'habit.session.logged',
      userId: user.id,
      date: today,
      durationMinutes,
      tasksCompleted,
      focusScore,
      taskId: taskId ?? null,
    }))

    return {
      daily: updatedDaily,
      profile: updatedProfile,
      xpGain,
      task: updatedTask,
      achievements: unlockedAchievements,
    }
  },

  async 'habit.summary'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const windowDays = Math.max(1, Math.min(30, Math.floor(Number(payload?.days ?? 7))))
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - (windowDays - 1))
    const fromIso = fromDate.toISOString().split('T')[0]

    const [{ data: profile, error: profileError }, { data: checkIns, error: checkInsError }] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('current_streak, longest_streak, total_study_minutes, total_tasks_completed, experience_points, level, best_study_times, daily_goal_minutes')
        .eq('id', user.id)
        .single(),
      supabase
        .from('daily_check_ins')
        .select('check_in_date, study_minutes, tasks_completed, focus_score')
        .eq('user_id', user.id)
        .gte('check_in_date', fromIso)
        .order('check_in_date', { ascending: true }),
    ])

    if (profileError) throw profileError
    if (checkInsError) throw checkInsError

    const dailyRecords = checkIns ?? []
    const totalMinutes = dailyRecords.reduce((sum, day) => sum + (day.study_minutes ?? 0), 0)
    const totalTasks = dailyRecords.reduce((sum, day) => sum + (day.tasks_completed ?? 0), 0)
    const focusValues = dailyRecords
      .map((day) => day.focus_score)
      .filter((score) => typeof score === 'number') as number[]
    const averageFocus = focusValues.length > 0
      ? Math.round(focusValues.reduce((sum, score) => sum + score, 0) / focusValues.length)
      : null
    const activeDays = dailyRecords.filter((day) => (day.study_minutes ?? 0) > 0 || (day.tasks_completed ?? 0) > 0).length
    const consistencyRate = Math.round((activeDays / windowDays) * 100)

    let bestDay: string | null = null
    let bestMinutes = -1
    for (const day of dailyRecords) {
      if ((day.study_minutes ?? 0) > bestMinutes) {
        bestMinutes = day.study_minutes ?? 0
        bestDay = day.check_in_date
      }
    }

    console.log(JSON.stringify({
      event: 'habit.summary.generated',
      userId: user.id,
      windowDays,
    }))

    return {
      profile,
      window: windowDays,
      totals: {
        minutes: totalMinutes,
        tasks: totalTasks,
        focus: averageFocus,
        consistencyRate,
        bestDay,
      },
      daily: dailyRecords,
    }
  },

  async 'studyRooms.list'(_payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const { data: rooms, error } = await supabase
      .from('study_rooms')
      .select('id, name, description, subject, max_participants, room_type, session_duration, break_duration, auto_start_break, created_at, updated_at, is_active')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!rooms || rooms.length === 0) {
      return { rooms: [] }
    }

    const roomIds = rooms.map((room: any) => room.id)
    const [participantsRes, sessionsRes] = await Promise.all([
      supabase
        .from('room_participants')
        .select('room_id, status, left_at')
        .in('room_id', roomIds),
      supabase
        .from('study_sessions')
        .select('room_id, focus_score')
        .in('room_id', roomIds)
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ])

    if (participantsRes.error) throw participantsRes.error
    if (sessionsRes.error) throw sessionsRes.error

    const participantCounts: Record<string, number> = {}
    const activeFlags: Record<string, boolean> = {}
    for (const participant of participantsRes.data ?? []) {
      if (!participant.left_at) {
        participantCounts[participant.room_id] = (participantCounts[participant.room_id] || 0) + 1
        if (participant.status === 'studying') {
          activeFlags[participant.room_id] = true
        }
      }
    }

    const focusTotals: Record<string, { total: number; count: number }> = {}
    for (const session of sessionsRes.data ?? []) {
      if (session.focus_score) {
        const bucket = focusTotals[session.room_id] ?? { total: 0, count: 0 }
        bucket.total += session.focus_score
        bucket.count += 1
        focusTotals[session.room_id] = bucket
      }
    }

    const enrichedRooms = rooms.map((room: any) => {
      const focus = focusTotals[room.id]
      return {
        ...room,
        current_participants: participantCounts[room.id] || 0,
        average_focus: focus ? Math.round((focus.total / focus.count) * 10) / 10 : null,
        is_active: activeFlags[room.id] ?? room.is_active,
      }
    })

    return { rooms: enrichedRooms }
  },

  async 'studyRooms.create'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const name = (payload?.name ?? '').toString().trim()
    const subject = payload?.subject ? payload.subject.toString().trim() : null
    const maxParticipants = Number(payload?.max_participants ?? 10)

    if (!name) {
      throw new Error('Room name is required')
    }

    const { data: room, error } = await supabase
      .from('study_rooms')
      .insert({
        name,
        subject,
        max_participants: Number.isFinite(maxParticipants) && maxParticipants > 0 ? maxParticipants : 10,
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    console.log(JSON.stringify({
      event: 'studyRoom.created',
      userId: user.id,
      roomId: room.id,
    }))

    return { room }
  },

  async 'studyRooms.join'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const roomId = payload?.roomId ?? payload?.room_id
    if (!roomId || typeof roomId !== 'string') {
      throw new Error('roomId is required')
    }

    const { data: room, error: roomError, status } = await supabase
      .from('study_rooms')
      .select('id, is_active, max_participants')
      .eq('id', roomId)
      .maybeSingle()

    if (roomError && status !== 406) throw roomError
    if (!room || !room.is_active) {
      throw new Error('Study room is not available')
    }

    const { data: existing, error: existingError, status: existingStatus } = await supabase
      .from('room_participants')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .is('left_at', null)
      .maybeSingle()

    if (existingError && existingStatus !== 406) throw existingError
    if (existing) {
      return { alreadyJoined: true }
    }

    const { count: activeCount, error: countError } = await supabase
      .from('room_participants')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .is('left_at', null)

    if (countError) throw countError
    if (activeCount !== null && activeCount >= room.max_participants) {
      throw new Error('Study room is full')
    }

    const { error: insertError } = await supabase
      .from('room_participants')
      .insert({
        room_id: roomId,
        user_id: user.id,
        status: 'studying',
      })

    if (insertError) {
      if ((insertError as any).code === '23505') {
        return { alreadyJoined: true }
      }
      throw insertError
    }

    console.log(JSON.stringify({
      event: 'studyRoom.joined',
      userId: user.id,
      roomId,
    }))

    return { joined: true }
  },

  async 'studyRooms.leave'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const roomId = payload?.roomId ?? payload?.room_id
    if (!roomId || typeof roomId !== 'string') {
      throw new Error('roomId is required')
    }

    const { error } = await supabase
      .from('room_participants')
      .update({
        left_at: new Date().toISOString(),
        status: 'away',
      })
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .is('left_at', null)

    if (error) throw error

    console.log(JSON.stringify({
      event: 'studyRoom.left',
      userId: user.id,
      roomId,
    }))

    return { left: true }
  },

  async 'studyRooms.status'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const roomId = payload?.roomId ?? payload?.room_id
    if (!roomId || typeof roomId !== 'string') {
      throw new Error('roomId is required')
    }

    const [roomRes, participantRes, sessionsRes] = await Promise.all([
      supabase
        .from('study_rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle(),
      supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId),
      supabase
        .from('study_sessions')
        .select('focus_score')
        .eq('room_id', roomId)
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ])

    if (roomRes.error && roomRes.status !== 406) throw roomRes.error
    if (!roomRes.data) throw new Error('Room not found')
    if (participantRes.error) throw participantRes.error
    if (sessionsRes.error) throw sessionsRes.error

    const activeParticipants = (participantRes.data ?? []).filter((participant: any) => !participant.left_at)
    const ids = activeParticipants.map((participant) => participant.user_id)

    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url, current_streak')
      .in('id', ids)

    if (profileError) throw profileError

    const withProfiles = activeParticipants.map((participant) => ({
      ...participant,
      profile: profiles?.find((profile: any) => profile.id === participant.user_id) ?? null,
    }))

    const focusStats = (sessionsRes.data ?? []).reduce(
      (acc: { total: number; count: number }, session: any) => {
        if (session.focus_score) {
          acc.total += session.focus_score
          acc.count += 1
        }
        return acc
      },
      { total: 0, count: 0 },
    )

    const averageFocus = focusStats.count > 0 ? Math.round((focusStats.total / focusStats.count) * 10) / 10 : null

    return {
      room: {
        ...roomRes.data,
        current_participants: activeParticipants.length,
        average_focus: averageFocus,
      },
      participants: withProfiles,
    }
  },

  async 'achievements.list'(_payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })

    if (error) throw error
    return { achievements: data ?? [] }
  },

  async 'buddy.overview'(_payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)
    return await getBuddyOverview(supabase, user)
  },

  async 'buddy.request'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const { data: existing, error: existingError } = await supabase
      .from('study_buddies')
      .select('id')
      .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`)
      .in('status', ['pending', 'active'])

    if (existingError) throw existingError

    if ((existing ?? []).length > 0) {
      return await getBuddyOverview(supabase, user)
    }

    const { data: candidate, error: candidateError, status: candidateStatus } = await supabase
      .from('study_buddies')
      .select('id, user_id')
      .eq('status', 'pending')
      .is('buddy_id', null)
      .neq('user_id', user.id)
      .order('matched_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (candidateError && candidateStatus !== 406) throw candidateError

    if (candidate) {
      const matchReasons = ['Similar check-in rhythm', 'Shared accountability goals']
      const matchScore = Math.round((Math.random() * 20 + 70)) / 100
      const { error: updateError } = await supabase
        .from('study_buddies')
        .update({
          buddy_id: user.id,
          status: 'active',
          matched_at: new Date().toISOString(),
          compatibility_score: matchScore,
          match_reasons: matchReasons,
        })
        .eq('id', candidate.id)

      if (updateError) throw updateError
    } else {
      const reasons = Array.isArray(payload?.reasons) ? payload.reasons : []
      const { error: insertError } = await supabase
        .from('study_buddies')
        .insert({
          user_id: user.id,
          buddy_id: null,
          status: 'pending',
          match_reasons: reasons,
          compatibility_score: null,
        })

      if (insertError) throw insertError
    }

    return await getBuddyOverview(supabase, user)
  },

  async 'buddy.cancel'(_payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const { data: matches, error } = await supabase
      .from('study_buddies')
      .select('id, user_id, buddy_id, status')
      .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`)
      .in('status', ['pending', 'active'])

    if (error) throw error

    const pendingIds: string[] = []
    const updateIds: string[] = []

    for (const match of matches ?? []) {
      if (match.status === 'pending' && match.user_id === user.id && !match.buddy_id) {
        pendingIds.push(match.id)
      } else {
        updateIds.push(match.id)
      }
    }

    if (pendingIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('study_buddies')
        .delete()
        .in('id', pendingIds)

      if (deleteError) throw deleteError
    }

    if (updateIds.length > 0) {
      const { error: updateError } = await supabase
        .from('study_buddies')
        .update({ status: 'ended' })
        .in('id', updateIds)

      if (updateError) throw updateError
    }

    return await getBuddyOverview(supabase, user)
  },

  async 'digest.generate'(payload, { supabase, user }) {
    await ensureUserProfile(supabase, user)

    const windowDays = Math.max(3, Math.min(14, Math.floor(Number(payload?.days ?? 7))))
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - (windowDays - 1))
    const fromIso = fromDate.toISOString().split('T')[0]

    const [{ data: profile, error: profileError }, { data: checkIns, error: checkError }] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      supabase
        .from('daily_check_ins')
        .select('*')
        .eq('user_id', user.id)
        .gte('check_in_date', fromIso)
        .order('check_in_date', { ascending: true }),
    ])

    if (profileError) throw profileError
    if (checkError) throw checkError

    const tasksRes = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('updated_at', fromIso)

    if (tasksRes.error) throw tasksRes.error

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!anthropicKey) {
      console.log(JSON.stringify({
        event: 'digest.generated.fallback',
        userId: user.id,
        windowDays,
        reason: 'missing_anthropic_key',
      }))

      return {
        recap: 'Great job showing up for your studies this week! Keep leaning on your routines and celebrate the progress you are making.',
        window: windowDays,
      }
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey })

    const summaryInput = {
      profile: {
        streak: profile.current_streak,
        longest_streak: profile.longest_streak,
        total_minutes: profile.total_study_minutes,
        total_tasks: profile.total_tasks_completed,
      },
      checkins: checkIns ?? [],
      tasks: tasksRes.data ?? [],
    }

    let recap = 'Great job showing up!'

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 600,
        temperature: 0.3,
        system:
          'You are a warm accountability coach. Summarize study highlights, streak energy, and gentle suggestions. Keep tone encouraging, 3 short sections max.',
        messages: [
          {
            role: 'user',
            content: `Create a weekly recap for this learner:\n${JSON.stringify(summaryInput)}`,
          },
        ],
      })

      recap = message.content?.[0]?.text ?? recap
    } catch (error) {
      const message = error instanceof Error ? error.message : 'anthropic_error'
      console.error(JSON.stringify({
        event: 'digest.generated.error',
        userId: user.id,
        windowDays,
        message,
      }))
    }

    console.log(JSON.stringify({
      event: 'digest.generated',
      userId: user.id,
      windowDays,
    }))

    return {
      recap,
      window: windowDays,
    }
  },
}

function jsonResponse(body: Record<string, unknown>, init?: ResponseInit) {
  return new Response(
    JSON.stringify(body),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      ...init,
    },
  )
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) {
    return jsonResponse({ success: false, error: 'Missing Authorization header' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch (_error) {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const action = body?.action
  const payload = body?.payload ?? {}

  if (!action || typeof action !== 'string') {
    return jsonResponse({ success: false, error: 'Action is required' }, { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const requestApiKey = req.headers.get('apikey') ?? ''
  const serviceKey =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
    Deno.env.get('SUPABASE_ANON_KEY') ??
    requestApiKey

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ success: false, error: 'Function not configured: missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  )

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const handler = handlers[action]
  if (!handler) {
    return jsonResponse({ success: false, error: `Unknown action: ${action}` }, { status: 400 })
  }

  try {
    const data = await handler(payload, { supabase, user })
    return jsonResponse({ success: true, data })
  } catch (error: any) {
    const message = error?.message ?? 'Unknown error'
    const details = error?.details ?? null
    const hint = error?.hint ?? null
    const code = error?.code ?? null
    const stack = error?.stack ?? null

    console.error(JSON.stringify({
      event: 'app-router.error',
      action,
      userId: user.id,
      message,
      details,
      hint,
      code,
      stack,
    }))

    return jsonResponse(
      {
        success: false,
        error: message,
        details,
        hint,
        code,
        stack,
        raw: typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error),
      },
      { status: 400 },
    )
  }
})

