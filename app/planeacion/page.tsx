"use client"
import { AppShell } from "@/components/layout/app-shell"
import { PlanningView } from "@/components/planning/planning-view"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Download } from "lucide-react"

export default function PlaneacionPage() {
  return (
    <AppShell>
      <div className="space-y-6">
       

        <PlanningView />
      </div>
    </AppShell>
  )
}
