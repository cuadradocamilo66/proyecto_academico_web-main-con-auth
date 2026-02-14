"use client"

import { AppShell } from "@/components/layout/app-shell"
import { CoursesList } from "@/components/courses/courses-list"

export default function CursosPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Cursos</h1>
          <p className="text-muted-foreground">Gestiona tus cursos y grupos</p>
        </div>

        <CoursesList />
      </div>
    </AppShell>
  )
}
