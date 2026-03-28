-- =====================================================
-- 007-FIX-RLS-PARTICIPANTS.SQL
-- =====================================================
-- Fixes the error when students try to join a session

-- 1. Allow public to SELECT from session_participants
-- Necessary for .insert().select().single() to work for anonymous users
DROP POLICY IF EXISTS "Public can view participants" ON public.session_participants;
CREATE POLICY "Public can view participants"
  ON public.session_participants FOR SELECT
  USING (true);

-- 2. Allow public to SELECT from session_responses 
-- (Optional but helpful for verification)
DROP POLICY IF EXISTS "Public can view responses" ON public.session_responses;
CREATE POLICY "Public can view responses"
  ON public.session_responses FOR SELECT
  USING (true);

-- 3. Ensure extensions are enabled (just in case)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
