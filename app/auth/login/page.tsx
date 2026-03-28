"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Loader2, AlertCircle, Eye, EyeOff, LogIn } from "lucide-react"
import { AuthLoadingModal } from "@/components/auth/auth-loading-modal"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("🔵 Intentando iniciar sesión...")

      await signIn(email, password)

      console.log("✅ Login exitoso!")

      // El loading modal seguirá visible durante la redirección
      window.location.href = '/dashboardd'

    } catch (err: any) {
      console.error("❌ Error de login:", err)

      let errorMessage = "Error al iniciar sesión. Por favor, intenta de nuevo."

      if (err.message?.includes("Invalid login credentials")) {
        errorMessage = "Correo electrónico o contraseña incorrectos"
      } else if (err.message?.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirma tu correo electrónico antes de iniciar sesión"
      } else if (err.message?.includes("Invalid email")) {
        errorMessage = "Correo electrónico inválido"
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <>
      {/* Modal de carga */}
      <AuthLoadingModal isOpen={loading} type="login" />

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
              SIED Pro
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema Institucional Educativo Docente
            </p>
          </div>

          {/* Card de login */}
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder a tu cuenta
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      tabIndex={-1}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={loading}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Recordarme
                    </label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                    tabIndex={loading ? -1 : 0}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      ¿Eres estudiante?
                    </span>
                  </div>
                </div>

                <Button variant="outline" type="button" className="w-full border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5" asChild>
                  <Link href="/join">
                    <GraduationCap className="mr-2 h-4 w-4 text-primary" />
                    Unirse a clase con código
                  </Link>
                </Button>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/auth/register"
                    className="text-primary font-medium hover:underline"
                    tabIndex={loading ? -1 : 0}
                  >
                    Regístrate aquí
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            © 2026 SIED Pro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </>
  )
}