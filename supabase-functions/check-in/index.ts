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

type RateRecord = { windowStart: number; count: number }

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 12
const rateMap = new Map<string, RateRecord>()

function rateLimitKey(userId: string) {
  return `check-in:${userId}`
}

function checkRateLimit(userId: string) {
  const key = rateLimitKey(userId)
  const now = Date.now()
  const record = rateMap.get(key)

  if (!record) {
    rateMap.set(key, { windowStart: now, count: 1 })
    return null
  }

  if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateMap.set(key, { windowStart: now, count: 1 })
    return null
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      error: 'Too many requests. Please wait a moment before trying again.',
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.windowStart)) / 1000),
    }
  }

  record.count += 1
  rateMap.set(key, record)
  return null
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return new Response(
      JSON.stringify({ error: 'Invalid content type. Expected application/json.' }),
      {
        status: 415,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Function not configured: missing Supabase credentials' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
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
    } = await supabaseAdmin.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const rateLimit = checkRateLimit(user.id)
    if (rateLimit) {
      return new Response(
        JSON.stringify({ error: rateLimit.error }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.retryAfter),
          },
        },
      )
    }

    const { type, responses } = await req.json()

    if (!type || !responses) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    })

    // Create appropriate system prompt
    const systemPrompt = type === 'morning'
      ? `You are a supportive AI companion for a neurodivergent student. Based on their energy level (${responses.energy}/10) and mood (${responses.mood}), provide a brief, encouraging message (2-3 sentences) to start their day. Be warm, understanding, and gently motivating. If energy is low, acknowledge it's okay to have low-energy days and suggest starting with small, manageable tasks. If energy is high, encourage them to make the most of it. Never be pushy or demanding - focus on self-compassion and realistic progress.`
      : `You are reflecting with a neurodivergent student on their day. They shared: Wins: "${responses.wins || 'some accomplishments'}", Challenges: "${responses.challenges || 'some difficulties'}". Provide a brief, validating response (2-3 sentences) that celebrates their effort (not just outcomes) and encourages self-compassion. Remind them that showing up is what matters, and every day is a fresh start.`

    // Get AI response
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(responses),
        },
      ],
    })

    const aiResponse = message.content?.[0]?.text ?? ''

    // Save to database
    const today = new Date().toISOString().split('T')[0]

    // Upsert check-in
    const updateData: any = {
      user_id: user.id,
      check_in_date: today,
    }

    if (type === 'morning') {
      updateData.morning_energy = responses.energy
      updateData.morning_mood = responses.mood
      updateData.morning_intention = responses.intention
      updateData.morning_ai_response = aiResponse
      updateData.morning_completed_at = new Date().toISOString()
    } else {
      updateData.evening_energy = responses.energy
      updateData.evening_wins = responses.wins
      updateData.evening_challenges = responses.challenges
      updateData.evening_ai_response = aiResponse
      updateData.evening_completed_at = new Date().toISOString()
    }

    const { data: checkInData, error: checkInError } = await supabaseAdmin
      .from('daily_check_ins')
      .upsert(updateData, {
        onConflict: 'user_id,check_in_date',
      })
      .select()
      .single()

    if (checkInError) throw checkInError

    // Update streak if morning check-in
    if (type === 'morning') {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('current_streak, longest_streak, last_check_in_date')
        .eq('id', user.id)
        .single()

      if (profile) {
        const lastCheckIn = profile.last_check_in_date
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        let newStreak = profile.current_streak || 0

        if (!lastCheckIn || lastCheckIn === yesterdayStr) {
          // Continue or start streak
          newStreak = (profile.current_streak || 0) + 1
        } else if (lastCheckIn !== today) {
          // Streak broken, restart
          newStreak = 1
        }

        const longestStreak = Math.max(profile.longest_streak || 0, newStreak)

        await supabaseAdmin
          .from('user_profiles')
          .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_check_in_date: today,
          })
          .eq('id', user.id)
      }
    }

    console.log(JSON.stringify({
      event: 'check-in.completed',
      userId: user.id,
      type,
      hasMorning: !!updateData.morning_completed_at,
      hasEvening: !!updateData.evening_completed_at,
    }))

    return new Response(
      JSON.stringify({
        message: aiResponse,
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Error in check-in function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
        status: 400,
      }
    )
  }
})