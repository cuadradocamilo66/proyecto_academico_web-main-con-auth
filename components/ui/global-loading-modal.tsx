"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GlobalLoadingModalProps {
  isOpen: boolean
  message?: string
  type?: "loading" | "success"
}

export function GlobalLoadingModal({
  isOpen,
  message = "Cargando...",
  type = "loading"
}: GlobalLoadingModalProps) {
  const [show, setShow] = useState(false)

  // Desplazar el montado para permitir que la animación CSS tenga tiempo
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
        "fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[280px] max-w-sm transition-all duration-300 transform",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        )}
      >
        {type === "loading" ? (
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="relative h-14 w-14 text-primary animate-spin" />
          </div>
        ) : (
          <div className="relative animate-in zoom-in-50 duration-500">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <CheckCircle2 className="relative h-16 w-16 text-emerald-500" />
          </div>
        )}

        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {message}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {type === "loading" ? "Por favor espera un momento..." : "Proceso completado"}
          </p>
        </div>

        {/* Puntos animados horizontales solo en loading */}
        {type === "loading" && (
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 bg-primary/80 rounded-full animate-bounce" />
          </div>
        )}
      </div>
    </div>
  )
}
