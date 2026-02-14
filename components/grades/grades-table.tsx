"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Trash2,
  Filter,
  BookOpen,
  FileDown,
  FileSpreadsheet,
  FileText,
  Minus,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  Edit2,
  Eye,
  List,
  Save,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { Student, GradeItem } from "@/lib/types"
import { fetchStudents } from "@/lib/students-service"
import type { Course } from "@/lib/types"
import { fetchCourses } from "@/lib/courses-service"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { fetchPeriods, type Period } from "@/lib/periods-service"
import { emptyGrades } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase/client"

// Tipo local para los períodos
type LocalPeriod = "p1" | "p2" | "p3" | "p4"

// Tipo para actividades desde la BD
type Activity = {
  id: string
  title: string
  description?: string
  course_id: string
  period_id: string
  created_at: string
}

// Tipo para notas de actividades
type ActivityGrade = {
  id: string
  activity_id: string
  student_id: string
  value: number
  created_at: string
}

/* =======================
   MAPEO DE PERÍODOS
======================= */
const getPeriodKeyByName = (periodName: string): LocalPeriod | null => {
  const match = periodName.match(/Periodo\s+(\d+)/i) || periodName.match(/Período\s+(\d+)/i) || periodName.match(/P(\d+)/i)
  if (!match) return null
  const num = parseInt(match[1])
  const keys: LocalPeriod[] = ["p1", "p2", "p3", "p4"]
  return keys[num - 1] || null
}

const getPeriodLabel = (localPeriod: LocalPeriod) => {
  const labels = {
    p1: "Periodo 1",
    p2: "Periodo 2",
    p3: "Periodo 3",
    p4: "Periodo 4"
  }
  return labels[localPeriod]
}

/* =======================
   UTILS
======================= */

const average = (grades: GradeItem[] = []) => {
  if (!grades.length) return null
  const sum = grades.reduce((acc, g) => acc + g.value, 0)
  return Number((sum / grades.length).toFixed(2))
}

const getGradeColor = (avg: number | null) => {
  if (avg === null) return "text-muted-foreground"
  if (avg < 3.0) return "text-red-600 dark:text-red-400"
  if (avg < 4.0) return "text-amber-600 dark:text-amber-400"
  if (avg < 4.8) return "text-blue-600 dark:text-blue-400"
  return "text-emerald-600 dark:text-emerald-400"
}

const getGradeBg = (avg: number | null) => {
  if (avg === null) return "bg-muted/50"
  if (avg < 3.0) return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
  if (avg < 4.0) return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
  if (avg < 4.8) return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
  return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
}

const calculatePeriodStats = (students: Student[], localPeriod: LocalPeriod) => {
  const averages = students
    .map(s => average(s.grades?.[localPeriod] || []))
    .filter(avg => avg !== null) as number[]

  if (averages.length === 0) {
    return {
      average: null,
      highest: null,
      lowest: null,
      passing: 0,
      failing: 0,
      total: students.length
    }
  }

  const sum = averages.reduce((acc, val) => acc + val, 0)
  const avg = Number((sum / averages.length).toFixed(2))
  const highest = Math.max(...averages)
  const lowest = Math.min(...averages)
  const passing = averages.filter(a => a >= 3.0).length
  const failing = averages.filter(a => a < 3.0).length

  return {
    average: avg,
    highest,
    lowest,
    passing,
    failing,
    total: students.length
  }
}

