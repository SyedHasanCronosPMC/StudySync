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
const RATE_LIMIT_MAX_REQUESTS = 10
const rateMap = new Map<string, RateRecord>()

function rateLimitKey(userId: string) {
  return `decompose-task:${userId}`
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
      error: 'Too many decomposition requests. Please slow down and try again shortly.',
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

    const supabaseAdmin = createClient(
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

    const { task_input, user_profile } = await req.json()

    if (!task_input) {
      return new Response(
        JSON.stringify({ error: 'Missing task_input' }),
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

    const profileContext = user_profile ?? {}

    const conditions = profileContext.conditions || []
    const conditionsText = conditions.length > 0 ? conditions.join(', ') : 'general learning challenges'

    const systemPrompt = `You are helping a student with ${conditionsText} break down a task into manageable chunks.

Rules:
- Each subtask should be ${profileContext.preferred_duration || 25} minutes or less
- Use clear, action-oriented language (start with verbs: "Read", "Write", "Review")
- Consider executive function challenges - make the first step incredibly easy to reduce friction
- Break down into 3-5 subtasks maximum
- Be specific and concrete (avoid vague tasks)
- Include time estimates that are realistic

Return ONLY a JSON array with this exact structure:
[
  {
    "title": "Clear, specific task description",
    "duration_minutes": 15,
    "tips": "One helpful tip for completing this task"
  }
]

IMPORTANT: Return ONLY the JSON array, no other text or markdown.`

    // Get AI response
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.6,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Break down this task: "${task_input}"`,
        },
      ],
    })

    let subtasksText = message.content[0].text.trim()

    // Remove markdown code blocks if present
    subtasksText = subtasksText.replace(/```json\n/g, '').replace(/```/g, '').trim()

    const subtasks = JSON.parse(subtasksText)

    // Save parent task and subtasks to database
    // Insert parent task
    const { data: parentTask, error: parentError } = await supabaseAdmin
      .from('tasks')
      .insert({
        user_id: user.id,
        title: task_input,
        original_input: task_input,
        is_decomposed: true,
        decomposition_prompt: task_input,
        decomposition_response: subtasks,
        status: 'pending',
      })
      .select()
      .single()

    if (parentError) throw parentError

    // Insert subtasks
    const subtaskRecords = subtasks.map((st: any, idx: number) => ({
      user_id: user.id,
      parent_task_id: parentTask.id,
      title: st.title,
      description: st.tips,
      estimated_minutes: st.duration_minutes,
      position: idx,
      status: 'pending',
    }))

    const { error: subtasksError } = await supabaseAdmin.from('tasks').insert(subtaskRecords)

    if (subtasksError) throw subtasksError

    console.log(JSON.stringify({
      event: 'task.decomposed',
      userId: user.id,
      taskId: parentTask.id,
      subtaskCount: subtasks.length,
    }))

    return new Response(
      JSON.stringify({
        parentTask,
        subtasks,
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
    console.error('Error in decompose-task function:', error)
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