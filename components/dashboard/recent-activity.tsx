"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle } from "lucide-react"
import { fetchDiaryEntries } from "@/lib/diary-service"
import { fetchObservations } from "@/lib/observations-service"

export function RecentActivity() {
  const { data: diaries = [] } = useSWR("recent-diaries", fetchDiaryEntries)
  const { data: obs = [] } = useSWR("recent-observations", fetchObservations)

  const recentItems = [
    ...diaries.map((entry) => ({
      id: entry.id,
      type: "diary" as const,
      title: entry.topic,
      subtitle: entry.course.name,
      date: entry.created_at ?? entry.date,
    })),
    ...obs.map((o) => ({
      id: o.id,
      type: "observation" as const,
      title: o.studentName,
      subtitle: o.description.substring(0, 50) + "...",
      date: o.createdAt ?? o.date,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date + "T00:00:00").getTime() -
        new Date(a.date + "T00:00:00").getTime()
    )
    .slice(0, 4)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">No tienes actividad reciente</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cuando registres diarios u observaciones aparecerán aquí.
            </p>
          </div>
        ) : (
          recentItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-start gap-3">
              <div
                className={`rounded-full p-2 ${item.type === "diary"
                    ? "bg-chart-2/10 text-chart-2"
                    : "bg-chart-4/10 text-chart-4"
                  }`}
              >
                {item.type === "diary" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.subtitle}
                </p>
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(item.date + "T00:00:00").toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          ))
        )}
      </CardContent>

    </Card>
  )
}