export function CalificacionesList() {
  const { toast } = useToast()
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)
  const { data: students = [], mutate } = useSWR<Student[]>("students", fetchStudents)
  const { data: periods = [] } = useSWR<Period[]>("periods", fetchPeriods)

  // Modal de visualización
  const [viewOpen, setViewOpen] = useState(false)
  const [viewStudent, setViewStudent] = useState<Student | null>(null)
  const [viewPeriod, setViewPeriod] = useState<LocalPeriod>("p1")

  // Modal de gestión de actividades
  const [manageOpen, setManageOpen] = useState(false)
  const [managePeriodId, setManagePeriodId] = useState<string>("")
  const [activities, setActivities] = useState<Activity[]>([])
  const [activityGrades, setActivityGrades] = useState<ActivityGrade[]>([])
  const [editingGrades, setEditingGrades] = useState<{ [studentId: string]: number | null }>({})
  const [selectedActivity, setSelectedActivity] = useState<string>("")

  // Modal crear/editar actividad
  const [activityModalOpen, setActivityModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [activityForm, setActivityForm] = useState({ title: "", description: "" })

  // Modal confirmación eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null)

  const filteredStudents =
    selectedCourse === "all"
      ? students
      : students.filter((s) => s.courseId === selectedCourse)

  const selectedCourseName = selectedCourse === "all"
    ? undefined
    : courses.find(c => c.id === selectedCourse)?.name

  const handleExportExcel = () => {
    exportToExcel(filteredStudents, selectedCourseName)
  }

  const handleExportPDF = () => {
    exportToPDF(filteredStudents, selectedCourseName)
  }

  // Abrir modal de visualización
  const openViewModal = (student: Student, periodId: string) => {
    const localPeriod = getPeriodKeyByName(
      periods.find(p => p.id === periodId)?.name || ""
    ) || "p1"

    const grades = {
      ...emptyGrades,
      ...student.grades,
    }

    setViewStudent({ ...student, grades })
    setViewPeriod(localPeriod)
    setViewOpen(true)
  }

  // Cargar actividades desde la BD
  const loadActivities = async (periodId: string) => {
    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .eq("period_id", periodId)
        .order("created_at", { ascending: false })

      if (activitiesError) throw activitiesError

      setActivities(activitiesData || [])

      // Cargar todas las notas
      const activityIds = (activitiesData || []).map(a => a.id)
      
      if (activityIds.length > 0) {
        const { data: gradesData, error: gradesError } = await supabase
          .from("activity_grades")
          .select("*")
          .in("activity_id", activityIds)

        if (gradesError) throw gradesError

        setActivityGrades(gradesData || [])
      } else {
        setActivityGrades([])
      }

      // Limpiar selección de actividad
      setSelectedActivity("")
      setEditingGrades({})
    } catch (error) {
      console.error("Error cargando actividades:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las actividades",
        variant: "destructive",
      })
    }
  }

  // Cuando se selecciona una actividad, cargar sus notas
  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId)
    
    // Organizar notas por estudiante
    const gradesMap: { [studentId: string]: number | null } = {}
    
    filteredStudents.forEach(student => {
      const grade = activityGrades.find(g => g.activity_id === activityId && g.student_id === student.id)
      gradesMap[student.id] = grade?.value ?? null
    })

    setEditingGrades(gradesMap)
  }

  // Abrir modal de gestión
  const openManageModal = async (periodId: string) => {
    setManagePeriodId(periodId)
    await loadActivities(periodId)
    setManageOpen(true)
  }

  // Abrir modal para crear actividad
  const openCreateActivity = () => {
    setEditingActivity(null)
    setActivityForm({ title: "", description: "" })
    setActivityModalOpen(true)
  }

  // Abrir modal para editar actividad
  const openEditActivity = () => {
    const activity = activities.find(a => a.id === selectedActivity)
    if (!activity) return

    setEditingActivity(activity)
    setActivityForm({ title: activity.title, description: activity.description || "" })
    setActivityModalOpen(true)
  }

  // Guardar actividad
  const saveActivity = async () => {
    if (!activityForm.title.trim()) {
      toast({
        title: "Error",
        description: "El título de la actividad es requerido",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingActivity) {
        const { error } = await supabase
          .from("activities")
          .update({
            title: activityForm.title,
            description: activityForm.description
          })
          .eq("id", editingActivity.id)

        if (error) throw error

        toast({
          title: "Actividad actualizada",
          description: "Los cambios se guardaron correctamente",
        })
      } else {
        if (selectedCourse === "all") {
          toast({
            title: "Selecciona un curso",
            description: "Debes seleccionar un curso específico",
            variant: "destructive",
          })
          return
        }

        const { error } = await supabase
          .from("activities")
          .insert({
            course_id: selectedCourse,
            period_id: managePeriodId,
            title: activityForm.title,
            description: activityForm.description
          })

        if (error) throw error

        toast({
          title: "Actividad creada",
          description: "Ahora puedes agregar calificaciones",
        })
      }

      setActivityModalOpen(false)
      setActivityForm({ title: "", description: "" })
      await loadActivities(managePeriodId)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo guardar la actividad",
        variant: "destructive",
      })
    }
  }

  // Confirmar eliminación
  const confirmDeleteActivity = () => {
    const activity = activities.find(a => a.id === selectedActivity)
    if (!activity) return

    setActivityToDelete(activity)
    setDeleteConfirmOpen(true)
  }

  // Eliminar actividad
  const deleteActivityConfirmed = async () => {
    if (!activityToDelete) return

    try {
      await supabase
        .from("activity_grades")
        .delete()
        .eq("activity_id", activityToDelete.id)

      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityToDelete.id)

      if (error) throw error

      toast({
        title: "Actividad eliminada",
        description: "La actividad y sus notas fueron eliminadas",
      })

      setDeleteConfirmOpen(false)
      setActivityToDelete(null)
      await loadActivities(managePeriodId)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad",
        variant: "destructive",
      })
    }
  }

  // Actualizar nota
  const updateGrade = (studentId: string, value: string) => {
    const numValue = parseFloat(value)

    setEditingGrades({
      ...editingGrades,
      [studentId]: value === "" || isNaN(numValue) ? null : Math.min(Math.max(numValue, 1), 5)
    })
  }

  // Guardar cambios de la actividad seleccionada
  const saveActivityGrades = async () => {
    if (!selectedActivity) return

    try {
      for (const student of filteredStudents) {
        const value = editingGrades[student.id]
        const existingGrade = activityGrades.find(
          g => g.activity_id === selectedActivity && g.student_id === student.id
        )

        if (value !== null && value !== undefined) {
          if (existingGrade) {
            await supabase
              .from("activity_grades")
              .update({ value })
              .eq("id", existingGrade.id)
          } else {
            await supabase
              .from("activity_grades")
              .insert({
                activity_id: selectedActivity,
                student_id: student.id,
                value
              })
          }
        } else if (existingGrade) {
          await supabase
            .from("activity_grades")
            .delete()
            .eq("id", existingGrade.id)
        }
      }

      await mutate()
      await loadActivities(managePeriodId)

      // Re-seleccionar la actividad para actualizar las notas
      handleActivitySelect(selectedActivity)

      toast({
        title: "✅ Guardado exitoso",
        description: "Las calificaciones se guardaron correctamente",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    }
  }

  // Calcular promedio de la actividad seleccionada
  const selectedActivityAverage = () => {
    const grades = Object.values(editingGrades).filter(g => g !== null && g !== undefined) as number[]
    if (grades.length === 0) return null
    return grades.reduce((a, b) => a + b, 0) / grades.length
  }

  const selectedActivityData = activities.find(a => a.id === selectedActivity)

  return (
    <>
      <div className="space-y-6">
        {/* (RESTO DEL CÓDIGO IGUAL - HEADER, RESUMEN, TABLA) */}
        {/* Por brevedad, incluyo solo el modal que cambió */}

        {/* HEADER */}
        <Card className="border-none shadow-sm">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Calificaciones</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-full sm:w-[280px]">
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="h-10">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Filtrar por curso" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="font-medium">Todos los cursos</span>
                      </SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <FileDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      <span>Exportar a Excel</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-red-600" />
                      <span>Exportar a PDF</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* RESUMEN POR PERÍODOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {periods.map((p) => {
            const localPeriod = getPeriodKeyByName(p.name)
            if (!localPeriod) return null

            const stats = calculatePeriodStats(filteredStudents, localPeriod)
            const hasData = stats.average !== null

            return (
              <Card key={p.id} className={`border-2 transition-all hover:shadow-md ${getGradeBg(stats.average)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{p.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.total} estudiante{stats.total !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openManageModal(p.id)}
                      title="Gestionar actividades"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasData ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Promedio</span>
                        <span className={`text-2xl font-bold ${getGradeColor(stats.average)}`}>
                          {stats.average?.toFixed(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                            <span>Más alto</span>
                          </div>
                          <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            {stats.highest?.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <TrendingDown className="h-3 w-3 text-red-500" />
                            <span>Más bajo</span>
                          </div>
                          <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                            {stats.lowest?.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-muted-foreground">Aprobados:</span>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{stats.passing}</span>
                        </div>
                        {stats.failing > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-muted-foreground">Reprobados:</span>
                            <span className="text-sm font-semibold text-red-600 dark:text-red-400">{stats.failing}</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Minus className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Sin datos</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* TABLA DE CALIFICACIONES */}
        <Card className="border-none shadow-sm">
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-6 font-semibold text-sm">
                      Estudiante
                    </th>

                    {periods.map((p) => (
                      <th key={p.id} className="py-3 px-4 text-center">
                        <span className="font-semibold text-sm">{p.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-b transition-colors hover:bg-muted/50 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {s.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium">{s.fullName}</span>
                        </div>
                      </td>

                      {periods.map((p) => {
                        const localPeriod = getPeriodKeyByName(p.name)
                        const avg = localPeriod ? average(s.grades?.[localPeriod]) : null
                        const gradeCount = localPeriod ? (s.grades?.[localPeriod]?.length || 0) : 0

                        return (
                          <td key={p.id} className="py-4 px-4">
                            <button
                              onClick={() => openViewModal(s, p.id)}
                              className={`w-full min-w-[100px] px-4 py-3 rounded-lg border-2 ${getGradeBg(avg)} text-center transition-all hover:shadow-md hover:scale-105`}
                            >
                              {avg !== null ? (
                                <div className="space-y-1">
                                  <div className={`text-2xl font-bold ${getGradeColor(avg)}`}>
                                    {avg.toFixed(1)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {gradeCount} nota{gradeCount !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              ) : (
                                <div className="py-2">
                                  <span className="text-muted-foreground text-lg">—</span>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Sin notas
                                  </div>
                                </div>
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-base font-medium text-muted-foreground">No hay estudiantes en este curso</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Selecciona otro curso o agrega estudiantes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL DE VISUALIZACIÓN */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Eye className="h-6 w-6 text-muted-foreground" />
                  {getPeriodLabel(viewPeriod)}
                </DialogTitle>
                <p className="text-base font-medium text-muted-foreground">{viewStudent?.fullName}</p>
              </div>
              {viewStudent && (() => {
                const avg = average(viewStudent.grades?.[viewPeriod] || [])
                return avg !== null ? (
                  <div className={`px-4 py-2 rounded-xl border-2 ${getGradeBg(avg)}`}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Promedio</p>
                    <p className={`text-2xl font-bold ${getGradeColor(avg)}`}>
                      {avg.toFixed(1)}
                    </p>
                  </div>
                ) : null
              })()}
            </div>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Notas registradas</p>
                <Badge variant="secondary" className="text-xs">
                  {viewStudent?.grades?.[viewPeriod]?.length || 0} nota{(viewStudent?.grades?.[viewPeriod]?.length || 0) !== 1 ? 's' : ''}
                </Badge>
              </div>

              {(!viewStudent?.grades?.[viewPeriod] || viewStudent.grades[viewPeriod].length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
                  <Minus className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No hay notas registradas</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {viewStudent.grades[viewPeriod].map((n, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-2 ${getGradeBg(n.value)}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${getGradeColor(n.value)} shrink-0`}>
                          {n.value.toFixed(1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {n.title ? (
                            <p className="text-sm font-medium">{n.title}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Sin descripción</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button onClick={() => setViewOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE GESTIÓN DE ACTIVIDADES - NUEVO DISEÑO CON SELECTOR */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="w-[95vw] max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <List className="h-6 w-6" />
                  Gestionar Actividades - {periods.find(p => p.id === managePeriodId)?.name || ""}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Selecciona una actividad para ver y editar las calificaciones
                </DialogDescription>
              </div>
              <Button onClick={openCreateActivity} className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Actividad
              </Button>
            </div>

            {/* SELECTOR DE ACTIVIDADES */}
            <div className="pt-4 space-y-2">
              <Label>Seleccionar Actividad</Label>
              <div className="flex gap-2">
                <Select value={selectedActivity} onValueChange={handleActivitySelect}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecciona una actividad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No hay actividades creadas
                      </div>
                    ) : (
                      activities.map((activity) => (
                        <SelectItem key={activity.id} value={activity.id}>
                          <div>
                            <div className="font-medium">{activity.title}</div>
                            {activity.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                {activity.description}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {selectedActivity && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={openEditActivity}
                      title="Editar actividad"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={confirmDeleteActivity}
                      title="Eliminar actividad"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>

              {/* ESTADÍSTICAS DE LA ACTIVIDAD SELECCIONADA */}
              {selectedActivity && selectedActivityData && (
                <div className={`p-4 rounded-xl border-2 ${getGradeBg(selectedActivityAverage())}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{selectedActivityData.title}</h4>
                      {selectedActivityData.description && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedActivityData.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {Object.values(editingGrades).filter(g => g !== null && g !== undefined).length} calificado{Object.values(editingGrades).filter(g => g !== null && g !== undefined).length !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-amber-500" />
                          {filteredStudents.length - Object.values(editingGrades).filter(g => g !== null && g !== undefined).length} pendiente{(filteredStudents.length - Object.values(editingGrades).filter(g => g !== null && g !== undefined).length) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {selectedActivityAverage() !== null && (
                      <div className="flex flex-col items-center px-4">
                        <span className="text-xs text-muted-foreground">Promedio</span>
                        <span className={`text-3xl font-bold ${getGradeColor(selectedActivityAverage())}`}>
                          {selectedActivityAverage()!.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* LISTA DE ESTUDIANTES */}
          <div className="flex-1 overflow-y-auto py-4">
            {!selectedActivity ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <List className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-base font-medium text-muted-foreground">Selecciona una actividad</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Usa el selector de arriba para ver y editar las calificaciones
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map(student => {
                  const gradeValue = editingGrades[student.id]
                  const hasGrade = gradeValue !== null && gradeValue !== undefined

                  return (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        hasGrade ? getGradeBg(gradeValue) : "border-dashed bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                          {student.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-base font-medium truncate">
                          {student.fullName}
                        </span>
                      </div>

                      <div className="w-36">
                        <Input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          placeholder="1.0 - 5.0"
                          value={gradeValue ?? ""}
                          onChange={(e) => updateGrade(student.id, e.target.value)}
                          className="text-center font-semibold text-lg"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setManageOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={saveActivityGrades} className="gap-2" disabled={!selectedActivity}>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CREAR/EDITAR ACTIVIDAD */}
      <Dialog open={activityModalOpen} onOpenChange={setActivityModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? "Editar Actividad" : "Nueva Actividad"}
            </DialogTitle>
            <DialogDescription>
              {editingActivity
                ? "Modifica la información de la actividad"
                : "Crea una actividad para calificar a todos los estudiantes"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la actividad *</Label>
              <Input
                id="title"
                placeholder="Ej: Quiz 1, Taller de matemáticas, Exposición..."
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Añade detalles sobre esta actividad..."
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveActivity}>
              {editingActivity ? "Guardar Cambios" : "Crear Actividad"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la actividad <strong>"{activityToDelete?.title}"</strong> y todas las calificaciones asociadas de todos los estudiantes.
              <br /><br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteActivityConfirmed} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}