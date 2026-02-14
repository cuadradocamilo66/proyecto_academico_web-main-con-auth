"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Award,
  BookOpen,
  Download,
  FileSpreadsheet,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Course, Student } from "@/lib/types"
import { fetchCourses } from "@/lib/courses-service"
import { fetchStudents } from "@/lib/students-service"
import * as XLSX from 'xlsx'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

const COLORS = {
  excellent: "hsl(142, 76%, 36%)",
  good: "hsl(221, 83%, 53%)",
  acceptable: "hsl(38, 92%, 50%)",
  low: "hsl(0, 84%, 60%)",
}

export function ReportsView() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all")

  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)
  const { data: students = [] } = useSWR<Student[]>("students", fetchStudents)

  const filteredStudents = selectedCourse === "all"
    ? students
    : students.filter((s) => s.courseId === selectedCourse)

  // Calcular estadísticas
  const totalStudents = filteredStudents.length

  const studentsWithGrades = filteredStudents.map((student) => {
    const allGrades = Object.values(student.grades || {})
      .flat()
      .filter((g) => g?.value !== undefined)

    const average = allGrades.length > 0
      ? allGrades.reduce((acc, g) => acc + g.value, 0) / allGrades.length
      : 0

    return { ...student, average }
  }).filter((s) => s.average > 0)

  const generalAverage = studentsWithGrades.length > 0
    ? (studentsWithGrades.reduce((acc, s) => acc + s.average, 0) / studentsWithGrades.length).toFixed(1)
    : "N/A"

  const needsSupport = studentsWithGrades.filter((s) => s.average < 3.0)
  const excellentStudents = studentsWithGrades.filter((s) => s.average >= 4.5)
  const topStudents = [...studentsWithGrades].sort((a, b) => b.average - a.average).slice(0, 5)

  // Distribución de calificaciones
  const gradeDistribution = [
    { 
      name: "Excelente (4.5-5.0)", 
      value: studentsWithGrades.filter((s) => s.average >= 4.5).length,
      color: COLORS.excellent
    },
    { 
      name: "Bueno (3.5-4.4)", 
      value: studentsWithGrades.filter((s) => s.average >= 3.5 && s.average < 4.5).length,
      color: COLORS.good
    },
    { 
      name: "Aceptable (3.0-3.4)", 
      value: studentsWithGrades.filter((s) => s.average >= 3.0 && s.average < 3.5).length,
      color: COLORS.acceptable
    },
    { 
      name: "Bajo (< 3.0)", 
      value: studentsWithGrades.filter((s) => s.average < 3.0).length,
      color: COLORS.low
    },
  ]

  // Tendencia por periodo
  const performanceTrend = [
    { period: "P1", promedio: calculatePeriodAverage("p1") },
    { period: "P2", promedio: calculatePeriodAverage("p2") },
    { period: "P3", promedio: calculatePeriodAverage("p3") },
    { period: "P4", promedio: calculatePeriodAverage("p4") },
  ].filter((p) => p.promedio > 0)

  function calculatePeriodAverage(period: "p1" | "p2" | "p3" | "p4") {
    let total = 0
    let count = 0

    filteredStudents.forEach((student) => {
      const grades = student.grades?.[period] || []
      if (grades.length > 0) {
        const avg = grades.reduce((acc, g) => acc + g.value, 0) / grades.length
        total += avg
        count++
      }
    })

    return count > 0 ? parseFloat((total / count).toFixed(1)) : 0
  }

  // Comparación por curso
  const courseComparison = courses
    .map((course) => {
      const courseStudents = students.filter((s) => s.courseId === course.id)
      
      const studentsWithAvg = courseStudents.map((student) => {
        const allGrades = Object.values(student.grades || {}).flat().filter((g) => g?.value !== undefined)
        return allGrades.length > 0
          ? allGrades.reduce((acc, g) => acc + g.value, 0) / allGrades.length
          : 0
      }).filter((avg) => avg > 0)

      const avg = studentsWithAvg.length > 0
        ? studentsWithAvg.reduce((acc, avg) => acc + avg, 0) / studentsWithAvg.length
        : 0

      return {
        course: course.name,
        promedio: parseFloat(avg.toFixed(1)),
      }
    })
    .filter((c) => c.promedio > 0)
    .slice(0, 5)

  // Generar reportes Excel
  const generateAcademicReport = () => {
    const data = studentsWithGrades.map((student) => {
      const p1 = calculateStudentPeriodAvg(student, "p1")
      const p2 = calculateStudentPeriodAvg(student, "p2")
      const p3 = calculateStudentPeriodAvg(student, "p3")
      const p4 = calculateStudentPeriodAvg(student, "p4")

      return {
        "Estudiante": student.fullName,
        "Documento": student.documentNumber,
        "Curso": student.courseName || "Sin curso",
        "P1": p1 !== null ? p1.toFixed(2) : "—",
        "P2": p2 !== null ? p2.toFixed(2) : "—",
        "P3": p3 !== null ? p3.toFixed(2) : "—",
        "P4": p4 !== null ? p4.toFixed(2) : "—",
        "Promedio": student.average.toFixed(2),
      }
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Rendimiento")
    
    const courseName = selectedCourse === "all" ? "Todos" : courses.find((c) => c.id === selectedCourse)?.name
    XLSX.writeFile(wb, `Reporte_${courseName}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  function calculateStudentPeriodAvg(student: Student, period: "p1" | "p2" | "p3" | "p4") {
    const grades = student.grades?.[period] || []
    if (grades.length === 0) return null
    return grades.reduce((acc, g) => acc + g.value, 0) / grades.length
  }

  return (
    <div className="space-y-6">
      {/* Filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Reporte de estadísticas académicas y comportamentales por curso y area
            </p>
          </div>
        </div>

      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Filtrar por curso</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue />
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
            <Button onClick={generateAcademicReport} className="gap-2 mt-6">
              <FileSpreadsheet className="h-4 w-4" />
              Exportar a Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Estudiantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{generalAverage}</p>
                <p className="text-sm text-muted-foreground">Promedio General</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-500/10 p-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{needsSupport.length}</p>
                <p className="text-sm text-muted-foreground">Requieren Apoyo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{excellentStudents.length}</p>
                <p className="text-sm text-muted-foreground">Rendimiento Excelente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribución de Calificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeDistribution.every((g) => g.value === 0) ? (
              <p className="text-center text-muted-foreground py-8">No hay datos suficientes</p>
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie 
                      data={gradeDistribution} 
                      dataKey="value" 
                      innerRadius={50} 
                      outerRadius={80} 
                      paddingAngle={2}
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {gradeDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tendencia por Periodo</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceTrend.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay datos suficientes</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={performanceTrend}>
                  <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis domain={[0, 5]} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-card p-2 shadow-sm">
                            <p className="text-sm font-medium">{payload[0].payload.period}</p>
                            <p className="text-xs text-muted-foreground">Promedio: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="promedio"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Comparison and Top Students */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Comparación por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            {courseComparison.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay datos suficientes</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={courseComparison} layout="vertical">
                  <XAxis type="number" domain={[0, 5]} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="course" 
                    tickLine={false} 
                    axisLine={false} 
                    fontSize={11} 
                    width={150}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-card p-2 shadow-sm max-w-[200px]">
                            <p className="text-sm font-medium">{payload[0].payload.course}</p>
                            <p className="text-xs text-muted-foreground">Promedio: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="promedio" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Mejores Promedios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topStudents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay datos suficientes</p>
            ) : (
              topStudents.map((student, idx) => (
                <div key={student.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.fullName}</p>
                    <p className="text-sm text-muted-foreground">{student.courseName}</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">{student.average.toFixed(1)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Students Needing Support */}
      {needsSupport.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Estudiantes que Requieren Apoyo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {needsSupport.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-sm font-medium text-red-600">
                    {student.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">Promedio: {student.average.toFixed(1)}</p>
                  </div>
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}