-- =====================================================
-- 005-ENSURE-ACTIVITIES-TABLE.SQL
-- =====================================================
-- This script ensures the activities table has the correct structure for the new feature

CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  period_id uuid REFERENCES public.periods(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  questions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Ensure all columns exist if the table already existed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'questions') THEN
    ALTER TABLE public.activities ADD COLUMN questions jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'user_id') THEN
    ALTER TABLE public.activities ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'period_id') THEN
    ALTER TABLE public.activities ADD COLUMN period_id uuid REFERENCES public.periods(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Policies for activities
DROP POLICY IF EXISTS "Teachers can manage their own activities" ON public.activities;
CREATE POLICY "Teachers can manage their own activities"
  ON public.activities FOR ALL
  USING (auth.uid() = user_id);

-- Public can view activities (necessary for students in a session)
DROP POLICY IF EXISTS "Public can view activities" ON public.activities;
CREATE POLICY "Public can view activities"
  ON public.activities FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_course_id ON public.activities(course_id);
CREATE INDEX IF NOT EXISTS idx_activities_period_id ON public.activities(period_id);
