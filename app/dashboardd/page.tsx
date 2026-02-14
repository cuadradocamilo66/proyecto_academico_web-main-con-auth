"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { AppShell } from "@/components/layout/app-shell"
import { Loader2, GraduationCap } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login")
    }
  }, [loading, user, router])

  // Mostrar modal de carga elegante
  if (loading || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-6">
          {/* Logo animado */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-full shadow-2xl">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* Spinner */}
          <div className="relative">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>

          {/* Texto */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cargando EduGestión
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verificando autenticación...
            </p>
          </div>

          {/* Puntos animados */}
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  )
}