"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { courses } from "@/lib/data"
import { Save } from "lucide-react"

export function NewDiaryForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Registro del Día</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="course">Curso</Label>
            <Select>
              <SelectTrigger className="bg-transparent">
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} - {course.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input type="date" id="date" defaultValue={new Date().toISOString().split("T")[0]} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Tema de la Clase</Label>
          <Input id="topic" placeholder="Ej: Introducción a fracciones equivalentes" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activities">Actividades Realizadas</Label>
          <Textarea id="activities" placeholder="Describe las actividades desarrolladas durante la clase..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observations">Observaciones Generales</Label>
          <Textarea
            id="observations"
            placeholder="Anota observaciones sobre el desarrollo de la clase, participación, dificultades..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
          <Textarea id="notes" placeholder="Cualquier nota adicional para recordar..." rows={2} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" className="bg-transparent">
            Cancelar
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Registro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
