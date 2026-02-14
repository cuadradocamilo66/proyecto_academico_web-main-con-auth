import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingDown, Eye } from "lucide-react"
import { alerts } from "@/lib/data"

export function AlertsPanel() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Alertas Pedagógicas</CardTitle>
        <Button variant="ghost" size="sm">
          Ver todas
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <div
              className={`mt-0.5 rounded-full p-1.5 ${
                alert.type === "low-grade" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
              }`}
            >
              {alert.type === "low-grade" ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{alert.student}</p>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
