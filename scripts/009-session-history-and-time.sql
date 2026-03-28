-- =====================================================
-- 009-SESSION-HISTORY-AND-TIME.SQL
-- =====================================================
-- Adds expires_at column to activity_sessions

DO $$ 
BEGIN
  -- Add 'expires_at' to handle time limits
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_sessions' 
    AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE public.activity_sessions 
    ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;
