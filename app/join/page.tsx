"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GraduationCap, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { fetchSessionByCode, joinSession } from "@/lib/session-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function JoinSessionPage() {
    const [code, setCode] = useState("")
    const [studentCode, setStudentCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState(1) // 1: Session Code, 2: Student Code
    const [session, setSession] = useState<any>(null)

    const router = useRouter()

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code) return

        setLoading(true)
        setError(null)

        try {
            const activeSession = await fetchSessionByCode(code)
            if (activeSession) {
                setSession(activeSession)
                setStep(2)
            } else {
                setError("Opps! Ese código de actividad no es válido o ya finalizó.")
            }
        } catch (err) {
            setError("Algo salió mal al buscar la sesión. Inténtalo de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!studentCode || !session) return

        setLoading(true)
        setError(null)

        try {
            // Importamos esto dinámicamente o nos aseguramos que esté en el service
            const { fetchStudentByCode } = await import("@/lib/session-service")
            const student = await fetchStudentByCode(studentCode)

            if (!student) {
                setError("El código de estudiante no existe. Verifica con tu docente.")
                setLoading(false)
                return
            }

            // Opcional: Validar que el estudiante pertenezca al curso de la actividad
            if (session.activities?.course_id && student.course_id !== session.activities.course_id) {
                setError("Este código de estudiante no pertenece al curso asignado a esta actividad.")
                setLoading(false)
                return
            }

            const fullName = `${student.first_name} ${student.last_name}`
            const participant = await joinSession(session.id, fullName, student.id, student.student_code)

            localStorage.setItem(`session_${session.code}_participant`, JSON.stringify(participant))
            router.push(`/join/${session.code}`)
        } catch (err) {
            setError("Error inesperado al intentar unirse.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden rounded-[2rem]">
                <div className="h-2 bg-primary"></div>
                <CardHeader className="text-center space-y-2 pb-8 pt-10">
                    <div className="flex justify-center mb-6">
                        <div className="bg-primary p-4 rounded-3xl shadow-xl rotate-12 transition-transform hover:rotate-0">
                            <GraduationCap className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black text-slate-800 tracking-tight">
                        {step === 1 ? "Entrar a Clase" : "Identifícate"}
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium px-6">
                        {step === 1
                            ? "Ingresa el código de 6 dígitos que te dio tu docente para comenzar."
                            : `Actividad: ${session?.activities?.title}`}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-10">
                    {error && (
                        <Alert variant="destructive" className="mb-6 rounded-2xl border-2 bg-red-50 text-red-900 border-red-100">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="font-bold">{error}</AlertDescription>
                        </Alert>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Código de Actividad</Label>
                                <Input
                                    placeholder="ABC123"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="text-center text-3xl font-black tracking-[0.2em] h-16 border-2 border-slate-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all uppercase"
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <>Validar Código <ArrowRight className="h-5 w-5" /></>}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleJoin} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tu Código de Estudiante</Label>
                                <Input
                                    placeholder="Ej: jpe101"
                                    value={studentCode}
                                    onChange={(e) => setStudentCode(e.target.value.toLowerCase())}
                                    className="h-14 text-xl font-bold rounded-2xl border-2 border-slate-100 focus:border-primary text-center"
                                    required
                                    autoFocus
                                />
                                <p className="text-[10px] text-slate-400 text-center font-medium">Usa tus iniciales y el número de tu grado (ej: jpe101)</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : "¡Empezar Actividad!"}
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-12 font-bold text-slate-400 hover:text-slate-600 rounded-xl">
                                    Corregir código de actividad
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            <div className="fixed bottom-8 text-center text-gray-400 text-sm">
                EduGestión &copy; {new Date().getFullYear()} • Plataforma Académica
            </div>
        </div>
    )
}
