"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Plus,
  FileText,
  Calendar,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react"
import type { Course, Student } from "@/lib/types"
import { fetchCourses } from "@/lib/courses-service"
import { fetchStudents } from "@/lib/students-service"
import Link from "next/link"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"
import { fetchDiaryEntries } from "@/lib/diary-service"
import { fetchObservations } from "@/lib/observations-service"

export function DashboardView() {
  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)
  const { data: students = [] } = useSWR<Student[]>("students", fetchStudents)
  const { data: diaries = [] } = useSWR("diary-entries", fetchDiaryEntries)
  const { data: observations = [] } = useSWR("observations", fetchObservations)
  // Calcular estadísticas
  const totalStudents = students.length
  const activeCourses = courses.length
  const activeStudents = students.filter((s) => s.status === "active").length

  // Estudiantes con calificaciones
  const studentsWithGrades = students.map((student) => {
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
    : "0.0"

  // Alertas pedagógicas
  const studentsAtRisk = studentsWithGrades.filter((s) => s.average < 3.0)

  // Rendimiento por cursos
  const coursePerformance = courses
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
        name: course.name.length > 20 ? course.name.substring(0, 20) + "..." : course.name,
        fullName: course.name,
        students: courseStudents.length,
        promedio: parseFloat(avg.toFixed(1)),
      }
    })
    .filter((c) => c.promedio > 0)
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 6)

  // Actividad reciente (simulada)
  const recentActivity = [
    ...diaries.map((entry) => ({
      id: entry.id,
      icon: FileText,
      message: `Nuevo registro: ${entry.topic}`,
      course: entry.course.name,
      time: formatDate(entry.created_at ?? entry.date),
      createdAt: entry.created_at ?? entry.date,
    })),
    ...observations.map((obs) => ({
      id: obs.id,
      icon: AlertTriangle,
      message: `Observación a ${obs.studentName}`,
      course: obs.course_name,
      time: formatDate(obs.createdAt ?? obs.date),
      createdAt: obs.createdAt ?? obs.date,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt + "T00:00:00").getTime() -
        new Date(a.createdAt + "T00:00:00").getTime()
    )
    .slice(0, 5)

  function formatDate(dateString: string) {
    return new Date(dateString + "T00:00:00").toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
    })
  }
  const getBarColor = (value: number) => {
    if (value >= 4.5) return "hsl(142, 76%, 36%)"
    if (value >= 4.0) return "hsl(221, 83%, 53%)"
    if (value >= 3.5) return "hsl(38, 92%, 50%)"
    return "hsl(0, 84%, 60%)"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido de nuevo, aquí está tu resumen académico
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {new Date().toLocaleDateString("es-CO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Estudiantes</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 mt-2">{totalStudents}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  {activeStudents} activos
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Cursos Activos</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-300 mt-2">{activeCourses}</p>
                <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                  {courses.length} en total
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Promedio General</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-2">{generalAverage}</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Rendimiento positivo
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Alertas</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-300 mt-2">{studentsAtRisk.length}</p>
                <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                  Requieren atención
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-600 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Acciones Rápidas */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/estudiantes">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Plus className="h-4 w-4" />
                Registrar Estudiante
              </Button>
            </Link>
            <Link href="/calificaciones">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <FileText className="h-4 w-4" />
                Agregar Calificaciones
              </Button>
            </Link>
            <Link href="/planeacion">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Calendar className="h-4 w-4" />
                Nueva Planeación
              </Button>
            </Link>
            <Link href="/observaciones">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <AlertTriangle className="h-4 w-4" />
                Registrar Observación
              </Button>
            </Link>
            <Link href="/reportes">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <TrendingUp className="h-4 w-4" />
                Ver Reportes
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">Actividad Reciente</CardTitle>
              </div>
              {/*<Button variant="ghost" size="sm" className="gap-1">
                Ver todo
                <ArrowRight className="h-3 w-3" />
              </Button>*/}
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium">No tienes actividad reciente</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cuando registres actividades aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.course}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>

        </Card>
      </div>

      {/* Rendimiento y Alertas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rendimiento por Cursos */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Rendimiento por Curso</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {coursePerformance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay datos disponibles</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={coursePerformance}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    domain={[0, 5]}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-card p-3 shadow-lg">
                            <p className="text-sm font-medium mb-1">{payload[0].payload.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              Promedio: <span className="font-semibold">{payload[0].value}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Estudiantes: {payload[0].payload.students}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="promedio" radius={[4, 4, 0, 0]}>
                    {coursePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.promedio)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Alertas Pedagógicas */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base font-semibold">Alertas Pedagógicas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {studentsAtRisk.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Award className="h-12 w-12 text-green-600 mb-3" />
                <p className="text-sm font-medium">¡Excelente!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No hay estudiantes en riesgo académico
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                {studentsAtRisk.slice(0, 6).map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-xs font-semibold">
                        {student.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground">{student.courseName}</p>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      {student.average.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cursos Activos */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Cursos Activos</CardTitle>
            </div>
            <Link href="/cursos">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todos
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {courses.slice(0, 8).map((course) => (
              <div
                key={course.id}
                className="group relative p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: course.color }}
                  >
                    {course.grade}°
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {course.students} estudiantes
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{course.subject}</h3>
                <p className="text-xs text-muted-foreground">
                  Grupo {course.groupNumber}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}