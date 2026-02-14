-- =====================================================
-- SCRIPT DE CONFIGURACIÓN DE AUTENTICACIÓN (CORREGIDO)
-- =====================================================
-- Este script configura la base de datos para multi-usuario
-- Respeta el esquema existente y agrega funcionalidad de autenticación

-- =====================================================
-- 1. TABLA DE PERFILES DE DOCENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  institution text,
  subject_specialty text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_email ON public.teacher_profiles(email);

-- =====================================================
-- 2. MODIFICAR TABLA COURSES - AGREGAR user_id
-- =====================================================
-- Agregar columna user_id si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'courses' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.courses 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);

-- =====================================================
-- 3. MODIFICAR TABLA STUDENTS - AGREGAR user_id
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'students' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.students 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- =====================================================
-- 4. MODIFICAR TABLA WEEKLY_PLANNING - AGREGAR user_id
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'weekly_planning' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.weekly_planning 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_weekly_planning_user_id ON public.weekly_planning(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_planning_course ON public.weekly_planning(course_id);

-- =====================================================
-- 5. MODIFICAR TABLA OBSERVATIONS - AGREGAR user_id
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'observations' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.observations 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_observations_user_id ON public.observations(user_id);
CREATE INDEX IF NOT EXISTS idx_observations_student ON public.observations(student_id);

-- =====================================================
-- 6. MODIFICAR TABLA EVENTS - AGREGAR user_id
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.events 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);

-- =====================================================
-- 7. MODIFICAR TABLA GRADES - AGREGAR user_id
-- =====================================================
-- Nota: La tabla grades existe pero parece no usarse en el código actual
-- El código usa el campo JSONB grades en students
-- Agregamos user_id por si acaso se usa en el futuro
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'grades' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.grades 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_grades_user_id ON public.grades(user_id);

-- =====================================================
-- 8. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. ELIMINAR POLÍTICAS EXISTENTES (SI EXISTEN)
-- =====================================================

-- Teacher Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.teacher_profiles;

-- Courses
DROP POLICY IF EXISTS "Users can view own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can insert own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can delete own courses" ON public.courses;

-- Students
DROP POLICY IF EXISTS "Users can view own students" ON public.students;
DROP POLICY IF EXISTS "Users can insert own students" ON public.students;
DROP POLICY IF EXISTS "Users can update own students" ON public.students;
DROP POLICY IF EXISTS "Users can delete own students" ON public.students;

-- Weekly Planning
DROP POLICY IF EXISTS "Users can view own planning" ON public.weekly_planning;
DROP POLICY IF EXISTS "Users can insert own planning" ON public.weekly_planning;
DROP POLICY IF EXISTS "Users can update own planning" ON public.weekly_planning;
DROP POLICY IF EXISTS "Users can delete own planning" ON public.weekly_planning;

-- Observations
DROP POLICY IF EXISTS "Users can view own observations" ON public.observations;
DROP POLICY IF EXISTS "Users can insert own observations" ON public.observations;
DROP POLICY IF EXISTS "Users can update own observations" ON public.observations;
DROP POLICY IF EXISTS "Users can delete own observations" ON public.observations;

-- Events
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

-- Grades
DROP POLICY IF EXISTS "Users can view own grades" ON public.grades;
DROP POLICY IF EXISTS "Users can insert own grades" ON public.grades;
DROP POLICY IF EXISTS "Users can update own grades" ON public.grades;
DROP POLICY IF EXISTS "Users can delete own grades" ON public.grades;

-- =====================================================
-- 10. POLÍTICAS DE SEGURIDAD - TEACHER_PROFILES
-- =====================================================

CREATE POLICY "Users can view own profile"
  ON public.teacher_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.teacher_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.teacher_profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 11. POLÍTICAS DE SEGURIDAD - COURSES
-- =====================================================

