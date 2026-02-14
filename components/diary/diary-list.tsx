"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, BookOpen, Calendar, FileText } from "lucide-react"
import { fetchDiaryEntries, deleteDiaryEntry, type DiaryEntryWithCourse } from "@/lib/diary-service"
import { useToast } from "@/hooks/use-toast"
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

interface DiaryListProps {
  onEdit: (entry: DiaryEntryWithCourse) => void
  onNew: () => void
  searchTerm?: string
  selectedCourse?: string
  dateFilter?: Date
}



export function DiaryList({
  onEdit,
  onNew,
  searchTerm,
  selectedCourse,
  dateFilter,
}: DiaryListProps) {

  const { toast } = useToast()
  const { data: entries = [], mutate } = useSWR<DiaryEntryWithCourse[]>(
    "diary-entries",
    fetchDiaryEntries
  )

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<DiaryEntryWithCourse | null>(null)

  // Filtrar entradas
const filteredEntries = entries.filter((entry) => {
  const matchesSearch = searchTerm
    ? entry.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.activities.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.observations?.toLowerCase().includes(searchTerm.toLowerCase())
    : true

  const matchesCourse =
    selectedCourse && selectedCourse !== "all"
      ? entry.course_id === selectedCourse
      : true

  const matchesDate = dateFilter
    ? entry.date === dateFilter.toLocaleDateString("sv-SE")
    : true

  return matchesSearch && matchesCourse && matchesDate
})


  const handleDelete = async () => {
    if (!entryToDelete) return

    try {
      await deleteDiaryEntry(entryToDelete.id)
      await mutate()
      toast({
        title: "Registro eliminado",
        description: "El registro del diario ha sido eliminado correctamente",
      })
      setDeleteDialogOpen(false)
      setEntryToDelete(null)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (entry: DiaryEntryWithCourse) => {
    setEntryToDelete(entry)
    setDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
  // Separar año, mes y día sin usar new Date()
  const [year, month, day] = dateString.split("-").map(Number)

  const date = new Date(year, month - 1, day) // Fecha local

  return {
    day: day.toString().padStart(2, "0"),
    month: date.toLocaleDateString("es-CO", { month: "short" }),
    year: year,
    full: date.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }
}


  if (filteredEntries.length === 0) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay registros</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm || selectedCourse !== "all" 
                ? "No se encontraron registros con los filtros aplicados"
                : "Comienza a documentar tu labor docente creando un nuevo registro"}
            </p>
            <Button onClick={onNew}>Crear primer registro</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filteredEntries.map((entry) => {
          const date = formatDate(entry.date)

          return (
            <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Fecha */}
                  <div className="flex flex-col items-center text-center min-w-[70px] pt-1">
                    <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
                      <span className="text-2xl font-bold leading-none">
                        {date.day}
                      </span>
                      <span className="text-xs uppercase mt-1">
                        {date.month}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">
                      {date.year}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            {entry.course.name}
                          </Badge>
                          <Badge variant="outline" className="gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {date.full}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {entry.topic}
                        </h3>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => onEdit(entry)}
                          title="Editar registro"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive"
                          onClick={() => confirmDelete(entry)}
                          title="Eliminar registro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Actividades Realizadas
                        </p>
                        <p className="text-foreground pl-3 leading-relaxed">
                          {entry.activities}
                        </p>
                      </div>

                      {entry.observations && (
                        <div className="space-y-1">
                          <p className="font-medium text-muted-foreground flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" />
                            Observaciones
                          </p>
                          <p className="text-foreground pl-3 leading-relaxed">
                            {entry.observations}
                          </p>
                        </div>
                      )}

                      {entry.notes && (
                        <div className="space-y-1 pt-2 border-t">
                          <p className="font-medium text-muted-foreground text-xs flex items-center gap-1.5">
                            <span className="inline-block w-1 h-1 rounded-full bg-amber-500" />
                            Notas Adicionales
                          </p>
                          <p className="text-muted-foreground text-xs pl-2.5 italic leading-relaxed">
                            {entry.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro del diario?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar el registro del <strong>{entryToDelete?.date}</strong> sobre{" "}
              <strong>"{entryToDelete?.topic}"</strong>.
              <br /><br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}