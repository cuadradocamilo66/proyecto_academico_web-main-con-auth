"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreVertical, Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { StudentDialog } from "./student-dialog"
import { DeleteStudentDialog } from "./delete-student-dialog"
import type { Student, Course } from "@/lib/types"
import type { CreateStudentData } from "@/lib/students-service"
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "@/lib/students-service"
import { fetchCourses } from "@/lib/courses-service"
import useSWR from "swr"
import router from "next/dist/shared/lib/router/router"

const statusLabels: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
  transferred: "Trasladado",
  graduated: "Graduado",
}

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  inactive: "secondary",
  transferred: "outline",
  graduated: "default",
}

export function StudentsList() {
  const { data: students = [], isLoading, mutate } = useSWR<Student[]>("students", fetchStudents)
  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")


  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || student.documentNumber.includes(searchTerm)
    const matchesCourse = filterCourse === "all" || student.courseId === filterCourse
    const matchesStatus = filterStatus === "all" || student.status === filterStatus
    return matchesSearch && matchesCourse && matchesStatus
  })

  const handleAddStudent = () => {
    setSelectedStudent(null)
    setDialogOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setDialogOpen(true)
  }

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student)
    setDeleteDialogOpen(true)
  }

  const handleSaveStudent = async (studentData: CreateStudentData & { id?: string }) => {
    if (studentData.id) {
      await updateStudent(studentData.id, studentData)
    } else {
      await createStudent(studentData)
    }
    mutate()
  }

  const handleConfirmDelete = async () => {
    if (selectedStudent) {
      await deleteStudent(selectedStudent.id)
      mutate()
      setDeleteDialogOpen(false)
      setSelectedStudent(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">Lista de Estudiantes</CardTitle>
          <Button size="sm" className="gap-1" onClick={handleAddStudent}>
            <Plus className="h-4 w-4" />
            Nuevo Estudiante
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por curso" />
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="transferred">Trasladados</SelectItem>
                <SelectItem value="graduated">Graduados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? "s" : ""} encontrado
            {filteredStudents.length !== 1 ? "s" : ""}
          </p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Estudiante</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Curso</th>
                {/*   <th className="pb-3 text-sm font-medium text-muted-foreground">Edad</th> */}
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Género</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No se encontraron estudiantes
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium",
                              student.gender === "femenino"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-blue-100 text-blue-700",
                            )}
                          >
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{student.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.documentType}: {student.documentNumber || "Sin documento"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 🔥 CURSO (YA FILTRADO POR DOCENTE) */}
                      <td className="py-4 text-sm">
                        {student.courseName ? (
                          student.courseName
                        ) : (
                          <span className="text-muted-foreground">Sin asignar</span>
                        )}
                      </td>

                      {/* <td className="py-4 text-sm">{student.age} años</td> */}
                      <td className="py-4 text-sm capitalize">{student.gender}</td>
                      <td className="py-4">
                        <Badge variant={statusVariants[student.status]}>
                          {statusLabels[student.status]}
                        </Badge>
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/estudiantes/${student.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteStudent(student)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </CardContent>
      </Card>

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={selectedStudent}
        onSave={handleSaveStudent}
      />

      <DeleteStudentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        student={selectedStudent}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
