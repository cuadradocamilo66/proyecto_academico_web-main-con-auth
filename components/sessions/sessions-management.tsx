"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Play,
    StopCircle,
    Copy,
    CheckCircle2,
    TrendingUp,
    Clock,
    RefreshCcw,
    UserCheck,
    Plus,
    Trash2,
    X,
    FileText,
    Eye,
    EyeOff,
    Settings2,
    Check,
    BarChart3,
    Search,
    History,
    Timer,
    XCircle,
    Download,
    ArrowLeft,
    ArrowRight
} from "lucide-react"
import { fetchSessionResults, closeSession, createActivitySession, toggleResultsVisibility, fetchPastSessions } from "@/lib/session-service"
import { fetchActivities, createActivity, deleteActivity } from "@/lib/activity-service"
import { fetchPeriods } from "@/lib/periods-service"
import { fetchCourses } from "@/lib/courses-service"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from "xlsx"

export function SessionsManagement() {
    const { user } = useAuth()
    const [activities, setActivities] = useState<any[]>([])
    const [pastSessions, setPastSessions] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [periods, setPeriods] = useState<any[]>([])
    const [activeSession, setActiveSession] = useState<any>(null)
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Estado para ver detalle de estudiante
    const [selectedStudent, setSelectedStudent] = useState<any>(null)

    // Estado para configurar nueva sesión
    const [sessionConfig, setSessionConfig] = useState({
        activityId: "",
        duration: "0" // "0" means no limit
    })
    const [isStartModalOpen, setIsStartModalOpen] = useState(false)

    // Estados para nueva actividad
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newActivity, setNewActivity] = useState({
        title: "",
        description: "",
        courseId: "",
        periodId: "",
        questions: [
            {
                id: "1",
                text: "",
                type: "multiple",
                options: ["", "", "", ""],
                correctAnswer: ""
            }
        ]
    })

    // Cronómetro para sesión activa
    const [timeLeft, setTimeLeft] = useState<string | null>(null)

    useEffect(() => {
        async function init() {
            if (!user) return
            try {
                const [acts, crs, prds, past] = await Promise.all([
                    fetchActivities(),
                    fetchCourses(),
                    fetchPeriods(),
                    fetchPastSessions(user.id)
                ])
                setActivities(acts)
                setCourses(crs)
                setPeriods(prds)
                setPastSessions(past)
            } catch (err) {
                console.error("Error loading initial data:", err)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [user])

    useEffect(() => {
        let interval: any
        if (activeSession) {
            const getResults = async () => {
                try {
                    const data = await fetchSessionResults(activeSession.id)
                    setResults(data)
                } catch (err) {
                    console.error("Error polling results:", err)
                }
            }
            getResults()
            if (!activeSession.is_historical) {
                interval = setInterval(getResults, 5000)
            }

            // Manejar cronómetro
            if (activeSession.expires_at && !activeSession.is_historical) {
                const timerInterval = setInterval(() => {
                    const now = new Date().getTime()
                    const expiry = new Date(activeSession.expires_at).getTime()
                    const diff = expiry - now

                    if (diff <= 0) {
                        setTimeLeft("EXPIRADO")
                        handleCloseSession()
                        clearInterval(timerInterval)
                    } else {
                        const mins = Math.floor(diff / 60000)
                        const secs = Math.floor((diff % 60000) / 1000)
                        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`)
                    }
                }, 1000)
                return () => {
                    if (interval) clearInterval(interval)
                    clearInterval(timerInterval)
                }
            }
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [activeSession])

    const handleOpenStartSession = (activityId: string) => {
        setSessionConfig({ activityId, duration: "0" })
        setIsStartModalOpen(true)
    }

    const handleStartSession = async () => {
        if (!user || !sessionConfig.activityId) return
        try {
            const duration = parseInt(sessionConfig.duration)
            const session = await createActivitySession(sessionConfig.activityId, user.id, duration > 0 ? duration : undefined)
            const activity = activities.find(a => a.id === sessionConfig.activityId)
            setActiveSession({ ...session, activity_data: activity })
            setResults([])
            setIsStartModalOpen(false)
            toast.success("¡Sesión iniciada!")
        } catch (err) {
            toast.error("Error al iniciar sesión")
        }
    }

    const handleCloseSession = async (sessionId?: string) => {
        const id = sessionId || activeSession?.id
        if (!id) return
        try {
            await closeSession(id)
            if (activeSession?.id === id) setActiveSession(null)
            if (user) {
                const past = await fetchPastSessions(user.id)
                setPastSessions(past)
            }
            toast.info("Sesión finalizada")
        } catch (err) {
            toast.error("Error al cerrar la sesión")
        }
    }

    const handleViewHistoricalResults = async (session: any) => {
        try {
            const data = await fetchSessionResults(session.id)
            setActiveSession({
                ...session,
                activity_data: activities.find(a => a.id === session.activity_id) || { title: session.activities?.title, questions: [] },
                is_historical: true
            })
            setResults(data)
        } catch (err) {
            toast.error("Error al cargar resultados históricos")
        }
    }

    const handleToggleResults = async (show: boolean) => {
        if (!activeSession) return
        try {
            await toggleResultsVisibility(activeSession.id, show)
            setActiveSession({ ...activeSession, show_results: show })
            toast.success(show ? "Resultados visibles para alumnos" : "Resultados ocultos")
        } catch (err) {
            toast.error("Error al cambiar visibilidad")
        }
    }

    const copyCode = () => {
        if (activeSession) {
            navigator.clipboard.writeText(activeSession.code)
            toast.success(`Código ${activeSession.code} copiado`)
        }
    }

    const addQuestion = () => {
        setNewActivity(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    text: "",
                    type: "multiple",
                    options: ["", "", "", ""],
                    correctAnswer: ""
                }
            ]
        }))
    }

    const removeQuestion = (id: string) => {
        if (newActivity.questions.length <= 1) return
        setNewActivity(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id)
        }))
    }

    const updateQuestion = (id: string, fields: any) => {
        setNewActivity(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === id) {
                    const updated = { ...q, ...fields }
                    if (fields.type === "boolean" && q.type !== "boolean") {
                        updated.options = ["Verdadero", "Falso"]
                        updated.correctAnswer = ""
                    } else if (fields.type === "multiple" && q.type !== "multiple") {
                        updated.options = ["", "", "", ""]
                        updated.correctAnswer = ""
                    }
                    return updated
                }
                return q
            })
        }))
    }

    const updateOption = (qId: string, optIdx: number, val: string) => {
        setNewActivity(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === qId) {
                    const newOpts = [...q.options]
                    newOpts[optIdx] = val
                    return { ...q, options: newOpts }
                }
                return q
            })
        }))
    }

    const handleCreateActivity = async () => {
        if (!newActivity.title || !newActivity.courseId || !newActivity.periodId) {
            toast.error("Por favor completa los campos obligatorios")
            return
        }

        if (newActivity.questions.some(q => !q.correctAnswer)) {
            toast.error("Por favor marca la respuesta correcta en todas las preguntas")
            return
        }

        setIsSubmitting(true)
        try {
            await createActivity({
                title: newActivity.title,
                description: newActivity.description,
                courseId: newActivity.courseId,
                periodId: newActivity.periodId,
                questions: newActivity.questions
            })

            const acts = await fetchActivities()
            setActivities(acts)
            setIsModalOpen(false)
            setNewActivity({
                title: "",
                description: "",
                courseId: "",
                periodId: "",
                questions: [{ id: "1", text: "", type: "multiple", options: ["", "", "", ""], correctAnswer: "" }]
            })
            toast.success("Actividad creada exitosamente")
        } catch (err) {
            toast.error("Error al crear la actividad")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteActivity = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta actividad?")) return
        try {
            await deleteActivity(id)
            setActivities(activities.filter(a => a.id !== id))
            toast.success("Actividad eliminada")
        } catch (err) {
            toast.error("Error al eliminar")
        }
    }

    const calculateGrade = (correct: number, total: number) => {
        if (total === 0) return "0.0"
        return ((correct / total) * 5).toFixed(1)
    }

    const getStudentScore = (studentResults: any[]) => {
        if (!studentResults) return 0
        return studentResults.reduce((acc, curr) => acc + (curr.score || 0), 0)
    }

    const handleExportExcel = () => {
        if (results.length === 0) {
            toast.error("No hay resultados para exportar")
            return
        }

        const totalQuestions = activeSession.activity_data?.questions?.length || 0

        const data = results.map(p => ({
            "Estudiante": p.student_name,
            "Código": p.student_code || "N/A",
            "Correctas": getStudentScore(p.session_responses),
            "Totales": totalQuestions,
            "Nota (0-5)": calculateGrade(getStudentScore(p.session_responses), totalQuestions),
            "Fecha": new Date(p.joined_at).toLocaleString()
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Resultados")

        const fileName = `Resultados_${activeSession.activity_data?.title || "Actividad"}_${new Date().toLocaleDateString()}.xlsx`
        XLSX.writeFile(wb, fileName)
        toast.success("Archivo Excel generado con éxito")
    }

    if (activeSession) {
        const activityQuestions = activeSession.activity_data?.questions || []

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Card className={cn(
                    "border-none shadow-lg bg-gradient-to-r",
                    activeSession.is_historical ? "from-slate-100 to-slate-200" : "from-primary/10 to-indigo-500/10"
                )}>
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <Badge className={cn("mb-2", activeSession.is_historical ? "bg-slate-500" : "bg-green-500")}>
                                {activeSession.is_historical ? "SESIÓN FINALIZADA (HISTORIAL)" : "SESIÓN ACTIVA"}
                            </Badge>
                            <h2 className="text-3xl font-extrabold text-primary">
                                {activeSession.is_historical ? activeSession.activity_data?.title : `Código: ${activeSession.code}`}
                            </h2>
                            {!activeSession.is_historical && (
                                <p className="text-muted-foreground">Estudiantes se unen en <span className="font-semibold underline">/join</span></p>
                            )}
                            {activeSession.expires_at && !activeSession.is_historical && (
                                <div className="flex items-center gap-2 text-orange-600 font-bold mt-2">
                                    <Timer className="h-4 w-4" />
                                    Tiempo restante: {timeLeft}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            {!activeSession.is_historical && (
                                <div className="flex items-center space-x-2 bg-white/50 p-2 rounded-lg border">
                                    <Switch
                                        id="show-results"
                                        checked={activeSession.show_results}
                                        onCheckedChange={handleToggleResults}
                                    />
                                    <Label htmlFor="show-results" className="text-xs font-bold cursor-pointer flex items-center gap-2">
                                        {activeSession.show_results ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                                        Ver resultados al finalizar
                                    </Label>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button onClick={handleExportExcel} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
                                    <Download className="h-4 w-4" /> Exportar a Excel
                                </Button>
                                {activeSession.is_historical ? (
                                    <Button onClick={() => setActiveSession(null)} variant="outline" className="gap-2 border-2">
                                        <ArrowLeft className="h-4 w-4" /> Volver al Panel
                                    </Button>
                                ) : (
                                    <>
                                        <Button onClick={copyCode} variant="outline" className="gap-2 border-2">
                                            <Copy className="h-4 w-4" /> Copiar Código
                                        </Button>
                                        <Button onClick={() => handleCloseSession()} variant="destructive" className="gap-2 shadow-lg px-8">
                                            <StopCircle className="h-4 w-4" /> Finalizar Sesión
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="border-none shadow-sm md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Participantes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-5xl font-black text-primary">{results.length}</p>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Estudiantes {activeSession.is_historical ? "que participaron" : "conectados ahora"}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm md:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Resultados por Estudiante</CardTitle>
                            {!activeSession.is_historical && (
                                <RefreshCcw className="h-4 w-4 text-muted-foreground hover:rotate-180 transition-transform cursor-pointer" />
                            )}
                        </CardHeader>
                        <CardContent className="pt-6">
                            {results.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
                                    <div className="p-4 bg-slate-50 rounded-full">
                                        <Users className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <p className="font-medium">No hay participaciones aún.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-1">
                                    {results.map((participant) => {
                                        const correctCount = getStudentScore(participant.session_responses)
                                        const totalQuestions = activityQuestions.length
                                        const grade = calculateGrade(correctCount, totalQuestions)
                                        const isFailing = parseFloat(grade) < 3.0

                                        return (
                                            <div key={participant.id} className="flex items-center justify-between p-5 rounded-2xl border bg-card hover:border-primary/50 transition-all shadow-sm group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                                                        <span className="text-lg font-black">{participant.student_name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-bold text-slate-800">
                                                            {participant.student_name}
                                                            <span className="text-muted-foreground ml-1 font-normal">({participant.student_code || '---'})</span>
                                                        </p>
                                                        <div className="flex gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[10px] font-bold">
                                                                {participant.session_responses?.length || 0} / {totalQuestions} respondidas
                                                            </Badge>
                                                            {(participant.session_responses?.length === totalQuestions || activeSession.is_historical) && (
                                                                <Badge className="text-[10px] font-bold bg-green-500">COMPLETADO</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-10">
                                                    <div className="text-right flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Aciertos</p>
                                                            <p className="text-sm font-bold text-slate-600">{correctCount} <span className="text-slate-300">/ {totalQuestions}</span></p>
                                                        </div>
                                                        <div className="text-right px-4 py-1.5 rounded-xl bg-slate-50 border">
                                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Nota</p>
                                                            <p className={cn(
                                                                "text-2xl font-black",
                                                                isFailing ? "text-red-500" : "text-green-600"
                                                            )}>{grade}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedStudent(participant)} className="rounded-xl border-2 hover:bg-primary hover:text-white hover:border-primary transition-all gap-2">
                                                        <Search className="h-3.5 w-3.5" /> Ver Detalle
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Modal de Detalle Estudiante */}
                <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
                        <DialogHeader className="p-6 bg-slate-900 text-white flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-black">{selectedStudent?.student_name}</DialogTitle>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-primary/20 text-primary border-primary/30 h-5 text-[10px] font-black tracking-widest uppercase">
                                        Examen: {activeSession.activity_data?.title}
                                    </Badge>
                                    <Badge variant="outline" className="text-white border-white/20 h-5 text-[10px] font-bold">
                                        Código: {selectedStudent?.student_code || '---'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-4xl font-black text-white/40">
                                        {getStudentScore(selectedStudent?.session_responses)}
                                        <span className="text-base ml-1">/ {activityQuestions.length}</span>
                                    </div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Correctas</p>
                                </div>
                                <div className="text-right bg-white/10 p-3 rounded-2xl">
                                    <div className={cn(
                                        "text-5xl font-black",
                                        parseFloat(calculateGrade(getStudentScore(selectedStudent?.session_responses), activityQuestions.length)) < 3.0 ? "text-red-400" : "text-green-400"
                                    )}>
                                        {calculateGrade(getStudentScore(selectedStudent?.session_responses), activityQuestions.length)}
                                    </div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Nota Final</p>
                                </div>
                            </div>
                        </DialogHeader>

                        <ScrollArea className="flex-1 p-6 bg-slate-50">
                            <div className="space-y-6">
                                {activityQuestions.map((q: any, idx: number) => {
                                    const studentAnswer = selectedStudent?.session_responses?.find((r: any) => r.question_id === q.id)
                                    const isCorrect = studentAnswer?.answer === q.correctAnswer
                                    const hasAnswered = !!studentAnswer

                                    return (
                                        <Card key={q.id} className={cn(
                                            "border shadow-sm overflow-hidden rounded-2xl",
                                            hasAnswered ? (isCorrect ? "border-green-200" : "border-red-200") : "border-slate-200"
                                        )}>
                                            <div className={cn(
                                                "px-4 py-2 text-[10px] font-black uppercase tracking-widest flex justify-between",
                                                hasAnswered ? (isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700") : "bg-slate-100 text-slate-500"
                                            )}>
                                                <span>Pregunta {idx + 1}</span>
                                                {hasAnswered ? (isCorrect ? "Correcto (+1)" : "Incorrecto (0)") : "Sin responder"}
                                            </div>
                                            <CardContent className="p-6 space-y-4">
                                                <p className="text-lg font-bold text-slate-800">{q.text}</p>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {q.options.filter((o: string) => o !== "").map((opt: string, optIdx: number) => {
                                                        const isStudentAnswer = studentAnswer?.answer === opt
                                                        const isRealCorrect = q.correctAnswer === opt

                                                        return (
                                                            <div key={optIdx} className={cn(
                                                                "p-3 rounded-xl border-2 text-sm font-bold flex items-center justify-between",
                                                                isStudentAnswer ? (isCorrect ? "border-green-500 bg-green-50 text-green-800" : "border-red-500 bg-red-50 text-red-800") : (isRealCorrect ? "border-green-200 bg-green-50/30 text-green-600 border-dashed" : "border-slate-100 bg-white text-slate-400 opacity-60")
                                                            )}>
                                                                <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                                                {isStudentAnswer && (isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />)}
                                                                {!isStudentAnswer && isRealCorrect && <Check className="h-3 w-3" />}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                        <div className="p-4 bg-white border-t flex justify-end">
                            <Button onClick={() => setSelectedStudent(null)} className="rounded-xl px-8 font-bold">Cerrar Detalle</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestión de Actividades</h2>
                    <p className="text-muted-foreground">Inicia sesiones en vivo y consulta el historial de resultados.</p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-lg rounded-xl h-11">
                            <Plus className="h-5 w-5" /> Crear Nueva Actividad
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                        {/* Formulario de creación (sin cambios) */}
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Crear Nueva Actividad</DialogTitle>
                            <CardDescription>Configura los detalles, tipo de preguntas y respuestas correctas.</CardDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input id="title" placeholder="Ej: Examen Unidad 1" value={newActivity.title} onChange={e => setNewActivity(prev => ({ ...prev, title: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course">Curso</Label>
                                    <Select value={newActivity.courseId} onValueChange={val => setNewActivity(prev => ({ ...prev, courseId: val }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un curso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="period">Periodo</Label>
                                    <Select value={newActivity.periodId} onValueChange={val => setNewActivity(prev => ({ ...prev, periodId: val }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un periodo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {periods.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">Descripción</Label>
                                    <Input id="desc" value={newActivity.description} onChange={e => setNewActivity(prev => ({ ...prev, description: e.target.value }))} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg font-bold">Preguntas</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-2">
                                        <Plus className="h-4 w-4" /> Agregar Pregunta
                                    </Button>
                                </div>

                                {newActivity.questions.map((q, idx) => (
                                    <Card key={q.id} className="relative border shadow-sm group">
                                        <CardHeader className="py-2 flex flex-row items-center justify-between bg-slate-50/50">
                                            <div className="flex items-center gap-4">
                                                <CardTitle className="text-sm font-semibold">Pregunta {idx + 1}</CardTitle>
                                                <Select value={q.type} onValueChange={val => updateQuestion(q.id, { type: val })}>
                                                    <SelectTrigger className="h-7 text-[10px] w-32 bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="multiple">Opción Múltiple</SelectItem>
                                                        <SelectItem value="boolean">Verdadero/Falso</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeQuestion(q.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label>Enunciado</Label>
                                                <Textarea placeholder="Escribe aquí la pregunta..." value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })} className="min-h-[60px]" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Opciones (marca la correcta)</Label>
                                                <RadioGroup
                                                    value={q.correctAnswer}
                                                    onValueChange={val => updateQuestion(q.id, { correctAnswer: val })}
                                                    className="grid grid-cols-2 gap-3"
                                                >
                                                    {q.options.map((opt, optIdx) => (
                                                        <div key={optIdx} className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${q.correctAnswer === opt && opt !== "" ? 'border-green-500 bg-green-50' : 'border-slate-100'}`}>
                                                            <RadioGroupItem value={opt} id={`q-${q.id}-opt-${optIdx}`} disabled={opt === ""} />
                                                            <Input
                                                                placeholder={`Opción ${String.fromCharCode(65 + optIdx)}`}
                                                                value={opt}
                                                                onChange={e => updateOption(q.id, optIdx, e.target.value)}
                                                                className="h-8 text-sm bg-white border-none shadow-none focus-visible:ring-0 px-0"
                                                                disabled={q.type === 'boolean'}
                                                            />
                                                            {q.correctAnswer === opt && opt !== "" && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button disabled={isSubmitting} onClick={handleCreateActivity}>
                                {isSubmitting ? "Creando..." : "Guardar Actividad"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="activities" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-xl h-12 mb-6">
                    <TabsTrigger value="activities" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Play className="h-4 w-4" /> Actividades Disponibles
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <History className="h-4 w-4" /> Historial de Sesiones
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="activities">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activities.map((activity) => (
                            <Card key={activity.id} className="group border shadow-md hover:shadow-xl transition-all relative overflow-hidden rounded-[1.5rem] bg-white border-slate-100">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border-none px-2">
                                            {courseIdToName(activity.course_id)}
                                        </Badge>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => handleDeleteActivity(activity.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg font-black text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{activity.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-slate-500 font-medium text-xs leading-relaxed">{activity.description || 'Sin descripción detallada'}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Preguntas</span>
                                            <span className="text-base font-black text-slate-700">{activity.questions?.length || 0}</span>
                                        </div>
                                        <Button onClick={() => handleOpenStartSession(activity.id)} className="rounded-xl px-5 font-black shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95 gap-2 h-10">
                                            <Play className="h-3 w-3 fill-current" /> Iniciar Sesión
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="grid gap-4">
                        {pastSessions.map((session) => (
                            <Card key={session.id} className="border shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white group border-slate-100">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex flex-col items-center justify-center border group-hover:bg-slate-900 group-hover:text-white transition-all">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left space-y-1">
                                            <h3 className="text-lg font-black text-slate-800">{session.activities?.title}</h3>
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                    <TrendingUp className="h-3 w-3" />
                                                    Completada el {new Date(session.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                    <Copy className="h-3 w-3" />
                                                    Código: {session.code}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="rounded-xl border-2 font-bold px-6 gap-2" onClick={() => handleViewHistoricalResults(session)}>
                                                <Search className="h-4 w-4" /> Ver Resultados
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Modal para configurar inicio de sesión */}
            <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
                <DialogContent className="max-w-md border-none shadow-2xl rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Iniciar Sesión</DialogTitle>
                        <CardDescription className="text-slate-500 font-medium">Configura el límite de tiempo para esta actividad.</CardDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Duración del Examen</Label>
                            <Select value={sessionConfig.duration} onValueChange={val => setSessionConfig(prev => ({ ...prev, duration: val }))}>
                                <SelectTrigger className="h-14 text-lg font-bold rounded-2xl border-2 focus:ring-primary/20">
                                    <SelectValue placeholder="Sin límite de tiempo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="0" className="font-bold py-3">Sin límite de tiempo</SelectItem>
                                    <SelectItem value="3" className="font-bold py-3">Límite de 3 Minutos</SelectItem>
                                    <SelectItem value="5" className="font-bold py-3">Límite de 5 Minutos</SelectItem>
                                    <SelectItem value="10" className="font-bold py-3">Límite de 10 Minutos</SelectItem>
                                    <SelectItem value="30" className="font-bold py-3">Límite de 30 Minutos</SelectItem>
                                    <SelectItem value="60" className="font-bold py-3">Límite de 1 Hora</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsStartModalOpen(false)} className="rounded-xl h-12 font-bold">Cancelar</Button>
                        <Button onClick={handleStartSession} className="rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                            Iniciar Clase Ahora <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )

    function courseIdToName(id: string) {
        return courses.find(c => c.id === id)?.name || "Sin curso"
    }
}
