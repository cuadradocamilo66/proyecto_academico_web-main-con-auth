-- =====================================================
-- 006-CONSOLIDATED-ACTIVITY-MIGRATION.SQL
-- =====================================================
-- This script synchronizes your database with the new Activity Sessions feature.
-- Run this in the Supabase SQL Editor.

-- 1. Update the 'activities' table to include missing columns
DO $$ 
BEGIN
  -- Add 'user_id' if it doesn't exist (for multi-teacher support)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'user_id') THEN
    ALTER TABLE public.activities ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add 'questions' if it doesn't exist (for storing exam questions)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'questions') THEN
    ALTER TABLE public.activities ADD COLUMN questions jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  -- Ensure RLS is enabled
  ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
END $$;

-- 2. Create 'activity_sessions' table
CREATE TABLE IF NOT EXISTS public.activity_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL, -- 6-digit unique code for students
  status text NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create 'session_participants' table (anonymous students)
CREATE TABLE IF NOT EXISTS public.session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.activity_sessions(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  joined_at timestamp with time zone DEFAULT now()
);

-- 4. Create 'session_responses' table
CREATE TABLE IF NOT EXISTS public.session_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.activity_sessions(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.session_participants(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  answer text,
  score numeric(3,2),
  submitted_at timestamp with time zone DEFAULT now()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_responses ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for TEACHERS
-- Activities: manage own
DROP POLICY IF EXISTS "Teachers can manage their own activities" ON public.activities;
CREATE POLICY "Teachers can manage their own activities"
  ON public.activities FOR ALL
  USING (auth.uid() = user_id);

-- Sessions: manage own
DROP POLICY IF EXISTS "Teachers can manage their own sessions" ON public.activity_sessions;
CREATE POLICY "Teachers can manage their own sessions"
  ON public.activity_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Participants: view own session participants
DROP POLICY IF EXISTS "Teachers can view participants of their sessions" ON public.session_participants;
CREATE POLICY "Teachers can view participants of their sessions"
  ON public.session_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.activity_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

-- Responses: view own session responses
DROP POLICY IF EXISTS "Teachers can view responses of their sessions" ON public.session_responses;
CREATE POLICY "Teachers can view responses of their sessions"
  ON public.session_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.activity_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

-- 7. RLS Policies for STUDENTS (Public access by code)
-- Find active sessions
DROP POLICY IF EXISTS "Public can find sessions by code" ON public.activity_sessions;
CREATE POLICY "Public can find sessions by code"
  ON public.activity_sessions FOR SELECT
  USING (status = 'active');

-- Join sessions
DROP POLICY IF EXISTS "Public can join sessions" ON public.session_participants;
CREATE POLICY "Public can join sessions"
  ON public.session_participants FOR INSERT
  WITH CHECK (true);

-- Submit answers
DROP POLICY IF EXISTS "Participants can submit responses" ON public.session_responses;
CREATE POLICY "Participants can submit responses"
  ON public.session_responses FOR INSERT
  WITH CHECK (true);

-- View activities for the session (Necessary for questions)
DROP POLICY IF EXISTS "Public can view activities" ON public.activities;
CREATE POLICY "Public can view activities"
  ON public.activities FOR SELECT
  USING (true);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_code ON public.activity_sessions(code);
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_participant ON public.session_responses(participant_id);
