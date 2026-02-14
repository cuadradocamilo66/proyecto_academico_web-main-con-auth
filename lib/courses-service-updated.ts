import type { CourseDB, Course } from "@/lib/types"
import { dbCourseToFrontend } from "@/lib/types"
import { supabase } from "./supabase/client"
import { getCurrentUser } from "./auth-service"

/**
 * Obtiene todos los cursos del usuario autenticado
 */
export async function fetchCourses(): Promise<Course[]> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Usuario no autenticado")

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id) // Solo cursos del usuario actual
    .order("grade", { ascending: true })
    .order("group_number", { ascending: true })

  if (error) {
    console.error("Error fetching courses:", error)
    throw error
  }

  return (data as CourseDB[]).map(dbCourseToFrontend)
}

/**
 * Crea un nuevo curso para el usuario autenticado
 */
export async function createCourse(course: {
  subject: string
  grade: number
  groupNumber: number
  schedule: string
  students: number
  color: string
}): Promise<Course> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Usuario no autenticado")

  const { data, error } = await supabase
    .from("courses")
    .insert({
      user_id: user.id, // Asociar curso al usuario
      subject: course.subject,
      grade: course.grade,
      group_number: course.groupNumber,
      schedule: course.schedule,
      students_count: course.students,
      color: course.color,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating course:", error)
    throw error
  }

  return dbCourseToFrontend(data as CourseDB)
}

/**
 * Actualiza un curso existente
 * Solo el propietario puede actualizar el curso (gracias a RLS)
 */
export async function updateCourse(
  id: string,
  updates: Partial<{
    subject: string
    grade: number
    groupNumber: number
    schedule: string
    students: number
    color: string
  }>
): Promise<Course> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Usuario no autenticado")

  const dbUpdates: Partial<CourseDB> = {}

  if (updates.subject !== undefined) dbUpdates.subject = updates.subject
  if (updates.grade !== undefined) dbUpdates.grade = updates.grade
  if (updates.groupNumber !== undefined) dbUpdates.group_number = updates.groupNumber
  if (updates.schedule !== undefined) dbUpdates.schedule = updates.schedule
  if (updates.students !== undefined) dbUpdates.students_count = updates.students
  if (updates.color !== undefined) dbUpdates.color = updates.color

  const { data, error } = await supabase
    .from("courses")
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", user.id) // Solo actualizar si es del usuario
    .select()
    .single()

  if (error) {
    console.error("Error updating course:", error)
    throw error
  }

  return dbCourseToFrontend(data as CourseDB)
}

/**
 * Elimina un curso
 * Solo el propietario puede eliminar el curso (gracias a RLS)
 */
export async function deleteCourse(id: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Usuario no autenticado")

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id) // Solo eliminar si es del usuario

  if (error) {
    console.error("Error deleting course:", error)
    throw error
  }
}

/**
 * Obtiene un curso específico por ID
 */
export async function getCourseById(id: string): Promise<Course | null> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Usuario no autenticado")

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // No encontrado
    console.error("Error fetching course:", error)
    throw error
  }

  return dbCourseToFrontend(data as CourseDB)
}
