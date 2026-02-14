// Mock data for the educational platform

export interface Student {
  id: string
  name: string
  grade: string
  avatar?: string
  email?: string
  phone?: string
  averageGrade: number
  observations: number
  status: "active" | "inactive"
}

export interface Course {
  id: string
  name: string
  grade: string
  students: number
  schedule: string
  color: string
}

export interface Observation {
  id: string
  studentId: string
  studentName: string
  type: "academic" | "behavioral"
  severity: "low" | "medium" | "high"
  description: string
  date: string
}

export interface DiaryEntry {
  id: string
  courseId: string
  courseName: string
  date: string
  topic: string
  activities: string
  observations: string
}

export interface GradeEntry {
  id: string
  studentId: string
  studentName: string
  subject: string
  activity: string
  grade: number
  periodId: string
  date: string
  courseId: string   // 🔥 AGREGAR ESTO
}



export const courses: Course[] = [
  {
    id: "1",
    name: "Matemáticas",
    grade: "5° Primaria",
    students: 28,
    schedule: "Lun-Mié-Vie 8:00-9:30",
    color: "bg-chart-1",
  },
  {
    id: "2",
    name: "Ciencias Naturales",
    grade: "5° Primaria",
    students: 28,
    schedule: "Mar-Jue 10:00-11:30",
    color: "bg-chart-2",
  },
  {
    id: "3",
    name: "Español",
    grade: "6° Primaria",
    students: 32,
    schedule: "Lun-Mié-Vie 10:00-11:30",
    color: "bg-chart-3",
  },
  { id: "4", name: "Historia", grade: "6° Primaria", students: 32, schedule: "Mar-Jue 8:00-9:30", color: "bg-chart-4" },
]

export const students: Student[] = [
  { id: "1", name: "Ana María García", grade: "5° Primaria", averageGrade: 4.5, observations: 1, status: "active" },
  { id: "2", name: "Carlos Andrés López", grade: "5° Primaria", averageGrade: 3.8, observations: 3, status: "active" },
  { id: "3", name: "María José Rodríguez", grade: "5° Primaria", averageGrade: 4.8, observations: 0, status: "active" },
  { id: "4", name: "Juan Pablo Martínez", grade: "5° Primaria", averageGrade: 2.9, observations: 5, status: "active" },
  {
    id: "5",
    name: "Laura Valentina Pérez",
    grade: "6° Primaria",
    averageGrade: 4.2,
    observations: 2,
    status: "active",
  },
  {
    id: "6",
    name: "Santiago José Hernández",
    grade: "6° Primaria",
    averageGrade: 3.5,
    observations: 4,
    status: "active",
  },
  { id: "7", name: "Valentina Torres", grade: "6° Primaria", averageGrade: 4.7, observations: 0, status: "active" },
  {
    id: "8",
    name: "Daniel Felipe Gómez",
    grade: "6° Primaria",
    averageGrade: 3.2,
    observations: 2,
    status: "inactive",
  },
]

export const observations: Observation[] = [
  {
    id: "1",
    studentId: "2",
    studentName: "Carlos Andrés López",
    type: "academic",
    severity: "medium",
    description: "Dificultad con operaciones de fracciones",
    date: "2026-01-10",
  },
  {
    id: "2",
    studentId: "4",
    studentName: "Juan Pablo Martínez",
    type: "behavioral",
    severity: "high",
    description: "Interrupción constante en clase",
    date: "2026-01-12",
  },
  {
    id: "3",
    studentId: "6",
    studentName: "Santiago José Hernández",
    type: "academic",
    severity: "low",
    description: "Mejoría en comprensión lectora",
    date: "2026-01-13",
  },
  {
    id: "4",
    studentId: "4",
    studentName: "Juan Pablo Martínez",
    type: "behavioral",
    severity: "medium",
    description: "No entregó tarea por tercera vez",
    date: "2026-01-14",
  },
]

export const diaryEntries: DiaryEntry[] = [
  {
    id: "1",
    courseId: "1",
    courseName: "Matemáticas 5°",
    date: "2026-01-13",
    topic: "Fracciones equivalentes",
    activities: "Ejercicios prácticos con material concreto",
    observations: "Los estudiantes mostraron interés en la actividad",
  },
  {
    id: "2",
    courseId: "2",
    courseName: "Ciencias 5°",
    date: "2026-01-14",
    topic: "El sistema solar",
    activities: "Presentación multimedia y maqueta",
    observations: "Se requiere reforzar nombres de planetas",
  },
  {
    id: "3",
    courseId: "3",
    courseName: "Español 6°",
    date: "2026-01-14",
    topic: "Textos argumentativos",
    activities: "Debate en grupos sobre temas actuales",
    observations: "Buena participación general",
  },
]

export const grades: GradeEntry[] = [
  {
    id: "1",
    studentId: "1",
    studentName: "Ana María García",
    subject: "Matemáticas",
    activity: "Evaluación de fracciones",
    grade: 4.5,
    periodId: "1",          // ✅ string
    date: "2026-01-10",
    courseId: "1",        // ✅ obligatorio
  },
  {
    id: "2",
    studentId: "2",
    studentName: "Carlos Andrés López",
    subject: "Matemáticas",
    activity: "Evaluación de fracciones",
    grade: 3.2,
    periodId: "1",
    date: "2026-01-10",
    courseId: "1",
  },
]



export const alerts = [
  {
    id: "1",
    type: "low-grade",
    message: "Juan Pablo Martínez tiene promedio inferior a 3.0",
    student: "Juan Pablo Martínez",
  },
  {
    id: "2",
    type: "observations",
    message: "Juan Pablo Martínez tiene 5 observaciones este periodo",
    student: "Juan Pablo Martínez",
  },
  {
    id: "3",
    type: "low-grade",
    message: "Daniel Felipe Gómez tiene promedio inferior a 3.5",
    student: "Daniel Felipe Gómez",
  },
]
