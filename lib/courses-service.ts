import type { CourseDB, Course } from "@/lib/types"
import { dbCourseToFrontend } from "@/lib/types"
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabase = createClient()

export async function fetchCourses(): Promise<Course[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("grade", { ascending: true })
    .order("group_number", { ascending: true })

  if (error) {
    console.error("Error fetching courses:", error)
    return []
  }

  return (data ?? []).map(dbCourseToFrontend) // 🔥 ESTO ES LA CLAVE
}


export async function createCourse(
  userId: string,
  course: {
    subject: string
    grade: number
    groupNumber: number
    schedule: string
    students: number
    color: string
  }
): Promise<Course> {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      subject: course.subject,
      grade: course.grade,
      group_number: course.groupNumber,
      schedule: course.schedule,
      students_count: course.students,
      color: course.color,
      user_id: userId, // 🔥 CLAVE
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating course:", error)
    throw error
  }

  return dbCourseToFrontend(data as CourseDB)
}


export async function updateCourse(
  id: string,
  updates: Partial<{
    subject: string
    grade: number
    groupNumber: number
    schedule: string
    students: number
    color: string
  }>,
): Promise<Course> {
  const dbUpdates: Partial<CourseDB> = {}

  if (updates.subject !== undefined) dbUpdates.subject = updates.subject
  if (updates.grade !== undefined) dbUpdates.grade = updates.grade
  if (updates.groupNumber !== undefined) dbUpdates.group_number = updates.groupNumber
  if (updates.schedule !== undefined) dbUpdates.schedule = updates.schedule
  if (updates.students !== undefined) dbUpdates.students_count = updates.students
  if (updates.color !== undefined) dbUpdates.color = updates.color

  const { data, error } = await supabase.from("courses").update(dbUpdates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating course:", error)
    throw error
  }

  return dbCourseToFrontend(data as CourseDB)
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from("courses").delete().eq("id", id)

  if (error) {
    console.error("Error deleting course:", error)
    throw error
  }
}
function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

