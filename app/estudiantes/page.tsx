"use client"
import { AppShell } from "@/components/layout/app-shell"
import { StudentsList } from "@/components/students/students-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Filter } from "lucide-react"

export default function EstudiantesPage() {
  return (
    <AppShell>
      

        <StudentsList />
      
    </AppShell>
  )
}
