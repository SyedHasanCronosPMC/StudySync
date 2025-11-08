import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface UserProfile {
  id: string
  created_at: string
  updated_at: string
  display_name: string | null
  avatar_url: string | null
  has_adhd: boolean
  has_dyslexia: boolean
  has_anxiety: boolean
  has_autism: boolean
  preferred_study_duration: number
  break_duration: number
  daily_goal_minutes: number
  best_study_times: string[]
  current_streak: number
  longest_streak: number
  last_check_in_date: string | null
  total_study_minutes: number
  total_tasks_completed: number
  experience_points: number
  level: number
  dark_mode: boolean
  reduce_animations: boolean
  larger_text: boolean
  high_contrast: boolean
  audio_instructions: boolean
  onboarding_completed: boolean
}

export interface DailyCheckIn {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  check_in_date: string
  morning_energy: number | null
  morning_mood: string | null
  morning_intention: string | null
  morning_ai_response: string | null
  morning_completed_at: string | null
  evening_energy: number | null
  evening_reflection: string | null
  evening_wins: string | null
  evening_challenges: string | null
  evening_ai_response: string | null
  evening_completed_at: string | null
  tasks_completed: number
  study_minutes: number
  focus_score: number | null
}

export interface Task {
  id: string
  user_id: string
  parent_task_id: string | null
  created_at: string
  updated_at: string
  title: string
  description: string | null
  original_input: string | null
  estimated_minutes: number
  actual_minutes: number | null
  difficulty_level: number | null
  energy_required: number | null
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  completed_at: string | null
  due_date: string | null
  is_decomposed: boolean
  decomposition_prompt: string | null
  decomposition_response: any | null
  position: number
}

export interface StudyRoom {
  id: string
  created_at: string
  updated_at: string
  name: string
  description: string | null
  subject: string | null
  max_participants: number
  current_participants: number
  is_active: boolean
  room_type: 'focus' | 'casual' | 'exam_prep' | 'group_project'
  created_by: string | null
  started_at: string | null
  ended_at: string | null
  session_duration: number
  break_duration: number
  auto_start_break: boolean
}

export interface RoomParticipant {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  left_at: string | null
  status: 'studying' | 'break' | 'away' | 'complete'
  current_task: string | null
  study_minutes: number
  messages_sent: number
}