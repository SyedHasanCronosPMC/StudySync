import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, task_input, user_profile } = await req.json()

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    })

    const conditions = user_profile.conditions || []
    const conditionsText = conditions.length > 0 ? conditions.join(', ') : 'general learning challenges'

    const systemPrompt = `You are helping a student with ${conditionsText} break down a task into manageable chunks.

Rules:
- Each subtask should be ${user_profile.preferred_duration || 25} minutes or less
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert parent task
    const { data: parentTask, error: parentError } = await supabase
      .from('tasks')
      .insert({
        user_id,
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
      user_id,
      parent_task_id: parentTask.id,
      title: st.title,
      description: st.tips,
      estimated_minutes: st.duration_minutes,
      position: idx,
      status: 'pending',
    }))

    const { error: subtasksError } = await supabase.from('tasks').insert(subtaskRecords)

    if (subtasksError) throw subtasksError

    return new Response(
      JSON.stringify({
        parentTask,
        subtasks,
        success: true,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in decompose-task function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})