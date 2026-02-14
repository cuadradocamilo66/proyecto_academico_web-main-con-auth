-- Create courses table with the new structure
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject VARCHAR(100) NOT NULL, -- Materia (ej: Informática, Matemáticas)
  grade INTEGER NOT NULL, -- Grado (1-11)
  group_number INTEGER NOT NULL, -- Número de curso/grupo (1, 2, 3...)
  schedule VARCHAR(100), -- Horario
  students_count INTEGER DEFAULT 0, -- Número de estudiantes
  color VARCHAR(50) DEFAULT 'bg-chart-1', -- Color para visualización
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate courses
  UNIQUE(subject, grade, group_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_grade ON courses(grade);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (you can modify this later for auth)
CREATE POLICY "Allow all operations on courses" ON courses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
