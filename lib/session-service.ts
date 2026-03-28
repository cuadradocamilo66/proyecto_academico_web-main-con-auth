import { supabase } from "@/lib/supabase/client"

export interface ActivitySession {
    id: string
    activity_id: string
    user_id: string
    code: string
    status: 'active' | 'completed' | 'cancelled'
    show_results: boolean
    expires_at?: string
    created_at: string
}

export interface SessionParticipant {
    id: string
    session_id: string
    student_id?: string
    student_code?: string
    student_name: string
    joined_at: string
}

export interface SessionResponse {
    id: string
    session_id: string
    participant_id: string
    question_id: string
    answer: string
    score?: number
    submitted_at: string
}

// Generate a random 6-digit alphanumeric code
function generateSessionCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars: I, L, O, 0, 1
    let result = ''
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

export async function createActivitySession(activityId: string, userId: string, durationMinutes?: number) {
    const code = generateSessionCode()

    let expiresAt = null
    if (durationMinutes) {
        expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
    }

    const { data, error } = await supabase
        .from("activity_sessions")
        .insert({
            activity_id: activityId,
            user_id: userId,
            code: code,
            status: 'active',
            expires_at: expiresAt
        })
        .select()
        .single()

    if (error) throw error
    return data as ActivitySession
}

export async function fetchSessionByCode(code: string) {
    const { data, error } = await supabase
        .from("activity_sessions")
        .select(`
      *,
      activities (
        id,
        title,
        description,
        questions,
        course_id,
        period_id
      )
    `)
        .eq("code", code.toUpperCase())
        .eq("status", "active")
        .single()

    if (error) return null
    return data
}

export async function joinSession(sessionId: string, studentName: string, studentId?: string, studentCode?: string) {
    const { data, error } = await supabase
        .from("session_participants")
        .insert({
            session_id: sessionId,
            student_name: studentName,
            student_id: studentId,
            student_code: studentCode
        })
        .select()
        .single()

    if (error) throw error
    return data as SessionParticipant
}

export async function fetchStudentByCode(studentCode: string) {
    const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("student_code", studentCode.toLowerCase())
        .maybeSingle()

    if (error) throw error
    return data
}

export async function submitResponse(response: Omit<SessionResponse, 'id' | 'submitted_at'>) {
    const { data, error } = await supabase
        .from("session_responses")
        .insert(response)
        .select()
        .single()

    if (error) throw error
    return data as SessionResponse
}

export async function fetchSessionResults(sessionId: string) {
    const { data, error } = await supabase
        .from("session_participants")
        .select(`
      id,
      student_name,
      student_code,
      joined_at,
      session_responses (*)
    `)
        .eq("session_id", sessionId)

    if (error) throw error
    return data
}

export async function closeSession(sessionId: string) {
    const { error } = await supabase
        .from("activity_sessions")
        .update({ status: 'completed' })
        .eq("id", sessionId)

    if (error) throw error
}

export async function toggleResultsVisibility(sessionId: string, show: boolean) {
    const { error } = await supabase
        .from("activity_sessions")
        .update({ show_results: show })
        .eq("id", sessionId)

    if (error) throw error
}

export async function fetchPastSessions(userId: string) {
    const { data, error } = await supabase
        .from("activity_sessions")
        .select(`
            *,
            activities (title)
        `)
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })

    if (error) throw error
    return data
}
