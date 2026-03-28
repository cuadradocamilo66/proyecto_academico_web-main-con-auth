-- =====================================================
-- 008-ENHANCE-SESSIONS-COLUMNS.SQL
-- =====================================================
-- Adds new control columns for activity sessions

DO $$ 
BEGIN
  -- Add 'show_results' to control if students see their scores
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_sessions' 
    AND column_name = 'show_results'
  ) THEN
    ALTER TABLE public.activity_sessions 
    ADD COLUMN show_results BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add 'settings' jsonb for future extensibility (optional but good)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_sessions' 
    AND column_name = 'settings'
  ) THEN
    ALTER TABLE public.activity_sessions 
    ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;
