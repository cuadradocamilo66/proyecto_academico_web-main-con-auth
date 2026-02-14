"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Observation, Student, CreateObservationData } from "@/lib/types"
import { MessageSquare, Loader2, Save } from "lucide-react"

interface ObservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  observation?: Observation | null
  students: Student[]
  onSave: (observation: CreateObservationData & { id?: string }) => Promise<void>
}

export function ObservationDialog({ open, onOpenChange, observation, students, onSave }: ObservationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateObservationData>({
    studentId: "",
    type: "academic",
    severity: "low",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [selectedCourse, setSelectedCourse] = useState<string>("")

  useEffect(() => {
    if (observation) {
      setFormData({
        studentId: observation.studentId,
        type: observation.type,
        severity: observation.severity,
        description: observation.description,
        date: observation.date,
      })
    } else {
      setFormData({
        studentId: "",
        type: "academic",
        severity: "low",
        description: "",
        date: new Date().toISOString().split("T")[0],
      })
    }
  }, [observation, open])

  const updateField = <K extends keyof CreateObservationData>(
    field: K,
    value: CreateObservationData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(observation ? { ...formData, id: observation.id } : formData)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const courses = Array.from(
    new Map(
      students.map((s) => [
        s.courseId,
        { id: s.courseId, name: s.courseName ?? s.courseId },
      ])
    ).values()
  )

  const filteredStudents = selectedCourse
    ? students.filter((s) => s.courseId === selectedCourse)
    : students

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {observation ? "Editar Observación" : "Nueva Observación"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Registra observaciones sobre el estudiante
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Estudiante <span className="text-destructive">*</span>
              </Label>

              <div className="grid grid-cols-2 gap-3">
                {/* CURSO */}
                <Select
                  value={selectedCourse}
                  onValueChange={(value) => {
                    setSelectedCourse(value)
                    updateField("studentId", "")
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* ESTUDIANTE */}
                <Select
                  value={formData.studentId}
                  onValueChange={(value) => updateField("studentId", value)}
                  disabled={!selectedCourse}
                  required
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>



            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  Tipo <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => updateField("type", value as any)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Académica</SelectItem>
                    <SelectItem value="behavioral">Comportamental</SelectItem>
                    <SelectItem value="attendance">Asistencia</SelectItem>
                    <SelectItem value="positive">Positiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity" className="text-sm font-medium">
                  Gravedad <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.severity} onValueChange={(value) => updateField("severity", value as any)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="h-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe la observación de manera clara y objetiva..."
                rows={6}
                className="resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                Sé específico y objetivo en tu descripción
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-muted-foreground">
                Los campos con <span className="text-destructive">*</span> son obligatorios
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}