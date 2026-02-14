"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Mat", promedio: 3.8, meta: 4.0 },
  { name: "Ciencias", promedio: 4.2, meta: 4.0 },
  { name: "Español", promedio: 3.5, meta: 4.0 },
  { name: "Historia", promedio: 4.0, meta: 4.0 },
]

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Rendimiento por Asignatura</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis domain={[0, 5]} tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-card p-2 shadow-sm">
                      <p className="text-sm font-medium">{payload[0].payload.name}</p>
                      <p className="text-xs text-muted-foreground">Promedio: {payload[0].value}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="promedio" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
