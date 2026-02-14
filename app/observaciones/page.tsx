import { AppShell } from "@/components/layout/app-shell"
import { ObservationsView } from "@/components/observations/observations-view"

export const metadata = {
  title: "Observaciones | Plataforma Académica",
  description: "Gestión de observaciones de estudiantes",
}

export default function ObservacionesPage() {
  return (
    <AppShell>
    <div className="container mx-auto py-6">
      <ObservationsView />
    </div>
    </AppShell>
  )
}