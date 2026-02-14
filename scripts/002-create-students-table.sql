-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Información básica
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('masculino', 'femenino', 'otro')),
  birth_date DATE NOT NULL,
  document_type VARCHAR(20) DEFAULT 'TI' CHECK (document_type IN ('TI', 'CC', 'RC', 'CE', 'PEP')),
  document_number VARCHAR(20),
  
  -- Información académica
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated')),
  
  -- Información de salud y necesidades especiales
  blood_type VARCHAR(5),
  health_insurance VARCHAR(100),
  disabilities TEXT,
  special_needs TEXT,
  allergies TEXT,
  
  -- Información de contacto del estudiante
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  neighborhood VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Bogotá',
  
  -- Información del acudiente/padre
  guardian_name VARCHAR(200),
  guardian_relationship VARCHAR(50),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  guardian_occupation VARCHAR(100),
  guardian_address TEXT,
  
  -- Contacto de emergencia adicional
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  
  -- Información adicional
  photo_url TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_students_course_id ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_last_name ON students(last_name);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations (adjust as needed for your auth setup)
CREATE POLICY "Allow all operations on students" ON students
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_students_updated_at();
