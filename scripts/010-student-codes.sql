-- Add student_code column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS student_code text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_student_code ON public.students(student_code);

-- Update session_participants to include student_id
ALTER TABLE public.session_participants
ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS student_code text;

-- Add RLS policy for public can find student by code
-- This is needed because students join with their code
DROP POLICY IF EXISTS "Public can find student from code" ON public.students;
CREATE POLICY "Public can find student from code"
  ON public.students FOR SELECT
  USING (true); -- We'll refine this if needed, but for joining it's necessary
