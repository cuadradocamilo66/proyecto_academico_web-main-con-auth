"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Student, Course } from "@/lib/types"
import type { CreateStudentData } from "@/lib/students-service"
import { User, GraduationCap, Users, Loader2, CheckCircle2 } from "lucide-react"
import useSWR from "swr"
import { fetchCourses } from "@/lib/courses-service"

interface StudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null
  onSave: (student: CreateStudentData & { id?: string }) => Promise<void>
}

const documentTypes = [
  { value: "TI", label: "TI - Tarjeta de Identidad" },
  { value: "RC", label: "RC - Registro Civil" },
  { value: "CC", label: "CC - Cédula de Ciudadanía" },
  { value: "CE", label: "CE - Cédula de Extranjería" },
  { value: "PEP", label: "PEP" },
]

const genderOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
]

const statusOptions = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
  { value: "transferred", label: "Trasladado" },
  { value: "graduated", label: "Graduado" },
]

export function StudentDialog({ open, onOpenChange, student, onSave }: StudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)

  const [formData, setFormData] = useState<CreateStudentData>({
    firstName: "",
    lastName: "",
    gender: "masculino",
    birthDate: "",
    documentType: "TI",
    documentNumber: "",
    courseId: "",
    status: "active",
    notes: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
  })

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        birthDate: student.birthDate,
        documentType: student.documentType,
        documentNumber: student.documentNumber,
        courseId: student.courseId || "",
        status: student.status,
        notes: student.notes,
        guardianName: student.guardianName || "",
        guardianPhone: student.guardianPhone || "",
        guardianEmail: student.guardianEmail || "",
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        gender: "masculino",
        birthDate: "",
        documentType: "TI",
        documentNumber: "",
        courseId: "",
        status: "active",
        notes: "",
        guardianName: "",
        guardianPhone: "",
        guardianEmail: "",
      })
    }
    setActiveTab("personal")
  }, [student, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 🔒 VALIDACIÓN CLAVE
      const courseIsValid =
        formData.courseId &&
        courses.some((course) => course.id === formData.courseId)

      if (!courseIsValid) {
        throw new Error("Curso inválido o no pertenece al docente")
      }

      if (student) {
        await onSave({ ...formData, id: student.id })
      } else {
        await onSave(formData)
      }

      onOpenChange(false)
    }  catch (error: unknown) {
  if (error instanceof Error) {
    console.error("Error saving student:", error.message)
    console.error(error.stack)
  } else {
    console.error("Error saving student (raw):", JSON.stringify(error, null, 2))
  }
}
 finally {
      setIsSubmitting(false)
    }
  }


  const updateField = (field: keyof CreateStudentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold">
                {student ? "Editar Estudiante" : "Nuevo Estudiante"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {student ? "Actualiza la información del estudiante" : "Completa los datos del nuevo estudiante"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 border-b bg-muted/30">
              <TabsList className="w-full justify-start h-auto p-1 bg-background rounded-lg">
                <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User className="h-4 w-4" />
                  <span>Personal</span>
                </TabsTrigger>
                <TabsTrigger value="academic" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span>Académico</span>
                </TabsTrigger>
                <TabsTrigger value="guardian" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Users className="h-4 w-4" />
                  <span>Acudiente</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 px-6">
              {/* PERSONAL TAB */}
              <TabsContent value="personal" className="mt-6 space-y-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-base">Información Personal</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        Nombres <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        placeholder="Ej: Juan Pablo"
                        className="h-10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Apellidos <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        placeholder="Ej: Martínez López"
                        className="h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="documentType" className="text-sm font-medium">
                        Tipo de Documento <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.documentType}
                        onValueChange={(value) => updateField("documentType", value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documentNumber" className="text-sm font-medium">
                        Número de Documento <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="documentNumber"
                        value={formData.documentNumber}
                        onChange={(e) => updateField("documentNumber", e.target.value)}
                        placeholder="Ej: 1000123456"
                        className="h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">
                      Género <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                </div>
              </TabsContent>

              {/* ACADEMIC TAB */}
              <TabsContent value="academic" className="mt-6 space-y-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-base">Información Académica</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseId" className="text-sm font-medium">
                      Curso <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.courseId}
                      onValueChange={(value) => updateField("courseId", value)}
                      required
                    >
                      <SelectTrigger className="h-10">
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
                    <p className="text-xs text-muted-foreground">
                      Selecciona el curso al que pertenece el estudiante
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Estado <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {option.value === "active" && (
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              )}
                              {option.value === "inactive" && (
                                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                              )}
                              {option.value === "transferred" && (
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              )}
                              {option.value === "graduated" && (
                                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                              )}
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notas y Observaciones
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Observaciones generales sobre el estudiante, comportamiento, rendimiento académico, etc..."
                      rows={5}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Información adicional que consideres relevante
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* GUARDIAN TAB */}
              <TabsContent value="guardian" className="mt-6 space-y-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                      <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-base">Información del Acudiente</h3>
                  </div>

                  <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      💡 Los datos del acudiente son opcionales pero recomendados para mantener una comunicación efectiva con las familias.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianName" className="text-sm font-medium">
                      Nombre Completo del Acudiente
                    </Label>
                    <Input
                      id="guardianName"
                      value={formData.guardianName}
                      onChange={(e) => updateField("guardianName", e.target.value)}
                      placeholder="Ej: María López García"
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Nombre del padre, madre o tutor legal
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardianPhone" className="text-sm font-medium">
                        Teléfono de Contacto
                      </Label>
                      <Input
                        id="guardianPhone"
                        type="tel"
                        value={formData.guardianPhone}
                        onChange={(e) => updateField("guardianPhone", e.target.value)}
                        placeholder="300 123 4567"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianEmail" className="text-sm font-medium">
                        Correo Electrónico
                      </Label>
                      <Input
                        id="guardianEmail"
                        type="email"
                        value={formData.guardianEmail}
                        onChange={(e) => updateField("guardianEmail", e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Proporciona al menos un medio de contacto (teléfono o email) para comunicaciones importantes
                    </p>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-muted-foreground">
                Los campos marcados con <span className="text-destructive">*</span> son obligatorios
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {student ? "Guardar Cambios" : "Crear Estudiante"}
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