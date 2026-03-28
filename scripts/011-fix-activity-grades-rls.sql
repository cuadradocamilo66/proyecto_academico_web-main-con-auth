-- =====================================================
-- 011-FIX-ACTIVITY-GRADES-RLS.SQL
-- =====================================================
-- This script ensures activity_grades exists and allows public insertions
-- so students can submit their results autonomously.

-- 1. Ensure the table exists (in case it was deleted or moved)
CREATE TABLE IF NOT EXISTS public.activity_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.activity_grades ENABLE ROW LEVEL SECURITY;

-- 3. DROP old policies if they exist
DROP POLICY IF EXISTS "Teachers can manage their own activity grades" ON public.activity_grades;
DROP POLICY IF EXISTS "Public can insert activity grades" ON public.activity_grades;

-- 4. Policy for TEACHERS: See and manage all grades for their activities
CREATE POLICY "Teachers can manage their own activity grades"
  ON public.activity_grades FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.activities a
    WHERE a.id = activity_id AND a.user_id = auth.uid()
  ));

-- 5. Policy for STUDENTS (Public): Can only INSERT their own grade
-- Note: We allow all insertions because students don't have auth accounts.
-- Validation should happen at the application level.
CREATE POLICY "Public can insert activity grades"
  ON public.activity_grades FOR INSERT
  WITH CHECK (true);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_grades_activity_id ON public.activity_grades(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_grades_student_id ON public.activity_grades(student_id);
