import { supabase } from "@/lib/supabase/client"
import type { ObservationDB, Observation, CreateObservationData } from "@/lib/types"
import { dbObservationToFrontend } from "@/lib/types"

/* =========================
   FETCH
========================= */

export async function fetchObservations(): Promise<Observation[]> {
  const { data, error } = await supabase
    .from("observations")
    .select(`
      *,
      student:student_id (
        first_name,
        last_name
      )
    `)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching observations:", error)
    throw error
  }

  return data.map((obs: ObservationDB & { student?: any }) => {
    const studentName = obs.student
      ? `${obs.student.first_name} ${obs.student.last_name}`
      : "Estudiante no encontrado"

    return dbObservationToFrontend(obs, studentName)
  })
}

export async function fetchObservationsByStudent(studentId: string): Promise<Observation[]> {
  const { data, error } = await supabase
    .from("observations")
    .select(`
      *,
      student:student_id (
        first_name,
        last_name
      )
    `)
    .eq("student_id", studentId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching observations by student:", error)
    throw error
  }

  return data.map((obs: ObservationDB & { student?: any }) => {
    const studentName = obs.student
      ? `${obs.student.first_name} ${obs.student.last_name}`
      : "Estudiante no encontrado"

    return dbObservationToFrontend(obs, studentName)
  })
}

export async function fetchObservationsByCourse(courseId: string): Promise<Observation[]> {
  const { data, error } = await supabase
    .from("observations")
    .select(`
      *,
      student:student_id!inner (
        first_name,
        last_name,
        course_id
      )
    `)
    .eq("student.course_id", courseId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching observations by course:", error)
    throw error
  }

  return data.map((obs: any) => {
    const studentName = obs.student
      ? `${obs.student.first_name} ${obs.student.last_name}`
      : "Estudiante no encontrado"

    return dbObservationToFrontend(obs, studentName)
  })
}

/* =========================
   CREATE
========================= */

export async function createObservation(
  observation: CreateObservationData
): Promise<Observation> {

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("observations")
    .insert({
      student_id: observation.studentId,
      type: observation.type,
      severity: observation.severity,
      description: observation.description,
      date: observation.date,
      user_id: user.id, // 🔥 ESTA ES LA CLAVE
    })
    .select(`
      *,
      student:student_id (
        first_name,
        last_name
      )
    `)
    .single()

  if (error) {
    console.error("FULL ERROR:", error)
    throw error
  }

  const studentName = data.student
    ? `${data.student.first_name} ${data.student.last_name}`
    : ""

  return dbObservationToFrontend(data as ObservationDB, studentName)
}


/* =========================
   UPDATE
========================= */

export type UpdateObservationData = Partial<CreateObservationData>

export async function updateObservation(
  id: string,
  updates: UpdateObservationData
): Promise<Observation> {
  const dbUpdates: Record<string, unknown> = {}

  if (updates.studentId !== undefined) dbUpdates.student_id = updates.studentId
  if (updates.type !== undefined) dbUpdates.type = updates.type
  if (updates.severity !== undefined) dbUpdates.severity = updates.severity
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.date !== undefined) dbUpdates.date = updates.date

  const { data, error } = await supabase
    .from("observations")
    .update(dbUpdates)
    .eq("id", id)
    .select(`
      *,
      student:student_id (
        first_name,
        last_name
      )
    `)
    .single()

  if (error) {
    console.error("Error updating observation:", error)
    throw error
  }

  const studentName = data.student
    ? `${data.student.first_name} ${data.student.last_name}`
    : ""

  return dbObservationToFrontend(data as ObservationDB, studentName)
}

/* =========================
   DELETE
========================= */

export async function deleteObservation(id: string): Promise<void> {
  const { error } = await supabase
    .from("observations")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting observation:", error)
    throw error
  }
}