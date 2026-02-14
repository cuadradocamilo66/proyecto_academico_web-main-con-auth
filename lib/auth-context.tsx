"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { getTeacherProfile } from "@/lib/auth-service"
import type { TeacherProfile } from "@/lib/auth-types"

interface AuthContextType {
  user: User | null
  profile: TeacherProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId: string) => {
    try {
      const teacherProfile = await getTeacherProfile(userId)
      setProfile(teacherProfile)
    } catch {
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        loadProfile(data.session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signOut: handleSignOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
