"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Loader2,
    CheckCircle2,
    Send,
    AlertTriangle,
    ChevronRight,
    ChevronLeft,
    Trophy,
    XCircle,
    Clock,
    User,
    Hash,
    Timer,
    AlertCircle
} from "lucide-react"
import { fetchSessionByCode, submitResponse } from "@/lib/session-service"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ActivitySessionPage() {
    const params = useParams()
    const router = useRouter()
    const code = params.code as string

    const [session, setSession] = useState<any>(null)
    const [participant, setParticipant] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [score, setScore] = useState<{ correct: number, total: number } | null>(null)

    // Timer state
    const [timeLeft, setTimeLeft] = useState<string | null>(null)
    const [isExpired, setIsExpired] = useState(false)
    const answersRef = useRef(answers)

    // Sync ref with state for auto-submit
    useEffect(() => {
        answersRef.current = answers
    }, [answers])

    useEffect(() => {
        async function init() {
            const participantInfo = localStorage.getItem(`session_${code}_participant`)
            if (!participantInfo) {
                router.push("/join")
                return
            }

            setParticipant(JSON.parse(participantInfo))

            try {
                const sessionData = await fetchSessionByCode(code)
                if (sessionData) {
                    // Verificar si ya expiró antes de empezar
                    if (sessionData.expires_at) {
                        const now = new Date().getTime()
                        const expiry = new Date(sessionData.expires_at).getTime()
                        if (expiry <= now) {
                            setIsExpired(true)
                            setCompleted(true)
                            setLoading(false)
                            return
                        }
                    }
                    setSession(sessionData)
                } else {
                    toast.error("La sesión ya no está activa")
                    router.push("/join")
                }
            } catch (err) {
                toast.error("Error al cargar la actividad")
            } finally {
                setLoading(false)
            }
        }

        init()
    }, [code, router])

    // Timer Logic
    useEffect(() => {
        if (!session?.expires_at || completed) return

        const timerInterval = setInterval(() => {
            const now = new Date().getTime()
            const expiry = new Date(session.expires_at).getTime()
            const diff = expiry - now

            if (diff <= 0) {
                clearInterval(timerInterval)
                setTimeLeft("0:00")
                if (!completed && !submitting) {
                    handleAutoSubmit()
                }
            } else {
                const mins = Math.floor(diff / 60000)
                const secs = Math.floor((diff % 60000) / 1000)
                setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`)

                // Color warn logic
                if (diff < 30000 && diff > 0) { // last 30 seconds
                    // You could add a state to pulse the timer
                }
            }
        }, 1000)

        return () => clearInterval(timerInterval)
    }, [session, completed, submitting])

    const questions = session?.activities?.questions || []
    const currentQuestion = questions[currentQuestionIndex]
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

    const handleNext = () => {
        const answer = answers[currentQuestion.id]
        if (!answer) {
            toast.warning("Por favor selecciona una respuesta")
            return
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            handleSubmitAll()
        }
    }

    const handleAutoSubmit = async () => {
        setIsExpired(true)
        toast.error("¡Tiempo agotado! Enviando tus respuestas actuales...", { duration: 5000 })
        await handleSubmitAll(true)
    }

    const handleSubmitAll = async (isAuto = false) => {
        setSubmitting(true)
        try {
            const currentAnswers = isAuto ? answersRef.current : answers

            // Calcular puntaje localmente para mostrar al final
            let correctCount = 0
            questions.forEach((q: any) => {
                if (currentAnswers[q.id] === q.correctAnswer) {
                    correctCount++
                }
            })
            setScore({ correct: correctCount, total: questions.length })

            // Enviar cada respuesta (incluyendo vacías si es auto-submit)
            const promises = questions.map((q: any) => {
                const answer = currentAnswers[q.id] || ""
                const isCorrect = q.correctAnswer === answer

                return submitResponse({
                    session_id: session.id,
                    participant_id: participant.id,
                    question_id: q.id,
                    answer: answer,
                    score: isCorrect ? 1 : 0
                })
            })

            await Promise.all(promises)

            // 🔥 SINCRONIZACIÓN AUTOMÁTICA DE NOTAS
            if (participant.student_id && session.activities) {
                try {
                    const { createActivityGrade } = await import("@/lib/grades-service")
                    const finalGradeValue = calculateGrade(correctCount, questions.length)

                    await createActivityGrade({
                        activityId: session.activities.id,
                        studentId: participant.student_id,
                        value: parseFloat(finalGradeValue)
                    })
                    console.log("Nota sincronizada automáticamente en activity_grades")
                } catch (gradeError: any) {
                    console.error("Error al sincronizar nota:", gradeError?.message || gradeError)
                }
            }

            setCompleted(true)
            localStorage.removeItem(`session_${code}_participant`)
            if (!isAuto) toast.success("¡Examen enviado con éxito!")
        } catch (err) {
            console.error("Error submitting:", err)
            toast.error("Hubo un problema al enviar tus respuestas")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="text-center space-y-6 animate-pulse">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <Loader2 className="h-20 w-20 text-primary animate-spin" />
                    </div>
                    <p className="text-slate-600 font-medium text-lg">Preparando tu experiencia...</p>
                </div>
            </div>
        )
    }

    const calculateGrade = (correct: number, total: number) => {
        if (total === 0) return "0.0"
        return ((correct / total) * 5).toFixed(1)
    }

    if (completed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <Card className="w-full max-w-lg overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white/80 backdrop-blur-xl">
                    <div className={cn("h-3 bg-gradient-to-r", isExpired && !score ? "from-red-400 to-orange-500" : "from-green-400 to-emerald-500")}></div>
                    <CardContent className="p-10 text-center space-y-8">
                        {isExpired && !score ? (
                            <div className="space-y-6">
                                <AlertCircle className="h-24 w-24 text-red-500 mx-auto animate-bounce" />
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tiempo Agotado</h2>
                                    <p className="text-slate-500 font-medium">Esta sesión ha terminado y ya no acepta más respuestas.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-green-200 blur-2xl rounded-full opacity-50 scale-150 animate-pulse"></div>
                                    <CheckCircle2 className="h-24 w-24 text-green-500 relative animate-in zoom-in duration-500" />
                                </div>

                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">¡Misión Cumplida!</h2>
                                    <p className="text-slate-500 font-medium">
                                        Excelente trabajo, <span className="text-primary font-bold">{participant.student_name}</span>.
                                        {isExpired ? " Tu tiempo se agotó, pero tus respuestas han sido enviadas." : " Tus respuestas han sido procesadas."}
                                    </p>
                                </div>

                                {session?.show_results && score && (
                                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-inner space-y-4">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Tu Resultado Final</p>
                                        <div className="flex items-center justify-center gap-10">
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Aciertos</p>
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <span className="text-4xl font-black text-slate-900">{score.correct}</span>
                                                    <span className="text-lg font-bold text-slate-300">/ {score.total}</span>
                                                </div>
                                            </div>
                                            <div className="h-12 w-px bg-slate-200"></div>
                                            <div className="text-center bg-white px-6 py-3 rounded-2xl shadow-sm border">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Tu Nota</p>
                                                <div className="text-5xl font-black text-primary">
                                                    {calculateGrade(score.correct, score.total)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-1000"
                                                    style={{ width: `${(score.correct / score.total) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-600">
                                            {score.correct === score.total ? "¡Perfecto! 🌟" : score.correct >= score.total / 2 ? "¡Muy bien! 👍" : "¡Sigue practicando! 💪"}
                                        </p>
                                    </div>
                                )}

                                {(!session?.show_results || !score) && (
                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-center gap-3 text-left">
                                        <Clock className="h-5 w-5 text-blue-500 shrink-0" />
                                        <p className="text-sm text-blue-700 font-medium">Espera a que tu docente publique los resultados finales.</p>
                                    </div>
                                )}
                            </>
                        )}

                        <Button onClick={() => router.push("/join")} className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
                            Salir
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white/70 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary p-2 rounded-lg">
                                <Hash className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-slate-800">{code}</span>
                        </div>
                        {timeLeft && (
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-full border-2 font-black text-sm transition-all",
                                timeLeft.startsWith("0:") && parseInt(timeLeft.split(":")[1]) < 30
                                    ? "border-red-500 bg-red-50 text-red-600 animate-pulse"
                                    : "border-orange-200 bg-orange-50 text-orange-600"
                            )}>
                                <Timer className="h-4 w-4" />
                                {timeLeft}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Estudiante</p>
                            <p className="text-xs font-bold text-slate-700">{participant.student_name}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border">
                            <User className="h-4 w-4 text-slate-500" />
                        </div>
                    </div>
                </div>
                <div className="w-full bg-slate-100 h-1">
                    <div
                        className="bg-primary h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 space-y-8">
                {/* Question Info */}
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{session?.activities?.title}</h1>
                        <p className="text-slate-500 font-medium">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
                    </div>
                </div>

                {/* Question Card */}
                {currentQuestion && (
                    <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.04)] bg-white p-8 md:p-12 rounded-[2rem]">
                            <CardHeader className="p-0 mb-8">
                                <CardTitle className="text-2xl md:text-3xl font-bold leading-tight text-slate-800">
                                    {currentQuestion.text}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-0 space-y-8">
                                <RadioGroup
                                    value={answers[currentQuestion.id] || ""}
                                    onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))}
                                    className="grid gap-4"
                                >
                                    {currentQuestion.options?.filter((o: string) => o !== "").map((option: string, index: number) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "group flex items-center space-x-4 p-6 rounded-2xl border-2 transition-all cursor-pointer",
                                                answers[currentQuestion.id] === option
                                                    ? 'border-primary bg-blue-50/50 shadow-md ring-4 ring-primary/5'
                                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                                            )}
                                            onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }))}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
                                                answers[currentQuestion.id] === option
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-slate-200 text-slate-400 group-hover:border-slate-300'
                                            )}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <RadioGroupItem value={option} id={`q-${index}`} className="sr-only" />
                                            <Label htmlFor={`q-${index}`} className="flex-1 cursor-pointer text-lg font-bold text-slate-700 select-none">
                                                {option}
                                            </Label>
                                            {answers[currentQuestion.id] === option && (
                                                <div className="bg-primary text-white p-1 rounded-full animate-in zoom-in">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </RadioGroup>

                                <div className="pt-8 flex justify-between items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        disabled={currentQuestionIndex === 0}
                                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                        className="rounded-xl h-12 px-6 font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                        <ChevronLeft className="mr-2 h-5 w-5" /> Anterior
                                    </Button>

                                    <Button
                                        className="rounded-xl h-14 px-10 text-lg font-bold shadow-xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        onClick={handleNext}
                                        disabled={submitting}
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : (
                                            currentQuestionIndex === questions.length - 1 ?
                                                <>Enviar Examen <Send className="ml-2 h-5 w-5" /></> :
                                                <>Siguiente <ChevronRight className="ml-2 h-5 w-5" /></>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
