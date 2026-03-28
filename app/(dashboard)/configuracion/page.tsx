"use client"
import { SettingsView } from "@/components/settings/settings-view"

export default function ConfiguracionPage() {
  return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu experiencia en la plataforma</p>
        </div>

        <SettingsView />
      </div>
  )
}

