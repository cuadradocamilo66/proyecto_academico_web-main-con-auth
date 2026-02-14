import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ClipboardList, AlertTriangle } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    label: "Nueva Observación",
    icon: AlertTriangle,
    href: "/observaciones/nueva",
    color: "bg-chart-4 hover:bg-chart-4/90",
  },
  { label: "Registro Diario", icon: FileText, href: "/diario/nuevo", color: "bg-chart-2 hover:bg-chart-2/90" },
  {
    label: "Nueva Evaluación",
    icon: ClipboardList,
    href: "/calificaciones/nueva",
    color: "bg-chart-1 hover:bg-chart-1/90",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {actions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button className={`w-full justify-start gap-2 text-white ${action.color}`}>
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