CREATE POLICY "Users can view own courses"
  ON public.courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses"
  ON public.courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses"
  ON public.courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses"
  ON public.courses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 12. POLÍTICAS DE SEGURIDAD - STUDENTS
-- =====================================================

CREATE POLICY "Users can view own students"
  ON public.students FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own students"
  ON public.students FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own students"
  ON public.students FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own students"
  ON public.students FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 13. POLÍTICAS DE SEGURIDAD - WEEKLY_PLANNING
-- =====================================================

CREATE POLICY "Users can view own planning"
  ON public.weekly_planning FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planning"
  ON public.weekly_planning FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planning"
  ON public.weekly_planning FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planning"
  ON public.weekly_planning FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 14. POLÍTICAS DE SEGURIDAD - OBSERVATIONS
-- =====================================================

CREATE POLICY "Users can view own observations"
  ON public.observations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own observations"
  ON public.observations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own observations"
  ON public.observations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own observations"
  ON public.observations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 15. POLÍTICAS DE SEGURIDAD - EVENTS
-- =====================================================

CREATE POLICY "Users can view own events"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 16. POLÍTICAS DE SEGURIDAD - GRADES
-- =====================================================

CREATE POLICY "Users can view own grades"
  ON public.grades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grades"
  ON public.grades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grades"
  ON public.grades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grades"
  ON public.grades FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 17. FUNCIÓN PARA AUTO-CREAR PERFIL DE DOCENTE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teacher_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Si el perfil ya existe, no hacer nada
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existe y recrearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 18. FUNCIÓN PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar triggers existentes si existen y recrearlos
DROP TRIGGER IF EXISTS update_teacher_profiles_updated_at ON public.teacher_profiles;
CREATE TRIGGER update_teacher_profiles_updated_at 
  BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at 
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_planning_updated_at ON public.weekly_planning;
CREATE TRIGGER update_weekly_planning_updated_at 
  BEFORE UPDATE ON public.weekly_planning
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_observations_updated_at ON public.observations;
CREATE TRIGGER update_observations_updated_at 
  BEFORE UPDATE ON public.observations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 19. SCRIPT DE MIGRACIÓN DE DATOS EXISTENTES (OPCIONAL)
-- =====================================================
-- IMPORTANTE: Este script asigna todos los datos existentes a un usuario específico
-- Debes reemplazar 'TU-USER-ID-AQUI' con el ID del usuario al que quieres asignar los datos
-- Puedes obtener el ID del usuario después de registrarte en la aplicación
-- Para ejecutar: descomenta las líneas y reemplaza 'TU-USER-ID-AQUI'

-- EJEMPLO:
-- UPDATE public.courses SET user_id = 'TU-USER-ID-AQUI' WHERE user_id IS NULL;
-- UPDATE public.students SET user_id = 'TU-USER-ID-AQUI' WHERE user_id IS NULL;
-- UPDATE public.weekly_planning SET user_id = 'TU-USER-ID-AQUI' WHERE user_id IS NULL;
-- UPDATE public.observations SET user_id = 'TU-USER-ID-AQUI' WHERE user_id IS NULL;
-- UPDATE public.events SET user_id = 'TU-USER-ID-AQUI' WHERE user_id IS NULL;
-- UPDATE public.grades SET user_id = 'TU-USER-ID-AQUI' WHERE user_id IS NULL;

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
-- ✅ Tabla teacher_profiles creada
-- ✅ Columna user_id agregada a todas las tablas
-- ✅ Row Level Security habilitado
-- ✅ Políticas de seguridad configuradas
-- ✅ Triggers configurados
-- ✅ Índices creados para mejor rendimiento

-- PRÓXIMOS PASOS:
-- 1. Configura las variables de entorno en tu proyecto (.env.local)
-- 2. Registra un nuevo usuario en la aplicación
-- 3. (Opcional) Migra datos existentes usando el script de la sección 19
-- 4. Actualiza los servicios en tu código (ver courses-service-updated.ts como ejemplo)
