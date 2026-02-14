"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, BookMarked, Filter, Calendar as CalendarIcon } from "lucide-react"
import { DiaryList } from "@/components/diary/diary-list"
import { DiaryDialog } from "@/components/diary/diary-dialog"
import { fetchCourses } from "@/lib/courses-service"
import type { Course } from "@/lib/types"
import type { DiaryEntryWithCourse } from "@/lib/diary-service"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { AppShell } from "@/components/layout/app-shell"

export default function DiarioPage() {
  const { data: courses = [] } = useSWR<Course[]>("courses", fetchCourses)
  const { mutate } = useSWR("diary-entries")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiaryEntryWithCourse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)

  const handleNew = () => {
    setEditingEntry(null)
    setDialogOpen(true)
  }

  const handleEdit = (entry: DiaryEntryWithCourse) => {
    setEditingEntry(entry)
    setDialogOpen(true)
  }

  const handleSaved = () => {
    mutate()
    setEditingEntry(null)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCourse("all")
    setDateFilter(undefined)
  }

  const hasFilters = searchTerm || selectedCourse !== "all" || dateFilter

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-none shadow-sm">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookMarked className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Diario Pedagógico</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Registro cronológico de tus actividades docentes
                  </p>
                </div>
              </div>

              <Button onClick={handleNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Registro
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filtros y Búsqueda */}
        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tema, actividad u observación..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filtro de Curso */}
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Todos los cursos" />
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

              {/* Filtro de Fecha */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full sm:w-[200px] justify-start text-left font-normal ${!dateFilter && "text-muted-foreground"
                      }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP", { locale: es }) : "Filtrar por fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Limpiar filtros */}
              {hasFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="w-full sm:w-auto"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Badges de filtros activos */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Búsqueda: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCourse !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Curso: {courses.find(c => c.id === selectedCourse)?.name}
                    <button
                      onClick={() => setSelectedCourse("all")}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {dateFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Fecha: {format(dateFilter, "PPP", { locale: es })}
                    <button
                      onClick={() => setDateFilter(undefined)}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de registros */}
        <DiaryList
          onEdit={handleEdit}
          onNew={handleNew}
          searchTerm={searchTerm}
          selectedCourse={selectedCourse}
          dateFilter={dateFilter}
        />


        {/* Modal de crear/editar */}
        <DiaryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          entry={editingEntry}
          onSaved={handleSaved}
        />
      </div>
    </AppShell>
  )
}