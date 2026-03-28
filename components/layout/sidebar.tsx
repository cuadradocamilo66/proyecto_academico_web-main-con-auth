"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Settings,
  LogOut
} from "lucide-react"
import { AuthLoadingModal } from "@/components/auth/auth-loading-modal"
import { useLoading } from "@/lib/loading-context"

const navigation = [
  { name: "Dashboard", href: "/dashboardd", icon: LayoutDashboard },
  { name: "Cursos", href: "/cursos", icon: BookOpen },
  { name: "Estudiantes", href: "/estudiantes", icon: Users },
  { name: "Planeación", href: "/planeacion", icon: Calendar },
  { name: "Diario de Campo", href: "/diario", icon: FileText },
  { name: "Calificaciones", href: "/calificaciones", icon: ClipboardList },
  { name: "Observaciones", href: "/observaciones", icon: AlertTriangle },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Agenda", href: "/agenda", icon: CalendarDays },
  { name: "Configuración", href: "/configuracion", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, profile } = useAuth()
  const { showLoading } = useLoading()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  console.log("PROFILE:", profile)
  const fullName = profile
    ? `Prof. ${profile.firstName} ${profile.lastName}`
    : "Profesor"



  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {/* Modal logout */}
      <AuthLoadingModal isOpen={isLoggingOut} type="logout" />

      <aside
        className="
          fixed left-0 top-0 z-40 
          flex h-screen w-64 flex-col 
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          text-slate-100 
          shadow-2xl
        "
      >
        {/* Header Logo */}
        <div className="flex h-16 items-center border-b border-slate-700 px-6 shadow-sm">
          <span className="text-sm font-semibold text-white tracking-wide">
            Bienvenido, {fullName}
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (pathname !== item.href) {
                    showLoading(`Cargando ${item.name}...`)
                  }
                }}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 backdrop-blur-md text-white shadow-md border border-white/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-1"
                )}
              >
                <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto border-t border-slate-700 p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300",
              isLoggingOut && "opacity-50 cursor-not-allowed"
            )}
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}