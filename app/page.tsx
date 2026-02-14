"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Usuario autenticado → ir al dashboard
          console.log("Usuario autenticado, redirigiendo al dashboard...")
          router.push('/dashboardd')
        } else {
          // Usuario no autenticado → ir al login
          console.log("Usuario no autenticado, redirigiendo al login...")
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        // En caso de error, redirigir al login
        router.push('/auth/login')
      }
    }

    checkAuthAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}