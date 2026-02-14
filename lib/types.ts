// ===============================
// Database types for Supabase
// ===============================
export type Period = "p1" | "p2" | "p3" | "p4"

export interface CourseDB {
  id: string
  subject: string
  grade: number
  group_number: number
  schedule: string | null
  students_count: number
  color: string
  created_at: string
  updated_at: string
}

// ===============================
// Frontend Course
// ===============================

export interface Course {
  id: string
  name: string
  subject: string
  grade: number
  groupNumber: number
  schedule: string
  students: number
  color: string
}

export function formatCourseName(
  subject: string,
  grade: number,
  groupNumber: number
): string {
  return `${subject} ${grade}-${groupNumber}`
}

export function dbCourseToFrontend(dbCourse: CourseDB): Course {
  return {
    id: dbCourse.id,
    name: formatCourseName(
      dbCourse.subject,
      dbCourse.grade,
      dbCourse.group_number
    ),
    subject: dbCourse.subject,
    grade: dbCourse.grade,
    groupNumber: dbCourse.group_number,
    schedule: dbCourse.schedule || "",
    students: dbCourse.students_count,
    color: dbCourse.color,
  }
}

// ===============================
// GRADES (MODELO FINAL)
// ===============================

export type GradeItem = {
  value: number
  title?: string
  createdAt: string
}

export type Grades = {
  p1: GradeItem[]
  p2: GradeItem[]
  p3: GradeItem[]
  p4: GradeItem[]
}

// helper seguro
export const emptyGrades: Grades = {
  p1: [],
  p2: [],
  p3: [],
  p4: [],
}

// ===============================
// Grades DB (tabla grades)
// ===============================

export interface GradeDB {
  id: string
  student_id: string
  student_name: string
  subject: string
  activity: string
  grade: number
  period: "p1" | "p2" | "p3" | "p4"
  date: string
  course_id: string
  created_at: string
}

// ===============================
// Grade Frontend
// ===============================

export interface GradeEntry {
  id: string
  studentId: string
  studentName: string
  subject: string
  activity: string
  grade: number
  period: string
  date: string
  courseId: string   // 🔥 AGREGAR ESTO
}


export type CreateGradeData = Omit<GradeEntry, "id">

export function dbGradeToFrontend(db: GradeDB): GradeEntry {
  return {
    id: db.id,
    studentId: db.student_id,
    studentName: db.student_name,
    subject: db.subject,
    activity: db.activity,
    grade: db.grade,
    period: db.period,
    date: db.date,
    courseId: db.course_id,
  }
}

// ===============================
// Student DB (Supabase)
// ===============================

export interface StudentDB {
  id: string
  first_name: string
  last_name: string
  gender: "masculino" | "femenino" | "otro"
  birth_date: string
  document_type: "TI" | "CC" | "RC" | "CE" | "PEP"
  document_number: string | null
  course_id: string | null
  enrollment_date: string
  status: "active" | "inactive" | "transferred" | "graduated"
  blood_type: string | null
  health_insurance: string | null
  disabilities: string | null
  special_needs: string | null
  allergies: string | null
  email: string | null
  phone: string | null
  address: string | null
  neighborhood: string | null
  city: string | null
  guardian_name: string | null
  guardian_relationship: string | null
  guardian_phone: string | null
  guardian_email: string | null
  guardian_occupation: string | null
  guardian_address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  photo_url: string | null
  notes: string | null

  // ✅ jsonb con objetos
  grades: Grades | null

  created_at: string
  updated_at: string
}

// ===============================
// Student Frontend
// ===============================

export interface Student {
  id: string
  firstName: string
  lastName: string
  fullName: string
  gender: "masculino" | "femenino" | "otro"
  birthDate: string
  age: number
  documentType: "TI" | "CC" | "RC" | "CE" | "PEP"
  documentNumber: string
  courseId: string | null
  courseName?: string
  enrollmentDate: string
  status: "active" | "inactive" | "transferred" | "graduated"
  bloodType: string
  healthInsurance: string
  disabilities: string
  specialNeeds: string
  allergies: string
  email: string
  phone: string
  address: string
  neighborhood: string
  city: string
  guardianName: string
  guardianRelationship: string
  guardianPhone: string
  guardianEmail: string
  guardianOccupation: string
  guardianAddress: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  photoUrl: string
  notes: string

