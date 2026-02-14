"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"
import { useAuth } from "@/lib/auth-context"

export function Topbar() {
  const { profile } = useAuth()
console.log("PROFILE:", profile)
  const fullName = profile
    ? `Prof. ${profile.firstName} ${profile.lastName}`
    : "Profesor"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Nombre del docente */}
      <div className="flex items-center">
        <span className="text-sm font-medium text-muted-foreground">
          Bienvenido, {fullName}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </Button>

        {/* Menú usuario */}
        <UserMenu />
      </div>
    </header>
  )
}
