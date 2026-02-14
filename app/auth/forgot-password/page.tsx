"use client"

import { useState } from "react"
import Link from "next/link"
import { resetPassword } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido")
      setLoading(false)
      return
    }

    try {
      await resetPassword(email)
      setSuccess(true)
      setEmail("") // Limpiar el email después de enviar
    } catch (err: any) {
      console.error("Password reset error:", err)
      
      // Manejar diferentes tipos de errores
      if (err.message?.includes("not found")) {
        setError("No se encontró una cuenta con este correo electrónico")
      } else if (err.message?.includes("rate limit")) {
        setError("Demasiados intentos. Por favor, espera unos minutos e intenta de nuevo")
      } else {
        setError("Error al enviar el correo. Por favor, intenta de nuevo más tarde")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg">
              <GraduationCap className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            EduGestión
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plataforma de Gestión Docente
          </p>
        </div>

        {/* Card de recuperación */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">¡Correo enviado exitosamente!</p>
                      <p className="text-sm">
                        Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Si no ves el correo, revisa tu carpeta de spam.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!success && (
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa el correo electrónico asociado a tu cuenta
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              {!success && (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando correo...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Enlace de Recuperación
                    </>
                  )}
                </Button>
              )}

              <Link href="/auth/login" className="w-full">
                <Button type="button" variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Login
                </Button>
              </Link>

              {success && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                  }}
                >
                  ¿No recibiste el correo? Reenviar
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>

        {/* Información adicional */}
        {!success && (
          <Card className="mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">¿Problemas para recuperar tu cuenta?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Verifica que el correo sea el correcto</li>
                    <li>• Revisa tu carpeta de spam</li>
                    <li>• El enlace expira después de 1 hora</li>
                    <li>• Puedes solicitar un nuevo enlace si es necesario</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          © 2026 EduGestión. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}