"use client"

import { useState } from "react"
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
  GraduationCap,
  LogOut,
} from "lucide-react"
import { NavigationLoadingModal } from "@/components/ui/navigation-loading-modal"
import { AuthLoadingModal } from "@/components/auth/auth-loading-modal"

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
  const { signOut } = useAuth()
  
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigationMessage, setNavigationMessage] = useState("")
  const [navigationIcon, setNavigationIcon] = useState<React.ReactNode>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleNavigation = (item: typeof navigation[0], e: React.MouseEvent) => {
    // Si ya está en la página, no hacer nada
    if (pathname === item.href) {
      e.preventDefault()
      return
    }

    // Mostrar modal de carga
    setNavigationMessage(`Cargando ${item.name}...`)
    setNavigationIcon(<item.icon />)
    setIsNavigating(true)

    // Navegar después de un pequeño delay para que se vea el modal
    setTimeout(() => {
      router.push(item.href)
    }, 100)
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      // La redirección se maneja en signOut()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {/* Modal de navegación */}
      <NavigationLoadingModal 
        isOpen={isNavigating} 
        message={navigationMessage}
        icon={navigationIcon}
      />

      {/* Modal de logout */}
      <AuthLoadingModal isOpen={isLoggingOut} type="logout" />

      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <GraduationCap className="h-8 w-8 text-sidebar-primary" />
          <span className="text-lg font-semibold">EduGestión</span>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavigation(item, e)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isNavigating && "pointer-events-none opacity-50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-sidebar-border p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20",
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