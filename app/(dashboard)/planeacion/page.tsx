"use client"
import { PlanningView } from "@/components/planning/planning-view"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Download } from "lucide-react"

export default function PlaneacionPage() {
  return (
      <div className="space-y-6">
       

        <PlanningView />
      </div>
  )
}

