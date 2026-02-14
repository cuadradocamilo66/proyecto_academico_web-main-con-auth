import { supabase } from "@/lib/supabase/client"
import type { GradeEntry } from "@/lib/data"

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
