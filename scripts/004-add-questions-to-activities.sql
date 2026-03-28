-- =====================================================
-- 004-ADD-QUESTIONS-TO-ACTIVITIES.SQL
-- =====================================================
-- This script adds the questions column to the activities table

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activities' 
    AND column_name = 'questions'
  ) THEN
    ALTER TABLE public.activities 
    ADD COLUMN questions JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Update RLS policies to ensure public access to questions for active sessions
-- (Wait, public access to activities is already handled via activity_sessions in the previous script)
-- But let's make sure the activities table has policy for students if they need to fetch them directly
-- Actually, my session-service.ts fetches activities through a join, so it uses activity_sessions policies.
