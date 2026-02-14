"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  AlertTriangle,
  BookOpen,
  UserCheck,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react"
import type { Observation, CreateObservationData, Course, Student } from "@/lib/types"
import {
  fetchObservations,
  createObservation,
  updateObservation,
  deleteObservation,
} from "@/lib/observations-service"
import { fetchCourses } from "@/lib/courses-service"
import { fetchStudents } from "@/lib/students-service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ObservationDialog } from "./observation-dialog"

export function ObservationsView() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingObservation, setEditingObservation] = useState<Observation | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCourse, setFilterCourse] = useState<string>("all")

  const { data: observations = [], mutate } = useSWR<Observation[]>(
    "observations",
    fetchObservations
  )

  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)
  const { data: students = [] } = useSWR<Student[]>("students", fetchStudents)

  const handleSaveObservation = async (data: CreateObservationData & { id?: string }) => {
    try {
      if (data.id) {
        await updateObservation(data.id, data)
      } else {
        await createObservation(data)
      }
      mutate()
    } catch (error) {
      console.error("Error saving observation:", error)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteObservation(id)
      mutate()
    } catch (error) {
      console.error("Error deleting observation:", error)
    }
    setDeleteId(null)
  }

  const handleEdit = (observation: Observation) => {
    setEditingObservation(observation)
    setDialogOpen(true)
  }

  const handleNew = () => {
    setEditingObservation(null)
    setDialogOpen(true)
  }

  // Filtrar observaciones
  const filteredObservations = observations.filter((obs) => {
    if (filterType !== "all" && obs.type !== filterType) return false
    if (filterCourse !== "all") {
      const student = students.find((s) => s.id === obs.studentId)
      if (student?.courseId !== filterCourse) return false
    }
    return true
  })

  const getTypeInfo = (type: string) => {
    const types = {
      academic: { label: "Académica", icon: BookOpen, color: "text-blue-600 bg-blue-100 dark:bg-blue-950/30" },
      behavioral: { label: "Comportamental", icon: AlertTriangle, color: "text-orange-600 bg-orange-100 dark:bg-orange-950/30" },
      attendance: { label: "Asistencia", icon: CalendarIcon, color: "text-purple-600 bg-purple-100 dark:bg-purple-950/30" },
      positive: { label: "Positiva", icon: UserCheck, color: "text-green-600 bg-green-100 dark:bg-green-950/30" },
    }
    return types[type as keyof typeof types] || types.academic
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: { label: "Baja", variant: "secondary" as const },
      medium: { label: "Media", variant: "default" as const },
      high: { label: "Alta", variant: "destructive" as const },
    }
    return variants[severity as keyof typeof variants] || variants.low
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Observaciones</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Registro de observaciones académicas y comportamentales
            </p>
          </div>
        </div>

        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Observación
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-2 block">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="academic">Académicas</SelectItem>
                  <SelectItem value="behavioral">Comportamentales</SelectItem>
                  <SelectItem value="attendance">Asistencia</SelectItem>
                  <SelectItem value="positive">Positivas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-2 block">Curso</Label>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cursos</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Observaciones */}
      <div className="space-y-4">
        {filteredObservations.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay observaciones</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                Comienza registrando observaciones sobre tus estudiantes
              </p>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Primera Observación
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredObservations.map((observation) => {
            const typeInfo = getTypeInfo(observation.type)
            const severityInfo = getSeverityBadge(observation.severity)
            const TypeIcon = typeInfo.icon

            return (
              <Card key={observation.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`h-10 w-10 rounded-lg ${typeInfo.color} flex items-center justify-center shrink-0`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold">{observation.studentName}</h3>
                          <Badge variant={severityInfo.variant} className="text-xs">
                            {severityInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{typeInfo.label}</span>
                          <span>•</span>
                          <span>{new Date(observation.date).toLocaleDateString("es-CO", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(observation)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(observation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {observation.description}
                  </p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar observación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta observación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Observation Dialog */}
      <ObservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        observation={editingObservation}
        students={students}
        onSave={handleSaveObservation}
      />
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}