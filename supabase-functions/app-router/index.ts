/// <reference path="../global.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

type HandlerContext = {
  supabase: any
  user: { id: string; email?: string | null }
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

const handlers: Record<string, Handler> = {
  async 'profile.get'(_payload, { supabase, user }) {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return { profile }
  },

  async 'profile.update'(payload, { supabase, user }) {
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
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

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

  async 'studyRooms.list'(_payload, { supabase, user }) {
    const { data: rooms, error } = await supabase
      .from('study_rooms')
      .select('id, name, description, subject, max_participants, room_type, session_duration, break_duration, auto_start_break, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!rooms || rooms.length === 0) {
      return { rooms: [] }
    }

    const roomIds = rooms.map((room: any) => room.id)
    const { data: participants, error: participantError } = await supabase
      .from('room_participants')
      .select('room_id, left_at')
      .in('room_id', roomIds)

    if (participantError) throw participantError

    const participantCounts: Record<string, number> = {}
    for (const participant of participants ?? []) {
      if (participant.left_at) continue
      participantCounts[participant.room_id] = (participantCounts[participant.room_id] || 0) + 1
    }

    const enrichedRooms = rooms.map((room: any) => ({
      ...room,
      current_participants: participantCounts[room.id] || 0,
      is_active: true,
    }))

    return { rooms: enrichedRooms }
  },

  async 'studyRooms.create'(payload, { supabase, user }) {
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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
    console.error(JSON.stringify({
      event: 'app-router.error',
      action,
      userId: user.id,
      message: error?.message ?? 'Unknown error',
    }))

    return jsonResponse(
      {
        success: false,
        error: error?.message ?? 'Unexpected error occurred',
      },
      { status: 400 },
    )
  }
})

