import { supabase } from "./supabase/client"
import type { TeacherProfile, TeacherProfileDB, UpdateTeacherProfileData } from "./auth-types"
import { dbTeacherProfileToFrontend } from "./auth-types"

// ===============================
// AUTHENTICATION FUNCTIONS
// ===============================

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  try {
    console.log("Cerrando sesión...")
    
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
    
    console.log("Sesión cerrada")
    
    // IMPORTANTE: Usar window.location.href
    window.location.href = '/auth/login'
    
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    throw error
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

/**
 * Envía un correo electrónico de recuperación de contraseña
 * @param email - Email del usuario
 */
export async function resetPassword(email: string) {
  // Obtener la URL base de la aplicación
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/reset-password`,
  })
  
  if (error) throw error
}

/**
 * Actualiza la contraseña del usuario actual
 * @param newPassword - Nueva contraseña
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  
  if (error) throw error
  return data
}

// ===============================
// TEACHER PROFILE FUNCTIONS
// ===============================

export async function getTeacherProfile(userId: string): Promise<TeacherProfile | null> {
  const { data, error } = await supabase
    .from("teacher_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // No encontrado
    throw error
  }

  return dbTeacherProfileToFrontend(data as TeacherProfileDB)
}

export async function updateTeacherProfile(
  userId: string,
  updates: UpdateTeacherProfileData
): Promise<TeacherProfile> {
  const dbUpdates: Partial<TeacherProfileDB> = {}

  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone
  if (updates.institution !== undefined) dbUpdates.institution = updates.institution
  if (updates.subjectSpecialty !== undefined) dbUpdates.subject_specialty = updates.subjectSpecialty
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl

  const { data, error } = await supabase
    .from("teacher_profiles")
    .update(dbUpdates)
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return dbTeacherProfileToFrontend(data as TeacherProfileDB)
}

// ===============================
// SESSION MANAGEMENT
// ===============================

export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  return supabase.auth.onAuthStateChange(callback)
}

// ===============================
// HELPER TO CHECK IF USER IS AUTHENTICATED
// ===============================

export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}