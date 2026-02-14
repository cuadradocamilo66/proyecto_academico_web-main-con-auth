"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Copy, 
  Trash2, 
  Plus,
  Calendar,
  BookOpen,
  Target,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react"
import type { Course, WeeklyPlanning, CreateWeeklyPlanningData } from "@/lib/types"
import { fetchCourses } from "@/lib/courses-service"
import { 
  fetchPlanningsByCourse, 
  createPlanning,
  updatePlanning,
  deletePlanning,
  duplicatePlanning,
  setCurrentPlanning
} from "@/lib/planning-service"
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
import { PlanningDialog } from "./planning-dialog"

export function PlanningView() {
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlanning, setEditingPlanning] = useState<WeeklyPlanning | null>(null)
  
  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)
  
  const { data: plannings = [], mutate } = useSWR<WeeklyPlanning[]>(
    selectedCourse ? `plannings-${selectedCourse}` : null,
    () => selectedCourse ? fetchPlanningsByCourse(selectedCourse) : []
  )

  const handleSavePlanning = async (data: CreateWeeklyPlanningData & { id?: string }) => {
    try {
      if (data.id) {
        await updatePlanning(data.id, data)
      } else {
        await createPlanning(data)
      }
      mutate()
    } catch (error) {
      console.error("Error saving planning:", error)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePlanning(id)
      mutate()
    } catch (error) {
      console.error("Error deleting planning:", error)
    }
    setDeleteId(null)
  }

  const handleDuplicate = async (planning: WeeklyPlanning) => {
    try {
      // Calculate next week dates
      const startDate = new Date(planning.endDate)
      startDate.setDate(startDate.getDate() + 3) // Next Monday
      
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 4) // Friday
      
      await duplicatePlanning(
        planning.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      mutate()
    } catch (error) {
      console.error("Error duplicating planning:", error)
    }
  }

  const handleSetCurrent = async (id: string) => {
    try {
      await setCurrentPlanning(id, selectedCourse)
      mutate()
    } catch (error) {
      console.error("Error setting current planning:", error)
    }
  }

  const handleEdit = (planning: WeeklyPlanning) => {
    setEditingPlanning(planning)
    setDialogOpen(true)
  }

  const handleNewPlanning = () => {
    setEditingPlanning(null)
    setDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { label: "Borrador", variant: "secondary" as const, icon: FileText },
      current: { label: "Actual", variant: "default" as const, icon: Clock },
      completed: { label: "Completada", variant: "outline" as const, icon: CheckCircle2 }
    }
    return variants[status as keyof typeof variants] || variants.draft
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Planeación semanal del curso</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Organiza tus actividades y objetivos por semana
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[280px]">
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

          <Button disabled={!selectedCourse} className="gap-2" onClick={handleNewPlanning}>
            <Plus className="h-4 w-4" />
            Nueva Semana
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {!selectedCourse ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selecciona un curso</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Elige un curso del menú desplegable para ver y gestionar su planeación semanal
            </p>
          </CardContent>
        </Card>
      ) : plannings.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay planeaciones</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Comienza creando tu primera planeación semanal para este curso
            </p>
            <Button className="gap-2" onClick={handleNewPlanning}>
              <Plus className="h-4 w-4" />
              Crear Primera Planeación
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Planning Cards */
        <div className="space-y-6">
          {plannings.map((plan) => {
            const statusInfo = getStatusBadge(plan.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card 
                key={plan.id} 
                className={`transition-all ${
                  plan.status === "current" 
                    ? "ring-2 ring-primary shadow-lg" 
                    : ""
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">Semana {plan.weekNumber}</CardTitle>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.dateRange}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          <h4 className="text-sm font-semibold">Actitudinal</h4>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{plan.unit}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {plan.status !== "current" && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleSetCurrent(plan.id)}
                          title="Marcar como semana actual"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDuplicate(plan)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Competencias y Estándares */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-sm font-semibold">Procedimental</h4>
                        </div>
                        <div className="space-y-1 pl-6">
  {plan.competence
    .split("\n")
    .filter(Boolean)
    .map((comp, index) => (
      <p
        key={index}
        className="text-sm text-muted-foreground"
      >
        <span className="font-semibold mr-1">
          {index + 1})
        </span>
        {comp}
      </p>
    ))}
</div>

                        
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-sm font-semibold">Conceptual</h4>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{plan.standard}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Indicadores de Logro</h4>
                        <ul className="space-y-2 pl-2">
                          {plan.indicators.map((indicator, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              <span className="text-muted-foreground">{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Actividades y Recursos */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Actividades</h4>
                        <div className="space-y-2">
                          {plan.activities.map((act, idx) => (
                            <div 
                              key={idx} 
                              className="flex gap-3 text-sm p-3 rounded-lg bg-muted/50 border"
                            >
                              <span className="font-semibold text-primary min-w-[70px]">
                                {act.day}
                              </span>
                              <span className="text-muted-foreground">{act.activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Recursos</h4>
                        <div className="flex flex-wrap gap-2">
                          {plan.resources.map((resource, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar planeación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta planeación semanal.
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

      {/* Planning Dialog */}
      <PlanningDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        planning={editingPlanning}
        courseId={selectedCourse}
        onSave={handleSavePlanning}
      />
    </div>
  )
}