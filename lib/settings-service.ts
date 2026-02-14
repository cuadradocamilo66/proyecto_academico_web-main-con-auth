// lib/settings-service.ts
import { supabase } from "@/lib/supabase/client"

export type UserSettings = {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  institution: string | null
  notify_low_performance: boolean
  notify_planning_reminders: boolean
  notify_email_summaries: boolean
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
  created_at: string
  updated_at: string
}

export async function fetchUserSettings(): Promise<UserSettings | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("No authenticated user")

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) {
    // Si no existe configuración, crear una por defecto
    if (error.code === 'PGRST116') {
      return await createDefaultSettings()
    }
    throw error
  }

  return data
}

export async function createDefaultSettings(): Promise<UserSettings> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("No authenticated user")

  const { data, error } = await supabase
    .from("user_settings")
    .insert({
      user_id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUserSettings(
  updates: Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<UserSettings> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("No authenticated user")

  const { data, error } = await supabase
    .from("user_settings")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfileInfo(info: {
  full_name?: string
  email?: string
  phone?: string
  institution?: string
}): Promise<UserSettings> {
  return updateUserSettings(info)
}

export async function updateNotificationSettings(notifications: {
  notify_low_performance?: boolean
  notify_planning_reminders?: boolean
  notify_email_summaries?: boolean
}): Promise<UserSettings> {
  return updateUserSettings(notifications)
}

export async function updateAppearanceSettings(appearance: {
  theme?: 'light' | 'dark' | 'system'
  language?: 'es' | 'en'
}): Promise<UserSettings> {
  return updateUserSettings(appearance)
}