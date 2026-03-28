import { supabase } from "@/lib/supabase/client"
import type { GradeEntry } from "@/lib/data"

export async function createActivityGrade(grade: { activityId: string; studentId: string; value: number }) {
  const { error } = await supabase
    .from("activity_grades")
    .insert({
      activity_id: grade.activityId,
      student_id: grade.studentId,
      value: grade.value,
    })

  if (error) throw error
  return true
}

export async function createGrade(grade: Omit<GradeEntry, "id">) {
  const { data, error } = await supabase
    .from("grades")
    .insert({
      student_id: grade.studentId,
      student_name: grade.studentName,
      subject: grade.subject,
      activity: grade.activity,
      grade: grade.grade,
      period: grade.periodId,
      date: grade.date,
      course_id: grade.courseId, // 🔥 IMPORTANTE
    })
    .select()
    .single()

  if (error) throw error
  return data
}
