import { AppShell } from "@/components/layout/app-shell"
import { StudentProfile } from "@/components/students/student-profile"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/estudiantes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ficha del Estudiante</h1>
            <p className="text-muted-foreground">Historial pedagógico completo</p>
          </div>
        </div>

        <StudentProfile studentId={id} />
      </div>
    </AppShell>
  )
}
