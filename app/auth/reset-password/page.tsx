"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updatePassword } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    // Verificar si hay un token de recuperación en la URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const type = hashParams.get('type')
    const accessToken = hashParams.get('access_token')

    if (type === 'recovery' && accessToken) {
      setValidToken(true)
    } else {
      setError('Enlace inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.')
    }
  }, [])

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres"
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "La contraseña debe contener al menos una letra minúscula"
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "La contraseña debe contener al menos una letra mayúscula"
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return "La contraseña debe contener al menos un número"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    // Validar fortaleza de la contraseña
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    try {
      await updatePassword(password)
      setSuccess(true)
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err: any) {
      console.error("Password update error:", err)
      setError(err.message || "Error al actualizar la contraseña. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (!validToken && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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

        {/* Card de nueva contraseña */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Nueva Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
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
                <Alert className="border-green-500 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    ¡Contraseña actualizada! Redirigiendo al login...
                  </AlertDescription>
                </Alert>
              )}

              {!success && validToken && (
                <>
                  {/* Nueva contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingresa tu nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirma tu nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Requisitos de contraseña */}
                  <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
                    <p className="font-semibold mb-1">La contraseña debe contener:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li className={password.length >= 8 ? "text-green-600 dark:text-green-400" : ""}>
                        Mínimo 8 caracteres
                      </li>
                      <li className={/(?=.*[a-z])/.test(password) ? "text-green-600 dark:text-green-400" : ""}>
                        Al menos una letra minúscula
                      </li>
                      <li className={/(?=.*[A-Z])/.test(password) ? "text-green-600 dark:text-green-400" : ""}>
                        Al menos una letra mayúscula
                      </li>
                      <li className={/(?=.*\d)/.test(password) ? "text-green-600 dark:text-green-400" : ""}>
                        Al menos un número
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter>
              {!success && validToken && (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Restablecer Contraseña"
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          © 2026 EduGestión. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}