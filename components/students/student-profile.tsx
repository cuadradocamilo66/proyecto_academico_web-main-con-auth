"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, BookOpen, MessageSquare, Bell, Calendar, Phone, Mail, MapPin, Heart, Shield } from "lucide-react"
import type { StudentDB, Grades, GradeItem } from "@/lib/types"
import { calculateAge, emptyGrades } from "@/lib/types"

interface StudentProfileData {
  id: string
  fullName: string
  status: "active" | "inactive" | "transferred" | "graduated"
  documentType: string
  documentNumber: string
  gender: string
  age: number
  course: string | null
  email: string | null
  phone: string | null
  address: string | null
  guardianName: string | null
  guardianPhone: string | null
  guardianRelationship: string | null
  bloodType: string | null
  healthInsurance: string | null
  allergies: string | null
  specialNeeds: string | null
  grades: Grades
}

const getAverageColor = (avg: number) => {
  if (avg < 3.0) return "text-red-500"
  if (avg < 4.0) return "text-amber-500"
  if (avg < 4.8) return "text-blue-500"
  return "text-emerald-500"
}

const getAverageBg = (avg: number) => {
  if (avg < 3.0) return "bg-red-50 border-red-200 dark:bg-red-950/20"
  if (avg < 4.0) return "bg-amber-50 border-amber-200 dark:bg-amber-950/20"
  if (avg < 4.8) return "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
  return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20"
}

const getStatusBadge = (status: string) => {
  const variants = {
    active: { label: "Activo", variant: "default" as const },
    inactive: { label: "Inactivo", variant: "secondary" as const },
    transferred: { label: "Trasladado", variant: "outline" as const },
    graduated: { label: "Graduado", variant: "outline" as const }
  }
  return variants[status as keyof typeof variants] || variants.active
}

interface StudentProfileProps {
  studentId: string
}

