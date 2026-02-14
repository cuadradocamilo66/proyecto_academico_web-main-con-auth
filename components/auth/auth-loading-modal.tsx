// components/auth/auth-loading-modal.tsx
"use client"

import { useEffect, useState } from "react"
import { Loader2, LogIn, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthLoadingModalProps {
  isOpen: boolean
  type?: "login" | "logout"
}

export function AuthLoadingModal({ isOpen, type = "login" }: AuthLoadingModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShow(true)
    } else {
      // Pequeño delay para la animación de salida
      const timer = setTimeout(() => setShow(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!show) return null

  const Icon = type === "login" ? LogIn : LogOut
  const message = type === "login" ? "Iniciando sesión..." : "Cerrando sesión..."

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 transition-all duration-300 transform",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        {/* Icono animado */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-full">
            <Icon className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Spinner */}
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>

        {/* Mensaje */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {message}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Por favor espera un momento
          </p>
        </div>

        {/* Puntos animados */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}