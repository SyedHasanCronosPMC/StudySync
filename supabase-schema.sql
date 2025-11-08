-- StudySync Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles extending Supabase auth
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Basic info
  display_name TEXT,
  avatar_url TEXT,
  
  -- Neurodivergent profile
  has_adhd BOOLEAN DEFAULT false,
  has_dyslexia BOOLEAN DEFAULT false,
  has_anxiety BOOLEAN DEFAULT false,
  has_autism BOOLEAN DEFAULT false,
  
  -- Preferences
  preferred_study_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  daily_goal_minutes INTEGER DEFAULT 60,
  best_study_times TEXT[] DEFAULT ARRAY['morning'],
  
  -- Gamification
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_check_in_date DATE,
  total_study_minutes INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  experience_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  
  -- Settings
  dark_mode BOOLEAN DEFAULT true,
  reduce_animations BOOLEAN DEFAULT false,
  larger_text BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  audio_instructions BOOLEAN DEFAULT false,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false
);

-- Daily check-ins
CREATE TABLE IF NOT EXISTS daily_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  check_in_date DATE DEFAULT CURRENT_DATE,
  
  -- Morning check-in
  morning_energy INTEGER CHECK (morning_energy BETWEEN 1 AND 10),
  morning_mood TEXT,
  morning_intention TEXT,
  morning_ai_response TEXT,
  morning_completed_at TIMESTAMPTZ,
  
  -- Evening check-in
  evening_energy INTEGER CHECK (evening_energy BETWEEN 1 AND 10),
  evening_reflection TEXT,
  evening_wins TEXT,
  evening_challenges TEXT,
  evening_ai_response TEXT,
  evening_completed_at TIMESTAMPTZ,
  
  -- Metrics
  tasks_completed INTEGER DEFAULT 0,
  study_minutes INTEGER DEFAULT 0,
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 10),
  
  UNIQUE(user_id, check_in_date)
);

-- Tasks with decomposition
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  title TEXT NOT NULL,
  description TEXT,
  original_input TEXT,
  
  -- Task properties
  estimated_minutes INTEGER DEFAULT 25,
  actual_minutes INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  energy_required INTEGER CHECK (energy_required BETWEEN 1 AND 10),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  due_date DATE,
  
  -- AI decomposition
  is_decomposed BOOLEAN DEFAULT false,
  decomposition_prompt TEXT,
  decomposition_response JSONB,
  
  -- Ordering
  position INTEGER DEFAULT 0
);

-- Study sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  room_id UUID REFERENCES study_rooms(id) ON DELETE SET NULL,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  planned_duration INTEGER DEFAULT 25,
  actual_duration INTEGER,
  
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 10),
  productivity_score INTEGER CHECK (productivity_score BETWEEN 1 AND 10),
  
  breaks_taken INTEGER DEFAULT 0,
  distractions_logged INTEGER DEFAULT 0,
  
  notes TEXT,
  mood_before TEXT,
  mood_after TEXT
);

-- Study rooms for peer accountability
CREATE TABLE IF NOT EXISTS study_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  room_type TEXT DEFAULT 'focus' CHECK (room_type IN ('focus', 'casual', 'exam_prep', 'group_project')),
  
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Room settings
  session_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  auto_start_break BOOLEAN DEFAULT true
);

-- Room participants
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'studying' CHECK (status IN ('studying', 'break', 'away', 'complete')),
  current_task TEXT,
  
  study_minutes INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  
  UNIQUE(room_id, user_id, joined_at)
);

-- Achievements/Badges
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  milestone_value INTEGER,
  
  UNIQUE(user_id, badge_type, milestone_value)
);

-- Study buddies matching
CREATE TABLE IF NOT EXISTS study_buddies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  buddy_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  compatibility_score DECIMAL(3,2) CHECK (compatibility_score BETWEEN 0 AND 1),
  
  match_reasons TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'ended')),
  
  UNIQUE(user_id, buddy_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_check_ins_user_date ON daily_check_ins(user_id, check_in_date);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON study_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON study_rooms(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_participants_room ON room_participants(room_id) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_participants_user ON room_participants(user_id) WHERE left_at IS NULL;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_buddies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own check-ins" ON daily_check_ins;
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can view active rooms" ON study_rooms;
DROP POLICY IF EXISTS "Users can create rooms" ON study_rooms;
DROP POLICY IF EXISTS "Users can update own rooms" ON study_rooms;
DROP POLICY IF EXISTS "Anyone can view room participants" ON room_participants;
DROP POLICY IF EXISTS "Users can join rooms" ON room_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON room_participants;
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own buddies" ON study_buddies;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own check-ins" ON daily_check_ins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view active rooms" ON study_rooms
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create rooms" ON study_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own rooms" ON study_rooms
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view room participants" ON room_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON room_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON room_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own buddies" ON study_buddies
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_check_ins_updated_at ON daily_check_ins;
CREATE TRIGGER update_daily_check_ins_updated_at
  BEFORE UPDATE ON daily_check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_rooms_updated_at ON study_rooms;
CREATE TRIGGER update_study_rooms_updated_at
  BEFORE UPDATE ON study_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;