  // ✅ mismo modelo que DB
  grades: Grades
}

// ===============================
// Update Student
// ===============================

export type UpdateStudentData = {
  grades?: Grades
}

// ===============================
// Helpers
// ===============================

export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--
  }
  return age
}

// ===============================
// DB → Frontend mapper
// ===============================

export function dbStudentToFrontend(
  dbStudent: StudentDB,
  courseName?: string
): Student {
  return {
    id: dbStudent.id,
    firstName: dbStudent.first_name,
    lastName: dbStudent.last_name,
    fullName: `${dbStudent.first_name} ${dbStudent.last_name}`,
    gender: dbStudent.gender,
    birthDate: dbStudent.birth_date,
    age: calculateAge(dbStudent.birth_date),
    documentType: dbStudent.document_type,
    documentNumber: dbStudent.document_number || "",
    courseId: dbStudent.course_id,
    courseName,
    enrollmentDate: dbStudent.enrollment_date,
    status: dbStudent.status,
    bloodType: dbStudent.blood_type || "",
    healthInsurance: dbStudent.health_insurance || "",
    disabilities: dbStudent.disabilities || "",
    specialNeeds: dbStudent.special_needs || "",
    allergies: dbStudent.allergies || "",
    email: dbStudent.email || "",
    phone: dbStudent.phone || "",
    address: dbStudent.address || "",
    neighborhood: dbStudent.neighborhood || "",
    city: dbStudent.city || "Bogotá",
    guardianName: dbStudent.guardian_name || "",
    guardianRelationship: dbStudent.guardian_relationship || "",
    guardianPhone: dbStudent.guardian_phone || "",
    guardianEmail: dbStudent.guardian_email || "",
    guardianOccupation: dbStudent.guardian_occupation || "",
    guardianAddress: dbStudent.guardian_address || "",
    emergencyContactName: dbStudent.emergency_contact_name || "",
    emergencyContactPhone: dbStudent.emergency_contact_phone || "",
    emergencyContactRelationship:
      dbStudent.emergency_contact_relationship || "",
    photoUrl: dbStudent.photo_url || "",
    notes: dbStudent.notes || "",

    // ✅ SIEMPRE estructura válida
    grades: dbStudent.grades ?? emptyGrades,
  }
}

// ===============================
// Weekly Planning Types
// ===============================

export interface WeeklyActivity {
  day: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes"
  activity: string
}

export interface WeeklyPlanningDB {
  id: string
  course_id: string
  week_number: number
  start_date: string
  end_date: string
  unit: string
  competence: string
  standard: string
  indicators: string[] // Array de strings en JSONB
  activities: WeeklyActivity[] // Array de objetos en JSONB
  resources: string[] // Array de strings en JSONB
  status: "draft" | "current" | "completed"
  created_at: string
  updated_at: string
}

export interface WeeklyPlanning {
  id: string
  courseId: string
  courseName?: string
  weekNumber: number
  startDate: string
  endDate: string
  dateRange: string // "13 - 17 Enero 2026"
  unit: string
  competence: string
  standard: string
  indicators: string[]
  activities: WeeklyActivity[]
  resources: string[]
  status: "draft" | "current" | "completed"
}

export interface CreateWeeklyPlanningData {
  courseId: string
  weekNumber: number
  startDate: string
  endDate: string
  unit: string
  competence: string
  standard: string
  indicators: string[]
  activities: WeeklyActivity[]
  resources: string[]
  status?: "draft" | "current" | "completed"
}

// ===============================
// Helper Functions
// ===============================

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  const startDay = start.getDate()
  const endDay = end.getDate()
  const month = months[end.getMonth()]
  const year = end.getFullYear()
  
  return `${startDay} - ${endDay} ${month} ${year}`
}

