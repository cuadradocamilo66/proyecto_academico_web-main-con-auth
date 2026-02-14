import { supabase } from "@/lib/supabase/client"
// Agregar esta función al archivo lib/activity-service.ts



export async function fetchActivities() {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchActivitiesByPeriod(periodId: string) {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("period_id", periodId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchActivityGrades(activityId: string) {
  const { data, error } = await supabase
    .from("activity_grades")
    .select("*")
    .eq("activity_id", activityId)

  if (error) throw error
  return data || []
}

export async function updateActivity(activityId: string, updates: {
  title?: string
  description?: string
}) {
  const { data, error } = await supabase
    .from("activities")
    .update(updates)
    .eq("id", activityId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteActivity(activityId: string) {
  // Primero eliminar las notas asociadas
  await supabase
    .from("activity_grades")
    .delete()
    .eq("activity_id", activityId)

  // Luego eliminar la actividad
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId)

  if (error) throw error
}

export async function updateActivityGrade(gradeId: string, value: number) {
  const { data, error } = await supabase
    .from("activity_grades")
    .update({ value })
    .eq("id", gradeId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteActivityGrade(gradeId: string) {
  const { error } = await supabase
    .from("activity_grades")
    .delete()
    .eq("id", gradeId)

  if (error) throw error
}
export interface CreateActivityData {
  courseId: string
  periodId: string
  title: string
  description?: string
}

export async function createActivity(data: CreateActivityData) {
  const { data: activity, error } = await supabase
    .from("activities")
    .insert({
      course_id: data.courseId,
      period_id: data.periodId,
      title: data.title,
      description: data.description ?? null,
    })
    .select()

  if (error) {
    console.error("Supabase full error:", JSON.stringify(error, null, 2))
    throw new Error(error.message)
  }

  return activity?.[0]
}


export async function createActivityGrade(data: {
  activityId: string
  studentId: string
  value: number
}) {
  const { error } = await supabase
    .from("activity_grades")
    .insert({
      activity_id: data.activityId,
      student_id: data.studentId,
      value: data.value,
    })

  if (error) throw error
}
