"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GraduationCap, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Limpiar error al escribir
    if (error) setError("")
  }

  const validateForm = (): string | null => {
    // Validar nombre
    if (!formData.firstName.trim()) {
      return "El nombre es requerido"
    }
    
    // Validar apellido
    if (!formData.lastName.trim()) {
      return "El apellido es requerido"
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return "Por favor, ingresa un correo electrónico válido"
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres"
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      return "Las contraseñas no coinciden"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    // Validar formulario
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      console.log("Intentando registrar usuario:", {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      const result = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )

      console.log("Resultado del registro:", result)

      setSuccess(true)
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/dashboardd")
      }, 2000)
    } catch (err: any) {
      console.error("Error completo de registro:", err)
      console.error("Mensaje de error:", err.message)
      console.error("Código de error:", err.code)
      console.error("Detalles del error:", err.details)

      // Manejo específico de errores
      let errorMessage = "Error al crear la cuenta. Por favor, intenta de nuevo."

      if (err.message) {
        if (err.message.includes("User already registered")) {
          errorMessage = "Este correo electrónico ya está registrado. Por favor, inicia sesión."
        } else if (err.message.includes("Invalid email")) {
          errorMessage = "El correo electrónico no es válido"
        } else if (err.message.includes("Password should be at least 6 characters")) {
          errorMessage = "La contraseña debe tener al menos 6 caracteres"
        } else if (err.message.includes("Email rate limit exceeded")) {
          errorMessage = "Demasiados intentos. Por favor, espera unos minutos e intenta de nuevo"
        } else if (err.message.includes("Unable to validate email address")) {
          errorMessage = "No se pudo validar el correo electrónico. Verifica que sea correcto"
        } else if (err.message.includes("Signup requires a valid password")) {
          errorMessage = "Se requiere una contraseña válida"
        } else {
          // Mostrar el mensaje de error real para debugging
          errorMessage = `Error: ${err.message}`
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Calcular fuerza de la contraseña
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" }
    
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    if (strength <= 1) return { strength, label: "Débil", color: "text-red-500" }
    if (strength <= 3) return { strength, label: "Media", color: "text-yellow-500" }
    return { strength, label: "Fuerte", color: "text-green-500" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

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

        {/* Card de registro */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
            <CardDescription>
              Completa el formulario para registrarte
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>¡Éxito!</AlertTitle>
                  <AlertDescription>
                    Cuenta creada exitosamente. Redirigiendo al dashboard...
                  </AlertDescription>
                </Alert>
              )}

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Apellido <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Pérez"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Correo Electrónico <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <p className={`text-xs ${passwordStrength.color}`}>
                    Contraseña {passwordStrength.label}
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmar Contraseña <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading || success}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary font-medium hover:underline"
                >
                  Inicia sesión aquí
                </Link>
              </div>
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