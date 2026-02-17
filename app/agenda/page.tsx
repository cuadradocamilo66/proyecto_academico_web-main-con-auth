"use client"
import { AppShell } from "@/components/layout/app-shell"
import { AgendaView } from "@/components/agenda/agenda-view"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"

export default function AgendaPage() {
  return (
    <AppShell>
      <div className="space-y-6">
      

        <AgendaView />
      </div>
    </AppShell>
  )
}
