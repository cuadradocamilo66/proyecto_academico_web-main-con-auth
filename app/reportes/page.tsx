"use client"
import { AppShell } from "@/components/layout/app-shell"
import { ReportsView } from "@/components/reports/reports-view"

export default function ReportesPage() {
  return (
    <AppShell>
    <div className="container mx-auto py-6">
      <ReportsView />
    </div>
    </AppShell>
  )
}