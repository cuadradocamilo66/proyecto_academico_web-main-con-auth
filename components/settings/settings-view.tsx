"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Bell, Palette, Save, Loader2 } from "lucide-react"
import {
  fetchUserSettings,
  updateProfileInfo,
  updateNotificationSettings,
  updateAppearanceSettings,
  type UserSettings
} from "@/lib/settings-service"
import { useToast } from "@/hooks/use-toast"

export function SettingsView() {
  const { toast } = useToast()
  const { data: settings, mutate } = useSWR<UserSettings | null>("user-settings", fetchUserSettings)

  // Estado del formulario de perfil
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    institution: ""
  })

  // Estado de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    notify_low_performance: true,
    notify_planning_reminders: true,
    notify_email_summaries: false
  })

  // Estado de apariencia
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [language, setLanguage] = useState<'es' | 'en'>('es')

  // Estados de carga
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [isSavingAppearance, setIsSavingAppearance] = useState(false)

  // Cargar configuración cuando esté disponible
  useEffect(() => {
    if (settings) {
      setProfileForm({
        full_name: settings.full_name || "",
        email: settings.email || "",
        phone: settings.phone || "",
        institution: settings.institution || ""
      })

      setNotificationSettings({
        notify_low_performance: settings.notify_low_performance,
        notify_planning_reminders: settings.notify_planning_reminders,
        notify_email_summaries: settings.notify_email_summaries
      })

      setTheme(settings.theme)
      setLanguage(settings.language)
    }
  }, [settings])

  // Guardar información de perfil
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      await updateProfileInfo(profileForm)
      await mutate()
      toast({
        title: "Perfil actualizado",
        description: "Tu información personal se guardó correctamente",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil",
        variant: "destructive",
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Actualizar notificación individual
  const handleNotificationToggle = async (key: keyof typeof notificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value }
    setNotificationSettings(newSettings)

    setIsSavingNotifications(true)
    try {
      await updateNotificationSettings({ [key]: value })
      await mutate()
      toast({
        title: "Notificación actualizada",
        description: "Tus preferencias de notificaciones se guardaron",
      })
    } catch (error) {
      console.error(error)
      // Revertir en caso de error
      setNotificationSettings(notificationSettings)
      toast({
        title: "Error",
        description: "No se pudo actualizar la notificación",
        variant: "destructive",
      })
    } finally {
      setIsSavingNotifications(false)
    }
  }

  // Actualizar tema
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)

    setIsSavingAppearance(true)
    try {
      await updateAppearanceSettings({ theme: newTheme })
      await mutate()
      
      // Aplicar el tema (puedes expandir esto con tu lógica de temas)
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (newTheme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        // System
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }

      toast({
        title: "Tema actualizado",
        description: "Tu preferencia de tema se guardó correctamente",
      })
    } catch (error) {
      console.error(error)
      setTheme(settings?.theme || 'light')
      toast({
        title: "Error",
        description: "No se pudo actualizar el tema",
        variant: "destructive",
      })
    } finally {
      setIsSavingAppearance(false)
    }
  }

  // Actualizar idioma
  const handleLanguageChange = async (newLanguage: 'es' | 'en') => {
    setLanguage(newLanguage)

    setIsSavingAppearance(true)
    try {
      await updateAppearanceSettings({ language: newLanguage })
      await mutate()
      toast({
        title: "Idioma actualizado",
        description: "Tu preferencia de idioma se guardó correctamente",
      })
    } catch (error) {
      console.error(error)
      setLanguage(settings?.language || 'es')
      toast({
        title: "Error",
        description: "No se pudo actualizar el idioma",
        variant: "destructive",
      })
    } finally {
      setIsSavingAppearance(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Información Personal</CardTitle>
          </div>
          <CardDescription>Actualiza tu información de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="tu@email.com"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+57 300 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institución</Label>
              <Input
                id="institution"
                value={profileForm.institution}
                onChange={(e) => setProfileForm({ ...profileForm, institution: e.target.value })}
                placeholder="Nombre de tu institución"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="gap-2"
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Notificaciones</CardTitle>
          </div>
          <CardDescription>Configura tus preferencias de notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <p className="font-medium text-sm">Alertas de bajo rendimiento</p>
              <p className="text-xs text-muted-foreground">
                Recibe alertas cuando un estudiante tenga promedio menor a 3.0
              </p>
            </div>
            <Switch
              checked={notificationSettings.notify_low_performance}
              onCheckedChange={(checked) => handleNotificationToggle('notify_low_performance', checked)}
              disabled={isSavingNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <p className="font-medium text-sm">Recordatorios de planeación</p>
              <p className="text-xs text-muted-foreground">
                Recibe recordatorios para completar tu planeación semanal
              </p>
            </div>
            <Switch
              checked={notificationSettings.notify_planning_reminders}
              onCheckedChange={(checked) => handleNotificationToggle('notify_planning_reminders', checked)}
              disabled={isSavingNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <p className="font-medium text-sm">Notificaciones por correo</p>
              <p className="text-xs text-muted-foreground">
                Recibe resúmenes semanales por correo electrónico
              </p>
            </div>
            <Switch
              checked={notificationSettings.notify_email_summaries}
              onCheckedChange={(checked) => handleNotificationToggle('notify_email_summaries', checked)}
              disabled={isSavingNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Apariencia</CardTitle>
          </div>
          <CardDescription>Personaliza la apariencia de la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select
              value={theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => handleThemeChange(value)}
              disabled={isSavingAppearance}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">☀️ Claro</SelectItem>
                <SelectItem value="dark">🌙 Oscuro</SelectItem>
                <SelectItem value="system">💻 Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select
              value={language}
              onValueChange={(value: 'es' | 'en') => handleLanguageChange(value)}
              disabled={isSavingAppearance}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}