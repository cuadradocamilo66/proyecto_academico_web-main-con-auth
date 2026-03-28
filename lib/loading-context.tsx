"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePathname } from "next/navigation"
import { GlobalLoadingModal } from "@/components/ui/global-loading-modal"

interface LoadingContextType {
  showLoading: (message?: string) => void
  showSuccess: (message?: string) => void
  hideLoading: () => void
  isLoading: boolean
  loadingType: "loading" | "success"
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Cargando...")
  const [loadingType, setLoadingType] = useState<"loading" | "success">("loading")
  const pathname = usePathname()

  // Ocultar modal de carga genérico al navegar exitosamente a otra página
  useEffect(() => {
    if (loadingType === "loading") {
      setIsLoading(false)
    }
  }, [pathname])

  const showLoading = (message = "Cargando...") => {
    setLoadingType("loading")
    setLoadingMessage(message)
    setIsLoading(true)
  }

  const showSuccess = (message = "¡Operación exitosa!") => {
    setLoadingType("success")
    setLoadingMessage(message)
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 2000) // Se cierra solo después de 2 seg
  }

  const hideLoading = () => {
    // Evitar que un 'hideLoading' prematuro oculte el mensaje de éxito
    if (loadingType === "success") return;
    setIsLoading(false)
  }

  return (
    <LoadingContext.Provider value={{ showLoading, showSuccess, hideLoading, isLoading, loadingType }}>
      {children}
      <GlobalLoadingModal isOpen={isLoading} message={loadingMessage} type={loadingType} />
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading debe usarse dentro de un LoadingProvider")
  }
  return context
}
