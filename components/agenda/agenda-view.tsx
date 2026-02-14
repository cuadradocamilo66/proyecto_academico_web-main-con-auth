"use client"

import { useState, useEffect } from "react"
import { Event, CreateEventData } from "@/lib/types"
import { fetchEventsByMonth, createEvent, deleteEvent } from "@/lib/agenda-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CourseSelector } from "@/components/agenda/course-selector"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  BookOpen,
  FileText,
  Users,
  Target,
  Sparkles,
} from "lucide-react"

// Función auxiliar para parsear fechas sin problemas de zona horaria
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function AgendaView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

  // Form state
  const [newEvent, setNewEvent] = useState<CreateEventData>({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    type: "other",
    courseId: undefined,
  })

  useEffect(() => {
    loadEvents()
  }, [currentDate])

  async function loadEvents() {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const monthEvents = await fetchEventsByMonth(year, month)
      setEvents(monthEvents)
    } catch (error) {
      console.error("Failed to load events:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateEvent() {
    if (!newEvent.title || !newEvent.date) return

    setIsSubmitting(true)
    try {
      await createEvent(newEvent)
      await loadEvents()
      setIsAddDialogOpen(false)
      setNewEvent({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "",
        type: "other",
        courseId: undefined,
      })
    } catch (error) {
      console.error("Failed to create event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteEvent(eventId: string) {
    try {
      await deleteEvent(eventId)
      await loadEvents()
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    } catch (error) {
      console.error("Failed to delete event:", error)
    }
  }

  function confirmDelete(event: Event) {
    setEventToDelete(event)
    setDeleteDialogOpen(true)
  }

  const eventsForSelectedDate = events.filter(
    (event) =>
      selectedDate &&
      parseLocalDate(event.date).toDateString() === selectedDate.toDateString()
  )

  const eventTypeConfig = {
    deadline: {
      color: "bg-rose-500/10 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-800",
      icon: Target,
      label: "Fecha límite",
    },
    meeting: {
      color: "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800",
      icon: Users,
      label: "Reunión",
    },
    exam: {
      color: "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-800",
      icon: FileText,
      label: "Examen",
    },
    planning: {
      color: "bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800",
      icon: CalendarIcon,
      label: "Planificación",
    },
    other: {
      color: "bg-slate-500/10 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-800",
      icon: Sparkles,
      label: "Otro",
    },
  }

  const eventDates = events.map((e) => new Date(e.date))

  // Agrupar eventos por fecha para mostrar diferentes colores
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = parseLocalDate(event.date).toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  // Crear modifiers para cada tipo de evento
  const deadlineModifier = events
    .filter((e) => e.type === "deadline")
    .map((e) => parseLocalDate(e.date))
  const meetingModifier = events
    .filter((e) => e.type === "meeting")
    .map((e) => parseLocalDate(e.date))
  const examModifier = events
    .filter((e) => e.type === "exam")
    .map((e) => parseLocalDate(e.date))
  const planningModifier = events
    .filter((e) => e.type === "planning")
    .map((e) => parseLocalDate(e.date))
  const otherModifier = events
    .filter((e) => e.type === "other")
    .map((e) => parseLocalDate(e.date))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Agenda Académica
          </h1>
          <p className="text-muted-foreground mt-1">
            Organiza y visualiza tus eventos académicos
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Crear Evento</DialogTitle>
              <DialogDescription>
                Agrega un nuevo evento a tu agenda académica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Entrega de proyecto final"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de evento *</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value: any) =>
                    setNewEvent({ ...newEvent, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">📌 Fecha límite</SelectItem>
                    <SelectItem value="meeting">👥 Reunión</SelectItem>
                    <SelectItem value="exam">📝 Examen</SelectItem>
                    <SelectItem value="planning">📅 Planificación</SelectItem>
                    <SelectItem value="other">✨ Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Detalles adicionales sobre el evento..."
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                />
              </div>

              <CourseSelector
                value={newEvent.courseId}
                onChange={(courseId) =>
                  setNewEvent({ ...newEvent, courseId })
                }
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={!newEvent.title || !newEvent.date || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? "Creando..." : "Crear Evento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Section */}
        <Card className="lg:col-span-2 shadow-xl border-2 hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Calendario
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <style jsx global>{`
              .event-deadline {
                position: relative;
              }
              .event-deadline::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 3px;
                background: rgb(244, 63, 94);
                border-radius: 2px;
              }
              .event-meeting {
                position: relative;
              }
              .event-meeting::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 3px;
                background: rgb(59, 130, 246);
                border-radius: 2px;
              }
              .event-exam {
                position: relative;
              }
              .event-exam::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 3px;
                background: rgb(168, 85, 247);
                border-radius: 2px;
              }
              .event-planning {
                position: relative;
              }
              .event-planning::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 3px;
                background: rgb(245, 158, 11);
                border-radius: 2px;
              }
              .event-other {
                position: relative;
              }
              .event-other::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 3px;
                background: rgb(100, 116, 139);
                border-radius: 2px;
              }
              .event-multiple {
                position: relative;
              }
              .event-multiple::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 3px;
                background: linear-gradient(90deg, rgb(244, 63, 94) 0%, rgb(59, 130, 246) 33%, rgb(168, 85, 247) 66%, rgb(245, 158, 11) 100%);
                border-radius: 2px;
              }
            `}</style>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentDate}
              onMonthChange={setCurrentDate}
              locale={es}
              className="rounded-lg border-0 scale-125"
              modifiers={{
                hasDeadline: deadlineModifier,
                hasMeeting: meetingModifier,
                hasExam: examModifier,
                hasPlanning: planningModifier,
                hasOther: otherModifier,
                hasMultiple: Object.entries(eventsByDate)
                  .filter(([_, events]) => events.length > 1)
                  .map(([dateStr]) => new Date(dateStr)),
              }}
              modifiersClassNames={{
                hasDeadline: "event-deadline font-semibold",
                hasMeeting: "event-meeting font-semibold",
                hasExam: "event-exam font-semibold",
                hasPlanning: "event-planning font-semibold",
                hasOther: "event-other font-semibold",
                hasMultiple: "event-multiple font-bold",
              }}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-xl font-bold",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-10 w-10 bg-transparent hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-12 font-semibold text-base",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-base focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                day: "h-12 w-12 p-0 font-normal hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200 hover:scale-110",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg scale-110",
                day_today: "bg-accent text-accent-foreground font-bold ring-2 ring-primary ring-offset-2",
                day_outside: "text-muted-foreground opacity-40",
                day_disabled: "text-muted-foreground opacity-30",
              }}
            />
          </CardContent>
          <div className="px-6 pb-6">
            <div className="pt-4 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-3">
                Leyenda de eventos
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded-full bg-rose-500"></div>
                  <span className="text-xs text-muted-foreground">Fecha límite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-muted-foreground">Reunión</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-muted-foreground">Examen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-muted-foreground">Planificación</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded-full bg-slate-500"></div>
                  <span className="text-xs text-muted-foreground">Otro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 rounded-full bg-gradient-to-r from-rose-500 via-blue-500 to-purple-500"></div>
                  <span className="text-xs text-muted-foreground">Múltiples</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Events for Selected Date */}
        <Card className="shadow-xl border-2 hover:shadow-2xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Eventos</span>
              </div>
              {selectedDate && (
                <span className="text-sm font-normal text-muted-foreground">
                  {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 animate-pulse"
                  />
                ))}
              </div>
            ) : eventsForSelectedDate.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                  No hay eventos
                </p>
                <p className="text-sm text-muted-foreground">
                  Selecciona otro día o crea un evento nuevo
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {eventsForSelectedDate.map((event, index) => {
                  const config = eventTypeConfig[event.type]
                  const Icon = config.icon

                  return (
                    <div
                      key={event.id}
                      className="group relative overflow-hidden rounded-xl border-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      {/* Decorative gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <h3 className="font-bold text-lg leading-tight">
                              {event.title}
                            </h3>
                            {event.time && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {event.time}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => confirmDelete(event)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {config.label}
                        </div>

                        {event.courseName && (
                          <div className="flex items-center gap-2 text-sm font-medium text-primary">
                            <BookOpen className="h-4 w-4" />
                            {event.courseName}
                          </div>
                        )}

                        {event.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-3">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(eventTypeConfig).map(([type, config]) => {
          const Icon = config.icon
          const count = events.filter((e) => e.type === type).length

          return (
            <Card
              key={type}
              className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Eliminar Evento
            </DialogTitle>
            <DialogDescription className="pt-2">
              ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {eventToDelete && (
            <div className="py-4 space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="font-semibold text-base mb-2">{eventToDelete.title}</h4>
                {eventToDelete.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {eventToDelete.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{format(parseLocalDate(eventToDelete.date), "d 'de' MMMM, yyyy", { locale: es })}</span>
                  {eventToDelete.time && (
                    <>
                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                      <span>{eventToDelete.time}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setEventToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => eventToDelete && handleDeleteEvent(eventToDelete.id)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}