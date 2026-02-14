"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { students } from "@/lib/data"
import { Save } from "lucide-react"

export function NewObservationForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Detalles de la Observación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="student">Estudiante</Label>
          <Select>
            <SelectTrigger className="bg-transparent">
              <SelectValue placeholder="Seleccionar estudiante" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} - {student.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Observación</Label>
          <RadioGroup defaultValue="academic" className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="academic" id="academic" />
              <Label htmlFor="academic" className="font-normal cursor-pointer">
                Académica
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="behavioral" id="behavioral" />
              <Label htmlFor="behavioral" className="font-normal cursor-pointer">
                Comportamental
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Nivel de Gravedad</Label>
          <RadioGroup defaultValue="low" className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low" className="font-normal cursor-pointer">
                Baja
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="font-normal cursor-pointer">
                Media
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high" className="font-normal cursor-pointer">
                Alta
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input type="date" id="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" placeholder="Describe la observación de manera clara y objetiva..." rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="actions">Acciones Tomadas (opcional)</Label>
          <Textarea id="actions" placeholder="¿Qué acciones se tomaron o se recomiendan?" rows={2} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" className="bg-transparent">
            Cancelar
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Guardar Observación
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
