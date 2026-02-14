-- =====================================================
-- SCRIPT DE CONFIGURACIÓN DE AUTENTICACIÓN
-- =====================================================
-- Este script configura la base de datos para multi-usuario
-- Cada docente tendrá acceso solo a sus propios datos

-- =====================================================
-- 1. TABLA DE PERFILES DE DOCENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  institution TEXT,
  subject_specialty TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. MODIFICAR TABLA COURSES - AGREGAR user_id
-- =====================================================
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);

-- =====================================================
-- 3. MODIFICAR TABLA STUDENTS - AGREGAR user_id
-- =====================================================
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

-- =====================================================
-- 4. CREAR TABLA WEEKLY_PLANNING SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS weekly_planning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  unit TEXT NOT NULL,
  competence TEXT NOT NULL,
  standard TEXT NOT NULL,
  indicators JSONB DEFAULT '[]'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'current', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_planning_user_id ON weekly_planning(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_planning_course ON weekly_planning(course_id);

-- =====================================================
-- 5. CREAR TABLA OBSERVATIONS SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('academic', 'behavioral', 'attendance', 'positive')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_observations_user_id ON observations(user_id);
CREATE INDEX IF NOT EXISTS idx_observations_student ON observations(student_id);

-- =====================================================
-- 6. CREAR TABLA EVENTS (AGENDA) SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  type TEXT NOT NULL CHECK (type IN ('deadline', 'meeting', 'exam', 'planning', 'other')),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- =====================================================
-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. POLÍTICAS DE SEGURIDAD - TEACHER_PROFILES
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON teacher_profiles FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON teacher_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON teacher_profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 9. POLÍTICAS DE SEGURIDAD - COURSES
-- =====================================================

-- Los usuarios solo pueden ver sus propios cursos
CREATE POLICY "Users can view own courses"
  ON courses FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear cursos
CREATE POLICY "Users can insert own courses"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios cursos
CREATE POLICY "Users can update own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios cursos
CREATE POLICY "Users can delete own courses"
  ON courses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 10. POLÍTICAS DE SEGURIDAD - STUDENTS
-- =====================================================

CREATE POLICY "Users can view own students"
  ON students FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own students"
  ON students FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own students"
  ON students FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own students"
  ON students FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 11. POLÍTICAS DE SEGURIDAD - WEEKLY_PLANNING
-- =====================================================

CREATE POLICY "Users can view own planning"
  ON weekly_planning FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planning"
  ON weekly_planning FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planning"
  ON weekly_planning FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planning"
  ON weekly_planning FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 12. POLÍTICAS DE SEGURIDAD - OBSERVATIONS
-- =====================================================

CREATE POLICY "Users can view own observations"
  ON observations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own observations"
  ON observations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own observations"
  ON observations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own observations"
  ON observations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 13. POLÍTICAS DE SEGURIDAD - EVENTS
-- =====================================================

CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 14. FUNCIÓN PARA AUTO-CREAR PERFIL DE DOCENTE
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 15. FUNCIÓN PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_teacher_profiles_updated_at ON teacher_profiles;
CREATE TRIGGER update_teacher_profiles_updated_at 
  BEFORE UPDATE ON teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at 
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_planning_updated_at ON weekly_planning;
CREATE TRIGGER update_weekly_planning_updated_at 
  BEFORE UPDATE ON weekly_planning
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_observations_updated_at ON observations;
CREATE TRIGGER update_observations_updated_at 
  BEFORE UPDATE ON observations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
-- Ejecuta este script en el SQL Editor de Supabase
-- Luego configura las variables de entorno en tu proyecto
