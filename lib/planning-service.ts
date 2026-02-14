import { supabase } from "@/lib/supabase/client"
import type { 
  WeeklyPlanningDB, 
  WeeklyPlanning, 
  CreateWeeklyPlanningData 
} from "@/lib/types"
import { dbPlanningToFrontend, formatCourseName } from "@/lib/types"

/* =========================
   FETCH
========================= */

export async function fetchPlanningsByCourse(courseId: string): Promise<WeeklyPlanning[]> {
  const { data, error } = await supabase
    .from("weekly_planning")
    .select(`
      *,
      course:course_id (
        subject,
        grade,
        group_number
      )
    `)
    .eq("course_id", courseId)
    .order("start_date", { ascending: true })

  if (error) {
    console.error("Error fetching plannings:", error)
    throw error
  }

  return data.map((planning: WeeklyPlanningDB & { course?: any }) => {
    const courseName = planning.course
      ? formatCourseName(
          planning.course.subject,
          planning.course.grade,
          planning.course.group_number
        )
      : undefined

    return dbPlanningToFrontend(planning, courseName)
  })
}

export async function fetchAllPlannings(): Promise<WeeklyPlanning[]> {
  const { data, error } = await supabase
    .from("weekly_planning")
    .select(`
      *,
      course:course_id (
        subject,
        grade,
        group_number
      )
    `)
    .order("start_date", { ascending: true })

  if (error) {
    console.error("Error fetching all plannings:", error)
    throw error
  }

  return data.map((planning: WeeklyPlanningDB & { course?: any }) => {
    const courseName = planning.course
      ? formatCourseName(
          planning.course.subject,
          planning.course.grade,
          planning.course.group_number
        )
      : undefined

    return dbPlanningToFrontend(planning, courseName)
  })
}

export async function fetchCurrentPlanning(courseId: string): Promise<WeeklyPlanning | null> {
  const { data, error } = await supabase
    .from("weekly_planning")
    .select(`
      *,
      course:course_id (
        subject,
        grade,
        group_number
      )
    `)
    .eq("course_id", courseId)
    .eq("status", "current")
    .maybeSingle()

  if (error) {
    console.error("Error fetching current planning:", error)
    return null
  }

  if (!data) return null

  const courseName = data.course
    ? formatCourseName(data.course.subject, data.course.grade, data.course.group_number)
    : undefined

  return dbPlanningToFrontend(data as WeeklyPlanningDB, courseName)
}

/* =========================
   CREATE
========================= */

export async function createPlanning(
  planning: CreateWeeklyPlanningData
): Promise<WeeklyPlanning> {

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("weekly_planning")
    .insert({
      course_id: planning.courseId,
      week_number: planning.weekNumber,
      start_date: planning.startDate,
      end_date: planning.endDate,
      unit: planning.unit,
      competence: planning.competence,
      standard: planning.standard,
      indicators: planning.indicators,
      activities: planning.activities,
      resources: planning.resources,
      status: planning.status || "draft",
      user_id: user.id, // 🔥 CLAVE
    })
    .select()
    .single()

  if (error) {
    console.error("FULL ERROR:", error)
    throw error
  }

  return dbPlanningToFrontend(data as WeeklyPlanningDB)
}


/* =========================
   UPDATE
========================= */

export type UpdatePlanningData = Partial<CreateWeeklyPlanningData>

export async function updatePlanning(
  id: string,
  updates: UpdatePlanningData
): Promise<WeeklyPlanning> {
  const dbUpdates: Record<string, unknown> = {}

  if (updates.weekNumber !== undefined) dbUpdates.week_number = updates.weekNumber
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit
  if (updates.competence !== undefined) dbUpdates.competence = updates.competence
  if (updates.standard !== undefined) dbUpdates.standard = updates.standard
  if (updates.indicators !== undefined) dbUpdates.indicators = updates.indicators
  if (updates.activities !== undefined) dbUpdates.activities = updates.activities
  if (updates.resources !== undefined) dbUpdates.resources = updates.resources
  if (updates.status !== undefined) dbUpdates.status = updates.status

  const { data, error } = await supabase
    .from("weekly_planning")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating planning:", error)
    throw error
  }

  return dbPlanningToFrontend(data as WeeklyPlanningDB)
}

/* =========================
   DELETE
========================= */

export async function deletePlanning(id: string): Promise<void> {
  const { error } = await supabase
    .from("weekly_planning")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting planning:", error)
    throw error
  }
}

/* =========================
   DUPLICATE
========================= */

export async function duplicatePlanning(
  id: string,
  newStartDate: string,
  newEndDate: string
): Promise<WeeklyPlanning> {
  // Fetch the original planning
  const { data: original, error: fetchError } = await supabase
    .from("weekly_planning")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !original) {
    console.error("Error fetching planning to duplicate:", fetchError)
    throw fetchError
  }

  // Create a new planning with the same data but new dates
  const { data, error } = await supabase
    .from("weekly_planning")
    .insert({
      course_id: original.course_id,
      week_number: original.week_number + 1,
      start_date: newStartDate,
      end_date: newEndDate,
      unit: original.unit,
      competence: original.competence,
      standard: original.standard,
      indicators: original.indicators,
      activities: original.activities,
      resources: original.resources,
      status: "draft",
    })
    .select()
    .single()

  if (error) {
    console.error("Error duplicating planning:", error)
    throw error
  }

  return dbPlanningToFrontend(data as WeeklyPlanningDB)
}

/* =========================
   SET CURRENT WEEK
========================= */

export async function setCurrentPlanning(id: string, courseId: string): Promise<void> {
  // First, set all plannings for this course to non-current
  await supabase
    .from("weekly_planning")
    .update({ status: "completed" })
    .eq("course_id", courseId)
    .eq("status", "current")

  // Then set the selected one as current
  const { error } = await supabase
    .from("weekly_planning")
    .update({ status: "current" })
    .eq("id", id)

  if (error) {
    console.error("Error setting current planning:", error)
    throw error
  }
}