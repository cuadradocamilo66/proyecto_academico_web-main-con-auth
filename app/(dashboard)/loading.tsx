import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
      </div>
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Cargando...
        </h3>
        <p className="text-sm text-muted-foreground">
          Por favor espera un momento
        </p>
      </div>
    </div>
  )
}
