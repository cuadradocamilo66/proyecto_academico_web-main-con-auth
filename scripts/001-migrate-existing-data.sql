-- =====================================================
-- SCRIPT DE MIGRACIÓN DE DATOS EXISTENTES
-- =====================================================
-- Este script debe ejecutarse DESPUÉS de:
-- 1. Ejecutar 000-setup-auth-CORRECTED.sql
-- 2. Registrar al menos un usuario en la aplicación
-- 3. Obtener el ID del usuario (auth.users.id)

-- =====================================================
-- PASO 1: OBTENER TU USER ID
-- =====================================================
-- Ejecuta esta query para ver los usuarios registrados:

SELECT 
  id,
  email,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Copia el 'id' del usuario al que quieres asignar los datos existentes

-- =====================================================
-- PASO 2: VERIFICAR DATOS SIN USER_ID
-- =====================================================
-- Antes de migrar, verifica cuántos registros necesitan user_id:

SELECT 'courses' as tabla, COUNT(*) as registros_sin_user 
FROM public.courses WHERE user_id IS NULL
UNION ALL
SELECT 'students', COUNT(*) 
FROM public.students WHERE user_id IS NULL
UNION ALL
SELECT 'weekly_planning', COUNT(*) 
FROM public.weekly_planning WHERE user_id IS NULL
UNION ALL
SELECT 'observations', COUNT(*) 
FROM public.observations WHERE user_id IS NULL
UNION ALL
SELECT 'events', COUNT(*) 
FROM public.events WHERE user_id IS NULL
UNION ALL
SELECT 'grades', COUNT(*) 
FROM public.grades WHERE user_id IS NULL;

-- =====================================================
-- PASO 3: EJECUTAR LA MIGRACIÓN
-- =====================================================
-- IMPORTANTE: Reemplaza 'PEGA-AQUI-TU-USER-ID' con el ID que obtuviste en el PASO 1
-- Ejemplo: '550e8400-e29b-41d4-a716-446655440000'

-- DESCOMENTA LAS LÍNEAS SIGUIENTES Y REEMPLAZA EL ID:

/*
DO $$
DECLARE
  target_user_id uuid := 'PEGA-AQUI-TU-USER-ID'; -- REEMPLAZA ESTO
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'El usuario con ID % no existe', target_user_id;
  END IF;

  -- Migrar courses
  UPDATE public.courses 
  SET user_id = target_user_id 
  WHERE user_id IS NULL;
  RAISE NOTICE 'Migrados % cursos', (SELECT COUNT(*) FROM public.courses WHERE user_id = target_user_id);

  -- Migrar students
  UPDATE public.students 
  SET user_id = target_user_id 
  WHERE user_id IS NULL;
  RAISE NOTICE 'Migrados % estudiantes', (SELECT COUNT(*) FROM public.students WHERE user_id = target_user_id);

  -- Migrar weekly_planning
  UPDATE public.weekly_planning 
  SET user_id = target_user_id 
  WHERE user_id IS NULL;
  RAISE NOTICE 'Migradas % planeaciones', (SELECT COUNT(*) FROM public.weekly_planning WHERE user_id = target_user_id);

  -- Migrar observations
  UPDATE public.observations 
  SET user_id = target_user_id 
  WHERE user_id IS NULL;
  RAISE NOTICE 'Migradas % observaciones', (SELECT COUNT(*) FROM public.observations WHERE user_id = target_user_id);

  -- Migrar events
  UPDATE public.events 
  SET user_id = target_user_id 
  WHERE user_id IS NULL;
  RAISE NOTICE 'Migrados % eventos', (SELECT COUNT(*) FROM public.events WHERE user_id = target_user_id);

  -- Migrar grades
  UPDATE public.grades 
  SET user_id = target_user_id 
  WHERE user_id IS NULL;
  RAISE NOTICE 'Migradas % calificaciones', (SELECT COUNT(*) FROM public.grades WHERE user_id = target_user_id);

  RAISE NOTICE 'Migración completada exitosamente';
END $$;
*/

-- =====================================================
-- PASO 4: VERIFICAR LA MIGRACIÓN
-- =====================================================
-- Después de ejecutar la migración, verifica que no queden datos sin user_id:

SELECT 'courses' as tabla, COUNT(*) as registros_sin_user 
FROM public.courses WHERE user_id IS NULL
UNION ALL
SELECT 'students', COUNT(*) 
FROM public.students WHERE user_id IS NULL
UNION ALL
SELECT 'weekly_planning', COUNT(*) 
FROM public.weekly_planning WHERE user_id IS NULL
UNION ALL
SELECT 'observations', COUNT(*) 
FROM public.observations WHERE user_id IS NULL
UNION ALL
SELECT 'events', COUNT(*) 
FROM public.events WHERE user_id IS NULL
UNION ALL
SELECT 'grades', COUNT(*) 
FROM public.grades WHERE user_id IS NULL;

-- Todos deben mostrar 0 (cero)

-- =====================================================
-- PASO 5 (OPCIONAL): VERIFICAR DISTRIBUCIÓN POR USUARIO
-- =====================================================
-- Puedes ver cuántos registros tiene cada usuario:

SELECT 
  u.email,
  COUNT(DISTINCT c.id) as cursos,
  COUNT(DISTINCT s.id) as estudiantes,
  COUNT(DISTINCT wp.id) as planeaciones,
  COUNT(DISTINCT o.id) as observaciones,
  COUNT(DISTINCT e.id) as eventos
FROM auth.users u
LEFT JOIN public.courses c ON c.user_id = u.id
LEFT JOIN public.students s ON s.user_id = u.id
LEFT JOIN public.weekly_planning wp ON wp.user_id = u.id
LEFT JOIN public.observations o ON o.user_id = u.id
LEFT JOIN public.events e ON e.user_id = u.id
GROUP BY u.id, u.email
ORDER BY u.email;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- ✅ Este script es SEGURO de ejecutar - usa transacciones implícitas
-- ✅ Si algo sale mal, Supabase hará rollback automáticamente
-- ✅ Puedes ejecutar este script múltiples veces sin problema
-- ✅ Los registros que ya tienen user_id NO se modificarán
-- ⚠️  NO OLVIDES reemplazar 'PEGA-AQUI-TU-USER-ID' con tu ID real
-- ⚠️  NO ejecutes este script si no tienes datos existentes para migrar