export function dbPlanningToFrontend(
  dbPlanning: WeeklyPlanningDB,
  courseName?: string
): WeeklyPlanning {
  return {
    id: dbPlanning.id,
    courseId: dbPlanning.course_id,
    courseName,
    weekNumber: dbPlanning.week_number,
    startDate: dbPlanning.start_date,
    endDate: dbPlanning.end_date,
    dateRange: formatDateRange(dbPlanning.start_date, dbPlanning.end_date),
    unit: dbPlanning.unit,
    competence: dbPlanning.competence,
    standard: dbPlanning.standard,
    indicators: dbPlanning.indicators || [],
    activities: dbPlanning.activities || [],
    resources: dbPlanning.resources || [],
    status: dbPlanning.status,
  }
}

// ===============================
// SQL para crear la tabla
// ===============================

/*
CREATE TABLE weekly_planning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Índices para mejorar el rendimiento
CREATE INDEX idx_weekly_planning_course ON weekly_planning(course_id);
CREATE INDEX idx_weekly_planning_status ON weekly_planning(status);
CREATE INDEX idx_weekly_planning_dates ON weekly_planning(start_date, end_date);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_weekly_planning_updated_at 
BEFORE UPDATE ON weekly_planning
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/

// ===============================
// Observations Types
// ===============================

export interface ObservationDB {
  id: string
  student_id: string
  type: "academic" | "behavioral" | "attendance" | "positive"
  severity: "low" | "medium" | "high"
  description: string
  date: string
  created_at: string
  updated_at: string
}

export interface Observation {
  id: string
  studentId: string
  studentName: string
  type: "academic" | "behavioral" | "attendance" | "positive"
  severity: "low" | "medium" | "high"
  description: string
  date: string
  createdAt: string
}

export interface CreateObservationData {
  studentId: string
  type: "academic" | "behavioral" | "attendance" | "positive"
  severity: "low" | "medium" | "high"
  description: string
  date: string
}

// ===============================
// Helper Functions
// ===============================

export function dbObservationToFrontend(
  dbObservation: ObservationDB,
  studentName?: string
): Observation {
  return {
    id: dbObservation.id,
    studentId: dbObservation.student_id,
    studentName: studentName || "",
    type: dbObservation.type,
    severity: dbObservation.severity,
    description: dbObservation.description,
    date: dbObservation.date,
    createdAt: dbObservation.created_at,
  }
}

export interface EventDB {
  id: string
  title: string
  description: string | null
  date: string
  time: string | null
  type: "deadline" | "meeting" | "exam" | "planning" | "other"
  course_id: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  date: string
  time: string | null
  type: "deadline" | "meeting" | "exam" | "planning" | "other"
  courseId: string | null
  courseName?: string
  createdAt: string
}

export interface CreateEventData {
  title: string
  description?: string
  date: string
  time?: string
  type: "deadline" | "meeting" | "exam" | "planning" | "other"
  courseId?: string
}

// ===============================
// HELPERS
// ===============================

export function dbEventToFrontend(dbEvent: EventDB, courseName?: string): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    date: dbEvent.date,
    time: dbEvent.time,
    type: dbEvent.type,
    courseId: dbEvent.course_id,
    courseName,
    createdAt: dbEvent.created_at,
  }
}

// ===============================
// Teacher DB (Supabase)
// ===============================

export interface TeacherProfileDB {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  institution: string | null
  subject_specialty: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ===============================
// Teacher Frontend
// ===============================

export interface TeacherProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  institution: string
  subjectSpecialty: string
  avatarUrl: string
}


export function dbTeacherProfileToFrontend(
  db: TeacherProfileDB
): TeacherProfile {
  return {
    id: db.id,
    userId: db.user_id,
    firstName: db.first_name,
    lastName: db.last_name,
    fullName: `${db.first_name} ${db.last_name}`,
    email: db.email,
    institution: db.institution || "",
    subjectSpecialty: db.subject_specialty || "",
    avatarUrl: db.avatar_url || "",
  }
}
