// Global state store using SWR for data management
import useSWR, { mutate } from "swr"
import type { Course, Student, Observation, DiaryEntry, GradeEntry } from "./data"
import {
  courses as initialCourses,
  students as initialStudents,
  observations as initialObservations,
  diaryEntries as initialDiaryEntries,
  grades as initialGrades,
} from "./data"

// In-memory data storage (simulating a database)
let coursesData = [...initialCourses]
let studentsData = [...initialStudents]
let observationsData = [...initialObservations]
let diaryEntriesData = [...initialDiaryEntries]
let gradesData = [...initialGrades]

// Fetchers
const fetchCourses = () => Promise.resolve(coursesData)
const fetchStudents = () => Promise.resolve(studentsData)
const fetchObservations = () => Promise.resolve(observationsData)
const fetchDiaryEntries = () => Promise.resolve(diaryEntriesData)
const fetchGrades = () => Promise.resolve(gradesData)

// Hooks
export function useCourses() {
  const { data, error, isLoading } = useSWR("courses", fetchCourses)
  return { courses: data || [], error, isLoading }
}

export function useStudents() {
  const { data, error, isLoading } = useSWR("students", fetchStudents)
  return { students: data || [], error, isLoading }
}

export function useObservations() {
  const { data, error, isLoading } = useSWR("observations", fetchObservations)
  return { observations: data || [], error, isLoading }
}

export function useDiaryEntries() {
  const { data, error, isLoading } = useSWR("diary", fetchDiaryEntries)
  return { diaryEntries: data || [], error, isLoading }
}

export function useGrades() {
  const { data, error, isLoading } = useSWR("grades", fetchGrades)
  return { grades: data || [], error, isLoading }
}

// Course CRUD operations
export async function addCourse(course: Omit<Course, "id">) {
  const newCourse = { ...course, id: Date.now().toString() }
  coursesData = [...coursesData, newCourse]
  await mutate("courses")
  return newCourse
}

export async function updateCourse(id: string, updates: Partial<Course>) {
  coursesData = coursesData.map((c) => (c.id === id ? { ...c, ...updates } : c))
  await mutate("courses")
}

export async function deleteCourse(id: string) {
  coursesData = coursesData.filter((c) => c.id !== id)
  await mutate("courses")
}

// Student CRUD operations
export async function addStudent(student: Omit<Student, "id">) {
  const newStudent = { ...student, id: Date.now().toString() }
  studentsData = [...studentsData, newStudent]
  await mutate("students")
  return newStudent
}

export async function updateStudent(id: string, updates: Partial<Student>) {
  studentsData = studentsData.map((s) => (s.id === id ? { ...s, ...updates } : s))
  await mutate("students")
}

export async function deleteStudent(id: string) {
  studentsData = studentsData.filter((s) => s.id !== id)
  await mutate("students")
}

// Observation CRUD operations
export async function addObservation(observation: Omit<Observation, "id">) {
  const newObservation = { ...observation, id: Date.now().toString() }
  observationsData = [...observationsData, newObservation]
  // Update student observation count
  studentsData = studentsData.map((s) =>
    s.id === observation.studentId ? { ...s, observations: s.observations + 1 } : s,
  )
  await mutate("observations")
  await mutate("students")
  return newObservation
}

export async function updateObservation(id: string, updates: Partial<Observation>) {
  observationsData = observationsData.map((o) => (o.id === id ? { ...o, ...updates } : o))
  await mutate("observations")
}

export async function deleteObservation(id: string) {
  const observation = observationsData.find((o) => o.id === id)
  if (observation) {
    studentsData = studentsData.map((s) =>
      s.id === observation.studentId ? { ...s, observations: Math.max(0, s.observations - 1) } : s,
    )
  }
  observationsData = observationsData.filter((o) => o.id !== id)
  await mutate("observations")
  await mutate("students")
}

// Diary Entry CRUD operations
export async function addDiaryEntry(entry: Omit<DiaryEntry, "id">) {
  const newEntry = { ...entry, id: Date.now().toString() }
  diaryEntriesData = [...diaryEntriesData, newEntry]
  await mutate("diary")
  return newEntry
}

export async function updateDiaryEntry(id: string, updates: Partial<DiaryEntry>) {
  diaryEntriesData = diaryEntriesData.map((d) => (d.id === id ? { ...d, ...updates } : d))
  await mutate("diary")
}

export async function deleteDiaryEntry(id: string) {
  diaryEntriesData = diaryEntriesData.filter((d) => d.id !== id)
  await mutate("diary")
}

// Grade CRUD operations
export async function addGrade(grade: Omit<GradeEntry, "id">) {
  const newGrade = { ...grade, id: Date.now().toString() }
  gradesData = [...gradesData, newGrade]
  await mutate("grades")
  return newGrade
}

export async function updateGrade(id: string, updates: Partial<GradeEntry>) {
  gradesData = gradesData.map((g) => (g.id === id ? { ...g, ...updates } : g))
  await mutate("grades")
}

export async function deleteGrade(id: string) {
  gradesData = gradesData.filter((g) => g.id !== id)
  await mutate("grades")
}
