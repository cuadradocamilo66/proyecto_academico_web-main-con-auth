"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Calendar } from "lucide-react"
import { fetchCourses } from "@/lib/courses-service"
import type { Course } from "@/lib/types"
import { createDiaryEntry, updateDiaryEntry, type DiaryEntryWithCourse } from "@/lib/diary-service"
import { useToast } from "@/hooks/use-toast"

interface DiaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: DiaryEntryWithCourse | null
  onSaved: () => void
}

export function DiaryDialog({ open, onOpenChange, entry, onSaved }: DiaryDialogProps) {
  const { toast } = useToast()
  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)

  const [formData, setFormData] = useState({
    course_id: "",
    date: new Date().toLocaleDateString("sv-SE"),
    topic: "",
    activities: "",
    observations: "",
    notes: "",
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (entry) {
      setFormData({
        course_id: entry.course_id,
        date: entry.date,
        topic: entry.topic,
        activities: entry.activities,
        observations: entry.observations || "",
        notes: entry.notes || "",
      })
    } else {
      setFormData({
        course_id: "",
        date: new Date().toLocaleDateString("sv-SE"),
        topic: "",
        activities: "",
        observations: "",
        notes: "",
      })
    }
  }, [entry, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.course_id || !formData.topic || !formData.activities) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      if (entry) {
        await updateDiaryEntry(entry.id, formData)
        toast({
          title: "Registro actualizado",
          description: "Los cambios se guardaron correctamente",
        })
      } else {
        await createDiaryEntry(formData)
        toast({
          title: "Registro creado",
          description: "El nuevo registro se guardó correctamente",
        })
      }

      onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo guardar el registro",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            {entry ? "Editar Registro del Diario" : "Nuevo Registro del Diario"}
          </DialogTitle>
          <DialogDescription>
            {entry
              ? "Actualiza la información del registro pedagógico"
              : "Documenta las actividades y observaciones de tu clase"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Curso y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">
                Curso <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, course_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Fecha <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Tema */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Tema de la Clase <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              placeholder="Ej: Introducción a las fracciones equivalentes"
              required
            />
          </div>

          {/* Actividades */}
          <div className="space-y-2">
            <Label htmlFor="activities">
              Actividades Realizadas <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="activities"
              value={formData.activities}
              onChange={(e) =>
                setFormData({ ...formData, activities: e.target.value })
              }
              placeholder="Describe las actividades desarrolladas durante la clase..."
              rows={4}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Detalla ejercicios, dinámicas, explicaciones, etc.
            </p>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones Generales</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) =>
                setFormData({ ...formData, observations: e.target.value })
              }
              placeholder="Anota observaciones sobre el desarrollo de la clase, participación, dificultades encontradas..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Participación de estudiantes, dificultades detectadas, clima del aula, etc.
            </p>
          </div>

          {/* Notas Adicionales */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Cualquier nota adicional para recordar..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Recordatorios, materiales necesarios, seguimiento pendiente, etc.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving
                ? "Guardando..."
                : entry
                ? "Guardar Cambios"
                : "Crear Registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}