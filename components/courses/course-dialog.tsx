"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Course } from "@/lib/types"
import { formatCourseName } from "@/lib/types"

interface CourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: Course | null
  onSave: (course: {
    subject: string
    grade: number
    groupNumber: number
    schedule: string
    students: number
    color: string
    id?: string
  }) => void
}

const colorOptions = [
  { value: "bg-chart-1", label: "Azul" },
  { value: "bg-chart-2", label: "Verde" },
  { value: "bg-chart-3", label: "Naranja" },
  { value: "bg-chart-4", label: "Púrpura" },
  { value: "bg-chart-5", label: "Rosa" },
]

const gradeOptions = Array.from({ length: 11 }, (_, i) => i + 1)

const groupOptions = Array.from({ length: 10 }, (_, i) => i + 1)

export function CourseDialog({ open, onOpenChange, course, onSave }: CourseDialogProps) {
  const [formData, setFormData] = useState({
    subject: "",
    grade: 7,
    groupNumber: 1,
    schedule: "",
    students: 0,
    color: "bg-chart-1",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (course) {
      setFormData({
        subject: course.subject,
        grade: course.grade,
        groupNumber: course.groupNumber,
        schedule: course.schedule,
        students: course.students,
        color: course.color,
      })
    } else {
      setFormData({
        subject: "",
        grade: 7,
        groupNumber: 1,
        schedule: "",
        students: 0,
        color: "bg-chart-1",
      })
    }
  }, [course, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (course) {
        onSave({ ...formData, id: course.id })
      } else {
        onSave(formData)
      }
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewName = formData.subject
    ? formatCourseName(formData.subject, formData.grade, formData.groupNumber)
    : "Vista previa del nombre"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{course ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Materia</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ej: Informática, Matemáticas, Español"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade">Grado</Label>
                <Select
                  value={formData.grade.toString()}
                  onValueChange={(value) => setFormData({ ...formData, grade: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grado {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="groupNumber">Curso/Grupo</Label>
                <Select
                  value={formData.groupNumber.toString()}
                  onValueChange={(value) => setFormData({ ...formData, groupNumber: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((group) => (
                      <SelectItem key={group} value={group.toString()}>
                        Curso {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Se mostrará como:</p>
              <p className="text-lg font-semibold text-foreground">{previewName}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="schedule">Horario</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="Ej: Lun-Mié-Vie 8:00-9:30"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="students">Número de Estudiantes</Label>
              <Input
                id="students"
                type="number"
                min="0"
                value={formData.students}
                onChange={(e) => setFormData({ ...formData, students: Number.parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded ${color.value}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : course ? "Guardar Cambios" : "Crear Curso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
