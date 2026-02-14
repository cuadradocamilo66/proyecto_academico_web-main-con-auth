import { AppShell } from "@/components/layout/app-shell"
import { NewDiaryForm } from "@/components/diary/new-diary-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevoDiarioPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Link href="/diario">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nuevo Registro</h1>
            <p className="text-muted-foreground">Documenta tu clase del día</p>
          </div>
        </div>

        <NewDiaryForm />
      </div>
    </AppShell>
  )
}
