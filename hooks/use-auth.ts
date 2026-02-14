// hooks/use-auth.ts
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuth(requireAuth = true) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión actual
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
        } else if (requireAuth) {
          // Si se requiere autenticación y no hay usuario, redirigir al login
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        if (requireAuth) {
          router.push('/auth/login')
        }
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
          if (requireAuth) {
            router.push('/auth/login')
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [requireAuth, router])

  return { user, loading }
}