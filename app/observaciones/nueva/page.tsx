import { AppShell } from "@/components/layout/app-shell"
import { NewObservationForm } from "@/components/observations/new-observation-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NuevaObservacionPage() {
  return (
    <AppShell>
      

        <NewObservationForm />
      
    </AppShell>
  )
}
