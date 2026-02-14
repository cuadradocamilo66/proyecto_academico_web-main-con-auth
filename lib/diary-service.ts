// lib/diary-service.ts
import { supabase } from "@/lib/supabase/client"
import type { Course } from "@/lib/types"

export type DiaryEntry = {
  id: string
  user_id: string
  course_id: string
  date: string
  topic: string
  activities: string
  observations?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type DiaryEntryWithCourse = DiaryEntry & {
  course: {
    id: string
    name: string
  }
}

export async function fetchDiaryEntries(): Promise<DiaryEntryWithCourse[]> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select(`
      *,
      course:courses(id, subject, grade, group_number)
    `)
    .order("date", { ascending: false })

  if (error) throw error
  
  // Transformar los datos para incluir el nombre del curso
  return (data || []).map(entry => ({
    ...entry,
    course: {
      id: entry.course.id,
      name: `${entry.course.subject} ${entry.course.grade}-${entry.course.group_number}`
    }
  }))
}

export async function fetchDiaryEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<DiaryEntryWithCourse[]> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select(`
      *,
      course:courses(id, subject, grade, group_number)
    `)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })

  if (error) throw error
  
  return (data || []).map(entry => ({
    ...entry,
    course: {
      id: entry.course.id,
      name: `${entry.course.subject} ${entry.course.grade}-${entry.course.group_number}`
    }
  }))
}

export async function fetchDiaryEntriesByCourse(
  courseId: string
): Promise<DiaryEntryWithCourse[]> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select(`
      *,
      course:courses(id, subject, grade, group_number)
    `)
    .eq("course_id", courseId)
    .order("date", { ascending: false })

  if (error) throw error
  
  return (data || []).map(entry => ({
    ...entry,
    course: {
      id: entry.course.id,
      name: `${entry.course.subject} ${entry.course.grade}-${entry.course.group_number}`
    }
  }))
}

export async function createDiaryEntry(entry: Omit<DiaryEntry, "id" | "user_id" | "created_at" | "updated_at">) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("No authenticated user")

  const { data, error } = await supabase
    .from("diary_entries")
    .insert({
      ...entry,
      user_id: user.id
    })
    .select(`
      *,
      course:courses(id, subject, grade, group_number)
    `)
    .single()

  if (error) throw error
  
  return {
    ...data,
    course: {
      id: data.course.id,
      name: `${data.course.subject} ${data.course.grade}-${data.course.group_number}`
    }
  }
}

export async function updateDiaryEntry(
  id: string,
  updates: Partial<Omit<DiaryEntry, "id" | "user_id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("diary_entries")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      course:courses(id, subject, grade, group_number)
    `)
    .single()

  if (error) throw error
  
  return {
    ...data,
    course: {
      id: data.course.id,
      name: `${data.course.subject} ${data.course.grade}-${data.course.group_number}`
    }
  }
}

export async function deleteDiaryEntry(id: string) {
  const { error } = await supabase
    .from("diary_entries")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function searchDiaryEntries(searchTerm: string): Promise<DiaryEntryWithCourse[]> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select(`
      *,
      course:courses(id, subject, grade, group_number)
    `)
    .or(`topic.ilike.%${searchTerm}%,activities.ilike.%${searchTerm}%,observations.ilike.%${searchTerm}%`)
    .order("date", { ascending: false })

  if (error) throw error
  
  return (data || []).map(entry => ({
    ...entry,
    course: {
      id: entry.course.id,
      name: `${entry.course.subject} ${entry.course.grade}-${entry.course.group_number}`
    }
  }))
}