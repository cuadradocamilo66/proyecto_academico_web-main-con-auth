"use client"

import { UserMenu } from "./user-menu"
import { NotificationDropdown } from "./notification-dropdown"
import { useAuth } from "@/lib/auth-context"

export function Topbar() {
  const { profile } = useAuth()

  const fullName = profile
    ? `Prof. ${profile.firstName} ${profile.lastName}`
    : "Profesor"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-3">
      
      {/* Logo */}
      <div className="flex items-center ml-1">
        <img
          src="/logowebdocente.png"
          alt="Logo SIED Pro"
          className="h-10 w-auto"
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <NotificationDropdown />

        {/* Menú usuario */}
        <UserMenu />
      </div>
    </header>
  )
}