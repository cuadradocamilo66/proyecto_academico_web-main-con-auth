"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Loader2, Save, Calendar, Brain, Hammer, Heart } from "lucide-react"
import type { WeeklyPlanning, CreateWeeklyPlanningData, WeeklyActivity, Course } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useSWR from "swr"
import { fetchCourses } from "@/lib/courses-service"

interface PlanningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planning?: WeeklyPlanning | null
  courseId?: string
  onSave: (planning: CreateWeeklyPlanningData & { id?: string }) => Promise<void>
}

const dayOptions = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const

export function PlanningDialog({
  open,
  onOpenChange,
  planning,
  courseId: initialCourseId,
  onSave,
}: PlanningDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)

  const [formData, setFormData] = useState<CreateWeeklyPlanningData>({
    courseId: initialCourseId || "",
    weekNumber: 1,
    startDate: "",
    endDate: "",
    unit: "",
    competence: "",
    standard: "",
    indicators: [],
    activities: [],
    resources: [],
    status: "draft",
  })

  // Temporales para agregar items
  const [newStandard, setNewStandard] = useState("")
  const [newCompetence, setNewCompetence] = useState("")
  const [newAttitude, setNewAttitude] = useState("")
  const [newActivityDay, setNewActivityDay] = useState<WeeklyActivity["day"]>("Lunes")
  const [newActivityText, setNewActivityText] = useState("")
  const [newResource, setNewResource] = useState("")

  useEffect(() => {
    if (planning) {
      setFormData({ ...planning })
      return
    }

    const today = new Date()
    const day = today.getDay()
    const daysUntilMonday = day === 0 ? 1 : 8 - day

    const monday = new Date(today)
    monday.setDate(today.getDate() + daysUntilMonday)

    const friday = new Date(monday)
    friday.setDate(monday.getDate() + 4)

    setFormData({
      courseId: initialCourseId || "",
      weekNumber: 1,
      startDate: monday.toISOString().split("T")[0],
      endDate: friday.toISOString().split("T")[0],
      unit: "",
      competence: "",
      standard: "",
      indicators: [],
      activities: [],
      resources: [],
      status: "draft",
    })
  }, [planning, initialCourseId, open])

  const updateField = <K extends keyof CreateWeeklyPlanningData>(
    field: K,
    value: CreateWeeklyPlanningData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(planning ? { ...formData, id: planning.id } : formData)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Standards (usar el campo standard como array)
  const standards = formData.standard ? formData.standard.split("\n") : []
  
  const addStandard = () => {
    if (!newStandard.trim()) return
    const newStandards = [...standards, newStandard.trim()]
    updateField("standard", newStandards.join("\n"))
    setNewStandard("")
  }

  const removeStandard = (index: number) => {
    const newStandards = standards.filter((_, i) => i !== index)
    updateField("standard", newStandards.join("\n"))
  }

  // Competences (usar el campo competence como array)
  const competences = formData.competence
  ? formData.competence.split("\n")
  : []

const addCompetence = () => {
  if (!newCompetence.trim()) return
  const newCompetences = [...competences, newCompetence.trim()]
  updateField("competence", newCompetences.join("\n"))
  setNewCompetence("")
}

const removeCompetence = (index: number) => {
  const newCompetences = competences.filter((_, i) => i !== index)
  updateField("competence", newCompetences.join("\n"))
}


  // Attitudes (usar el campo unit como array)
  const attitudes = formData.unit ? formData.unit.split("\n") : []
  
  const addAttitude = () => {
    if (!newAttitude.trim()) return
    const newAttitudes = [...attitudes, newAttitude.trim()]
    updateField("unit", newAttitudes.join("\n"))
    setNewAttitude("")
  }

  const removeAttitude = (index: number) => {
    const newAttitudes = attitudes.filter((_, i) => i !== index)
    updateField("unit", newAttitudes.join())
  }

  const addActivity = () => {
    if (!newActivityText.trim()) return
    updateField("activities", [
      ...formData.activities,
      { day: newActivityDay, activity: newActivityText.trim() },
    ])
    setNewActivityText("")
  }

  const removeActivity = (index: number) => {
    updateField("activities", formData.activities.filter((_, i) => i !== index))
  }

  const addResource = () => {
    if (!newResource.trim()) return
    updateField("resources", [...formData.resources, newResource.trim()])
    setNewResource("")
  }

  const removeResource = (index: number) => {
    updateField("resources", formData.resources.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[88vh] p-0 flex flex-col">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {planning ? "Editar Planeación" : "Nueva Planeación Semanal"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Conceptualización, procedimientos y actitudes
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Curso</Label>
                <Select value={formData.courseId} onValueChange={(value) => updateField("courseId", value)}>
                  <SelectTrigger className="h-9 w-[200px]">
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
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Semana</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.weekNumber}
                  onChange={(e) => updateField("weekNumber", Number(e.target.value))}
                  className="h-9 w-20 text-center"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fecha Inicio</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  className="h-9 w-[150px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fecha Fin</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  className="h-9 w-[150px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Curso</Label>
                <Select value={formData.courseId} onValueChange={(value) => updateField("courseId", value)}>
                  <SelectTrigger className="h-9 w-[200px]">
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
            </div>
          </div>
        </DialogHeader>

        {/* FORM - LAYOUT HORIZONTAL */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-y-auto">
            
            {/* COLUMNA 1: CONCEPTUALIZACIÓN (SABER) */}
            <div className="space-y-4 lg:border-r lg:pr-6">
              <div className="flex items-center gap-2 pb-3 border-b-2">
                <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Conceptualización</h3>
                  <p className="text-xs text-muted-foreground">Saber - Conocimientos</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Estándares</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={newStandard}
                    onChange={(e) => setNewStandard(e.target.value)}
                    placeholder="Agregar estándar..."
                    rows={2}
                    className="resize-none flex-1"
                  />
                  <Button type="button" size="icon" className="h-9 w-9 shrink-0" onClick={addStandard}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {standards.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <p className="text-xs text-muted-foreground">No hay estándares agregados</p>
                    </div>
                  ) : (
                    standards.map((std, i) => (
                      <div key={i} className="flex gap-2 items-start p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                        <span className="flex-1 text-sm leading-relaxed">{std}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeStandard(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="h-px bg-border"></div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Competencias</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={newCompetence}
                    onChange={(e) => setNewCompetence(e.target.value)}
                    placeholder="Agregar competencia..."
                    rows={2}
                    className="resize-none flex-1"
                  />
                  <Button type="button" size="icon" className="h-9 w-9 shrink-0" onClick={addCompetence}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {competences.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <p className="text-xs text-muted-foreground">No hay competencias agregadas</p>
                    </div>
                  ) : (
                    competences.map((comp, i) => (
                      <div key={i} className="flex gap-2 items-start p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                        <span className="flex-1 text-sm leading-relaxed">{comp}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeCompetence(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA 2: PROCEDIMENTAL (HACER) */}
            <div className="space-y-4 lg:border-r lg:pr-6">
              <div className="flex items-center gap-2 pb-3 border-b-2">
                <div className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                  <Hammer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Procedimental</h3>
                  <p className="text-xs text-muted-foreground">Hacer - Prácticas</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Actividades por día</Label>
                <div className="flex gap-2">
                  <Select value={newActivityDay} onValueChange={(v) => setNewActivityDay(v as WeeklyActivity["day"])}>
                    <SelectTrigger className="h-9 w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOptions.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newActivityText}
                    onChange={(e) => setNewActivityText(e.target.value)}
                    placeholder="Describe la actividad del día..."
                    className="h-9 flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
                  />
                  <Button type="button" size="icon" className="h-9 w-9 shrink-0" onClick={addActivity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-2">
                  {formData.activities.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No hay actividades agregadas
                      </p>
                    </div>
                  ) : (
                    formData.activities.map((a, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                        <Badge variant="secondary" className="shrink-0 font-medium">{a.day}</Badge>
                        <span className="flex-1 text-sm leading-relaxed">{a.activity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeActivity(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA 3: ACTITUDINAL (SER) + RECURSOS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2">
                <div className="h-9 w-9 rounded-lg bg-pink-100 dark:bg-pink-950/30 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Actitudinal</h3>
                  <p className="text-xs text-muted-foreground">Ser - Valores</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Aspectos Actitudinales</Label>
                <div className="flex gap-2">
                  <Textarea
                    value={newAttitude}
                    onChange={(e) => setNewAttitude(e.target.value)}
                    placeholder="Agregar aspecto actitudinal..."
                    rows={2}
                    className="resize-none flex-1"
                  />
                  <Button type="button" size="icon" className="h-9 w-9 shrink-0" onClick={addAttitude}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                  {attitudes.length === 0 ? (
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <p className="text-xs text-muted-foreground">No hay aspectos agregados</p>
                    </div>
                  ) : (
                    attitudes.map((att, i) => (
                      <div key={i} className="flex gap-2 items-start p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                        <div className="h-1.5 w-1.5 rounded-full bg-pink-500 mt-2 shrink-0" />
                        <span className="flex-1 text-sm leading-relaxed">{att}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttitude(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="h-px bg-border"></div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Recursos Necesarios</Label>
                <div className="flex gap-2">
                  <Input
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    placeholder="Material, herramienta o recurso..."
                    className="h-9 flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                  />
                  <Button type="button" size="icon" className="h-9 w-9 shrink-0" onClick={addResource}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto p-2 border rounded-lg bg-muted/30">
                  {formData.resources.length === 0 ? (
                    <p className="text-sm text-muted-foreground w-full text-center py-4">
                      No hay recursos agregados
                    </p>
                  ) : (
                    formData.resources.map((r, i) => (
                      <Badge key={i} variant="secondary" className="gap-1.5 pr-1.5 text-sm">
                        {r}
                        <button
                          type="button"
                          onClick={() => removeResource(i)}
                          className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="px-6 py-4 border-t shrink-0 bg-muted/20">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
              <p className="text-sm text-muted-foreground">
                💡 Completa los tres aspectos del aprendizaje para una planeación integral
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
