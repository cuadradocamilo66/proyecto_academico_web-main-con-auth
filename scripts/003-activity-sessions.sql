-- =====================================================
-- 003-ACTIVITY-SESSIONS.SQL
-- =====================================================
-- This script creates the tables for public activity sessions

-- 1. Table for activity sessions (hosted by teachers)
CREATE TABLE IF NOT EXISTS public.activity_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL, -- 6-digit unique code
  status text NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Table for session participants (students without accounts)
CREATE TABLE IF NOT EXISTS public.session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.activity_sessions(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  joined_at timestamp with time zone DEFAULT now()
);

-- 3. Table for student responses within a session
CREATE TABLE IF NOT EXISTS public.session_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.activity_sessions(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.session_participants(id) ON DELETE CASCADE,
  question_id text NOT NULL, -- Reference to the specific question in the activity
  answer text,
  score numeric(3,2), -- Individual question score
  submitted_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_responses ENABLE ROW LEVEL SECURITY;

-- Policies for teachers
CREATE POLICY "Teachers can manage their own sessions"
  ON public.activity_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view participants of their sessions"
  ON public.session_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.activity_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

CREATE POLICY "Teachers can view responses of their sessions"
  ON public.session_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.activity_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

-- Public policies for students (joining by code)
-- Students need to find a session by code
CREATE POLICY "Public can find sessions by code"
  ON public.activity_sessions FOR SELECT
  USING (status = 'active');

-- Participants can be created publicly
CREATE POLICY "Public can join sessions"
  ON public.session_participants FOR INSERT
  WITH CHECK (true);

-- Participants can submit answers
CREATE POLICY "Participants can submit responses"
  ON public.session_responses FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_activity_sessions_code ON public.activity_sessions(code);
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_participant ON public.session_responses(participant_id);
