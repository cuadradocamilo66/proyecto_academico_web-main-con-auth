// components/ui/navigation-loading-modal.tsx
"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationLoadingModalProps {
  isOpen: boolean
  message?: string
  icon?: React.ReactNode
}

export function NavigationLoadingModal({ 
  isOpen, 
  message = "Cargando...",
  icon 
}: NavigationLoadingModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShow(true)
    } else {
      const timer = setTimeout(() => setShow(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!show) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[300px] transition-all duration-300 transform",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        {/* Icono de la sección (si se proporciona) */}
        {icon && (
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-full">
              <div className="h-10 w-10 text-white">
                {icon}
              </div>
            </div>
          </div>
        )}

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