export function StudentProfile({ studentId }: StudentProfileProps) {
  const [student, setStudent] = useState<StudentProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          first_name,
          last_name,
          gender,
          status,
          birth_date,
          document_type,
          document_number,
          email,
          phone,
          address,
          guardian_name,
          guardian_phone,
          guardian_relationship,
          blood_type,
          health_insurance,
          allergies,
          special_needs,
          grades,
          course_id,
          courses!students_course_id_fkey (
            subject,
            grade,
            group_number
          )
        `)
        .eq("id", studentId)
        .maybeSingle()

      if (error || !data) {
        console.error("Error cargando estudiante:", error)
        setError("No se pudo cargar el estudiante")
        setStudent(null)
      } else {
        // Verificar si courses es un objeto o null
        const courseData = data.courses as any
        
        setStudent({
          id: data.id,
          fullName: `${data.first_name} ${data.last_name}`,
          status: data.status,
          documentType: data.document_type,
          documentNumber: data.document_number || "",
          gender: data.gender,
          age: calculateAge(data.birth_date),
          course: courseData
            ? `${courseData.subject} ${courseData.grade}°-${courseData.group_number}`
            : null,
          email: data.email,
          phone: data.phone,
          address: data.address,
          guardianName: data.guardian_name,
          guardianPhone: data.guardian_phone,
          guardianRelationship: data.guardian_relationship,
          bloodType: data.blood_type,
          healthInsurance: data.health_insurance,
          allergies: data.allergies,
          specialNeeds: data.special_needs,
          grades: data.grades ?? emptyGrades,
        })
      }
      setLoading(false)
    }

    fetchStudent()
  }, [studentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 w-full max-w-4xl animate-pulse">
          <div className="h-24 bg-muted rounded-xl"></div>
          <div className="h-[400px] bg-muted rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-destructive">{error || "Estudiante no encontrado"}</p>
          <p className="text-sm text-muted-foreground">Verifica el ID del estudiante</p>
        </div>
      </div>
    )
  }

  const allNotes = Object.values(student.grades)
    .flat()
    .filter((n): n is GradeItem => n !== null && typeof n?.value === "number")

  const generalAverage = allNotes.length > 0
    ? allNotes.reduce((acc, n) => acc + n.value, 0) / allNotes.length
    : null

  const statusBadge = getStatusBadge(student.status)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl shrink-0 shadow-lg">
                {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-semibold tracking-tight">{student.fullName}</h1>
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{student.course ?? "Sin curso asignado"}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>{student.age} años</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="capitalize">{student.gender}</span>
                </div>
              </div>
            </div>

            {generalAverage !== null && (
              <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 ${getAverageBg(generalAverage)} min-w-[130px] shadow-sm`}>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Promedio General</span>
                <span className={`text-4xl font-bold ${getAverageColor(generalAverage)}`}>
                  {generalAverage.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Card */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0 px-6 pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="notas" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Notas</span>
              </TabsTrigger>
              <TabsTrigger value="contacto" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Contacto</span>
              </TabsTrigger>
              <TabsTrigger value="salud" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Salud</span>
              </TabsTrigger>
              <TabsTrigger value="observaciones" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Observaciones</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 px-6 pb-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Documento</p>
                  <p className="text-base font-medium">{student.documentType} {student.documentNumber}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Curso</p>
                  <p className="text-base font-medium">{student.course ?? "Sin asignar"}</p>
                </div>
              </div>

              <div className="h-px bg-border"></div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 p-4 space-y-1">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">Total Notas</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{allNotes.length}</p>
                </div>
                <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 p-4 space-y-1">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wide">Periodos</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {Object.values(student.grades).filter(p => p.length > 0).length}
                  </p>
                </div>
                <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 p-4 space-y-1">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Estado</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 capitalize">{statusBadge.label}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notas" className="mt-6 px-6 pb-6 space-y-6">
              {Object.entries(student.grades).map(([period, notes]) => {
                if (!Array.isArray(notes) || notes.length === 0) return null

                const average = notes.reduce((acc, note) => acc + note.value, 0) / notes.length

                return (
                  <div key={period} className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b-2">
                      <h3 className="text-base font-semibold uppercase tracking-wider">{period.replace('p', 'Periodo ')}</h3>
                      <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${getAverageBg(average)}`}>
                        <span className={getAverageColor(average)}>{average.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      {notes.map((note, index) => (
                        <div
                          key={index}
                          className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all hover:shadow-sm">
                          <div className="space-y-0.5">
                            <span className="text-sm font-medium">{note.title || "Sin título"}</span>
                            <p className="text-xs text-muted-foreground">
                              {new Date(note.createdAt).toLocaleDateString('es-CO', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <span className={`text-lg font-bold ${getAverageColor(note.value)}`}>
                            {note.value.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {allNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-base font-medium text-muted-foreground">No hay notas registradas</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Las calificaciones aparecerán aquí cuando sean agregadas</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="contacto" className="mt-6 px-6 pb-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Información del Estudiante</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {student.email && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{student.email}</p>
                      </div>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Teléfono</p>
                        <p className="text-sm font-medium">{student.phone}</p>
                      </div>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border sm:col-span-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Dirección</p>
                        <p className="text-sm font-medium">{student.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-border"></div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Acudiente</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {student.guardianName && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Nombre</p>
                        <p className="text-sm font-medium">{student.guardianName}</p>
                        {student.guardianRelationship && (
                          <p className="text-xs text-muted-foreground capitalize">({student.guardianRelationship})</p>
                        )}
                      </div>
                    </div>
                  )}
                  {student.guardianPhone && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Teléfono</p>
                        <p className="text-sm font-medium">{student.guardianPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="salud" className="mt-6 px-6 pb-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {student.bloodType && (
                  <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950/20 border-red-200">
                    <p className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide mb-1">Tipo de Sangre</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{student.bloodType}</p>
                  </div>
                )}
                {student.healthInsurance && (
                  <div className="p-4 rounded-lg border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">EPS</p>
                    <p className="text-base font-medium">{student.healthInsurance}</p>
                  </div>
                )}
              </div>

              {(student.allergies || student.specialNeeds) && (
                <>
                  <div className="h-px bg-border"></div>
                  <div className="space-y-3">
                    {student.allergies && (
                      <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">Alergias</p>
                        <p className="text-sm text-amber-900 dark:text-amber-200">{student.allergies}</p>
                      </div>
                    )}
                    {student.specialNeeds && (
                      <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2">Necesidades Especiales</p>
                        <p className="text-sm text-blue-900 dark:text-blue-200">{student.specialNeeds}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!student.bloodType && !student.healthInsurance && !student.allergies && !student.specialNeeds && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-base font-medium text-muted-foreground">No hay información de salud registrada</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="observaciones" className="mt-6 px-6 pb-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-base font-medium text-muted-foreground">Próximamente</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Observaciones académicas y disciplinarias</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}