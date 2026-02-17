"use client"
import { AppShell } from "@/components/layout/app-shell"
import { CalificacionesList } from "@/components/grades/grades-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Download } from "lucide-react"

export default function CalificacionesPage() {
  return (
    <AppShell>
      

        <CalificacionesList />
      
    </AppShell>
  )
}
