"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStudents, useCourses } from "@/lib/store"
import type { GradeEntry } from "@/lib/data"

interface ActivityBase {
  subject: string
  activity: string
  period: 1 | 2 | 3 | 4
  date: string
}

interface GradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: ActivityBase | null
  grade?: GradeEntry | null

  /** 
   * 🔥 IMPORTANTE:
   * - Si activity === null → crear actividad para TODO el curso
   * - Si grade existe → editar nota individual
   */
  onSave: (
    data:
      | { type: "activity"; activity: ActivityBase }
      | { type: "grade"; grade: Omit<GradeEntry, "id"> | GradeEntry }
  ) => void
}

const periodOptions = [
  { value: 1, label: "1er Periodo" },
  { value: 2, label: "2do Periodo" },
  { value: 3, label: "3er Periodo" },
  { value: 4, label: "4to Periodo" },
]

export function GradeDialog({
  open,
  onOpenChange,
  grade,
  activity,
  onSave,
}: GradeDialogProps) {
  const { students } = useStudents()
  const { courses } = useCourses()

  const isEditGrade = !!grade
  const isActivityMode = !grade && !activity

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    subject: "",
    activity: "",
    grade: 3,
    period: 1 as 1 | 2 | 3 | 4,
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (grade) {
      setFormData(grade)
    } else if (activity) {
      setFormData((prev) => ({
        ...prev,
        subject: activity.subject,
        activity: activity.activity,
        period: activity.period,
        date: activity.date,
      }))
    } else {
      setFormData({
        studentId: "",
        studentName: "",
        subject: "",
        activity: "",
        grade: 3,
        period: 1,
        date: new Date().toISOString().split("T")[0],
      })
    }
  }, [grade, activity, open])

  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    setFormData((prev) => ({
      ...prev,
      studentId,
      studentName: student?.name || "",
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isActivityMode) {
      onSave({
        type: "activity",
        activity: {
          subject: formData.subject,
          activity: formData.activity,
          period: formData.period,
          date: formData.date,
        },
      })
    } else {
      onSave({
        type: "grade",
        grade: grade ? { ...formData, id: grade.id } : formData,
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>
            {isEditGrade
              ? "Editar Nota"
              : isActivityMode
              ? "Crear Actividad"
              : "Registrar Nota"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* ACTIVIDAD */}
            <div className="grid gap-2">
              <Label>Actividad</Label>
              <Input
                value={formData.activity}
                onChange={(e) =>
                  setFormData({ ...formData, activity: e.target.value })
                }
                placeholder="Ej: Taller de fracciones"
                required
                disabled={!isActivityMode}
              />
            </div>

            {/* ESTUDIANTE (solo para nota) */}
            {!isActivityMode && (
              <div className="grid gap-2">
                <Label>Estudiante</Label>
                <Select
                  value={formData.studentId}
                  onValueChange={handleStudentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* MATERIA */}
            <div className="grid gap-2">
              <Label>Materia</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) =>
                  setFormData({ ...formData, subject: value })
                }
                disabled={!isActivityMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* NOTA */}
            {!isActivityMode && (
              <div className="grid gap-2">
                <Label>Nota (1.0 - 5.0)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grade: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            )}

            {/* PERIODO */}
            <div className="grid gap-2">
              <Label>Periodo</Label>
              <Select
                value={String(formData.period)}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    period: Number(v) as 1 | 2 | 3 | 4,
                  })
                }
                disabled={!isActivityMode}
              >
                <SelectTrigger />
                <SelectContent>
                  {periodOptions.map((p) => (
                    <SelectItem key={p.value} value={String(p.value)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {isActivityMode ? "Crear Actividad" : "Guardar Nota"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
