import { supabase } from "@/lib/supabase/client"
import { Event, EventDB, CreateEventData, formatCourseName, dbEventToFrontend } from "@/lib/types"

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      course:course_id (
        subject,
        grade,
        group_number
      )
    `)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
    throw error
  }

  return data.map((event: EventDB & { course?: any }) => {
    const courseName = event.course
      ? formatCourseName(event.course.subject, event.course.grade, event.course.group_number)
      : undefined

    return dbEventToFrontend(event, courseName)
  })
}

export async function fetchEventsByMonth(year: number, month: number): Promise<Event[]> {
  const startDate = new Date(year, month, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      course:course_id (
        subject,
        grade,
        group_number
      )
    `)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching events by month:", error)
    throw error
  }

  return data.map((event: EventDB & { course?: any }) => {
    const courseName = event.course
      ? formatCourseName(event.course.subject, event.course.grade, event.course.group_number)
      : undefined

    return dbEventToFrontend(event, courseName)
  })
}

export async function createEvent(eventData: CreateEventData): Promise<Event> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: eventData.title,
      description: eventData.description || null,
      date: eventData.date,
      time: eventData.time || null,
      type: eventData.type,
      course_id: eventData.courseId || null,
      user_id: user.id, // 🔥 AQUÍ ESTÁ LA CLAVE
    })
    .select(`
      *,
      course:course_id (
        subject,
        grade,
        group_number
      )
    `)
    .single()

  if (error) {
    console.error("FULL ERROR:", error)
    throw error
  }

  const courseName = data.course
    ? formatCourseName(data.course.subject, data.course.grade, data.course.group_number)
    : undefined

  return dbEventToFrontend(data as EventDB, courseName)
}


export async function updateEvent(id: string, updates: Partial<CreateEventData>): Promise<Event> {
  const dbUpdates: Record<string, unknown> = {}

  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.description !== undefined) dbUpdates.description = updates.description || null
  if (updates.date !== undefined) dbUpdates.date = updates.date
  if (updates.time !== undefined) dbUpdates.time = updates.time || null
  if (updates.type !== undefined) dbUpdates.type = updates.type
  if (updates.courseId !== undefined) dbUpdates.course_id = updates.courseId || null

  const { data, error } = await supabase
    .from("events")
    .update(dbUpdates)
    .eq("id", id)
    .select(`
      *,
      course:course_id (
        subject,
        grade,
        group_number
      )
    `)
    .single()

  if (error) {
    console.error("Error updating event:", error)
    throw error
  }

  const courseName = data.course
    ? formatCourseName(data.course.subject, data.course.grade, data.course.group_number)
    : undefined

  return dbEventToFrontend(data as EventDB, courseName)
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    console.error("Error deleting event:", error)
    throw error
  }
}